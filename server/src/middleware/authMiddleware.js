import { AuthService } from '../services/authService.js';
import { AppError } from '../utils/AppError.js';

/**
 * JWT Authentication Middleware
 * 
 * Intercepts incoming HTTP requests, extracts and verifies the Authorization Bearer token,
 * and attaches the verified candidate identity to req.user.
 * 
 * Rejects unauthenticated, expired, or tampered requests with HTTP 401 Unauthorized.
 */
export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader) {
      throw new AppError('Authentication required: Missing Authorization header', 401);
    }

    // Verify Bearer schema
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new AppError('Invalid token format: Must follow "Bearer <token>" convention', 401);
    }

    const token = parts[1];
    if (!token || token.trim() === '') {
      throw new AppError('Authentication required: Token cannot be empty', 401);
    }

    // Verify HMAC signature and expiration
    const decodedUser = AuthService.verifyToken(token);

    // Attach verified user identity to request object
    req.user = decodedUser;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional Authentication Middleware
 * Attaches req.user if a valid Bearer token is supplied, but does not block unauthenticated requests.
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader) {
    return next();
  }

  try {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      const decodedUser = AuthService.verifyToken(parts[1]);
      req.user = decodedUser;
    }
  } catch (err) {
    // Silently continue as unauthenticated guest
  }

  next();
};

/**
 * Role-Based Access Control (RBAC) Authorization Middleware
 * @param  {...string} allowedRoles - e.g. 'STUDENT', 'RECRUITER', 'ADMIN'
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required before authorization check', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(`Access denied: Requires one of [${allowedRoles.join(', ')}] role`, 403));
    }

    next();
  };
};

export default { authenticate, authorizeRoles, optionalAuth };
