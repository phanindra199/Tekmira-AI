import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getPrismaClient } from '../config/database.js';
import { config } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

const SALT_ROUNDS = 10;

/**
 * Authentication Service
 * Manages password hashing, credential validation, and JWT token lifecycle
 */
export class AuthService {
  /**
   * Hashes plaintext password with cryptographically secure salt
   * @param {string} password - Plaintext password
   * @returns {Promise<string>} Bcrypt hash
   */
  static async hashPassword(password) {
    if (!password || password.length < 8) {
      throw new AppError('Password must be at least 8 characters long', 400);
    }
    return await bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Compares candidate plaintext password with stored bcrypt digest
   * @param {string} password - Plaintext input
   * @param {string} hash - Stored bcrypt hash
   * @returns {Promise<boolean>}
   */
  static async comparePassword(password, hash) {
    if (!password || !hash) return false;
    return await bcrypt.compare(password, hash);
  }

  /**
   * Signs a stateless JWT access token
   * @param {Object} user - Safe user identity payload
   * @returns {string} Signed JWT
   */
  static generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName
    };

    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
      algorithm: 'HS256'
    });
  }

  /**
   * Verifies and decodes a JWT token
   * @param {string} token - Raw JWT string
   * @returns {Object} Decoded payload
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Authentication session expired. Please sign in again.', 401);
      }
      throw new AppError('Invalid or malformed authentication token', 401);
    }
  }

  /**
   * Sanitizes user object to guarantee no password hash is returned
   * @param {Object} user - Raw database user record
   * @returns {Object} User without credentials
   */
  static sanitizeUser(user) {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Registers a new candidate student or recruiter
   * @param {Object} registrationData
   * @returns {Promise<{ user: Object, token: string }>}
   */
  static async register(registrationData) {
    const { email, password, fullName, githubHandle, collegeName, graduationYr, role } = registrationData;

    // 1. Input Validation
    if (!email || !email.includes('@')) {
      throw new AppError('A valid email address is required', 400);
    }
    if (!password || password.length < 8) {
      throw new AppError('Password must be at least 8 characters long', 400);
    }
    if (!fullName || fullName.trim().length === 0) {
      throw new AppError('Full name is required', 400);
    }

    const prisma = getPrismaClient();

    // 2. Check for Duplicate Email (Conflict: 409)
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existing) {
      throw new AppError('An account with this email address already exists. Please sign in.', 409);
    }

    // 3. Hash Password (never store plaintext)
    const passwordHash = await this.hashPassword(password);

    // 4. Create User in PostgreSQL
    const createdUser = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        fullName: fullName.trim(),
        githubHandle: githubHandle?.trim() || null,
        collegeName: collegeName?.trim() || null,
        graduationYr: graduationYr ? parseInt(graduationYr, 10) : null,
        role: role === 'RECRUITER' ? 'RECRUITER' : 'STUDENT'
      }
    });

    // 5. Generate Access Token & Sanitize
    const safeUser = this.sanitizeUser(createdUser);
    const token = this.generateToken(safeUser);

    return { user: safeUser, token };
  }

  /**
   * Authenticates user credentials and issues token
   * @param {Object} credentials - { email, password }
   * @returns {Promise<{ user: Object, token: string }>}
   */
  static async login({ email, password }) {
    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const prisma = getPrismaClient();

    // 1. Find User by Email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    // Timing-safe response: same error for non-existent user or wrong password
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // 2. Compare Password Hash
    const isMatch = await this.comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    // 3. Generate Access Token & Sanitize
    const safeUser = this.sanitizeUser(user);
    const token = this.generateToken(safeUser);

    return { user: safeUser, token };
  }

  /**
   * Fetches the current authenticated user's profile
   * @param {string} userId - PostgreSQL User UUID
   * @returns {Promise<Object>}
   */
  static async getCurrentUser(userId) {
    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        githubHandle: true,
        collegeName: true,
        graduationYr: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw new AppError('User profile not found', 404);
    }

    return user;
  }
}

export default AuthService;
