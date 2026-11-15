import jwt from 'jsonwebtoken';
import { AuthService } from '../services/authService.js';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';
import { config } from '../config/env.js';

console.log('🧪 Starting Tekmira AI Authentication & Security Verification Tests...\n');

let passed = 0;
let failed = 0;

function assert(description, condition) {
  if (condition) {
    console.log(`✅ PASS: ${description}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${description}`);
    failed++;
  }
}

async function runSecurityTests() {
  // 1. Password Hashing Security Tests
  console.log('--- 1. Password Hashing & Bcrypt Salts ---');
  const rawPassword = 'SuperSecretPassword2026!';
  const hash1 = await AuthService.hashPassword(rawPassword);
  const hash2 = await AuthService.hashPassword(rawPassword);

  assert('Hash is generated and starts with bcrypt prefix $2', hash1.startsWith('$2'));
  assert('Password hash length is at least 60 characters', hash1.length >= 60);
  assert('Hash does NOT contain plaintext password', !hash1.includes(rawPassword));
  assert('Two hashes of the same password produce distinct digests (Bcrypt Salt Test)', hash1 !== hash2);

  // Short password rejection
  let shortPasswordError = null;
  try {
    await AuthService.hashPassword('short');
  } catch (err) {
    shortPasswordError = err;
  }
  assert('Passwords under 8 characters are strictly rejected', shortPasswordError && shortPasswordError.statusCode === 400);

  // 2. Password Comparison Tests
  console.log('\n--- 2. Password Verification ---');
  const isMatch = await AuthService.comparePassword(rawPassword, hash1);
  const isWrongMatch = await AuthService.comparePassword('WrongPassword123!', hash1);
  assert('Authentic password matches stored hash', isMatch === true);
  assert('Incorrect password is rejected by hash comparison', isWrongMatch === false);

  // 3. JWT Token Generation & Anatomy
  console.log('\n--- 3. JWT Anatomy & Claims ---');
  const mockUser = {
    id: 'user-uuid-1234',
    email: 'alex.morgan@tekmira.ai',
    role: 'STUDENT',
    fullName: 'Alex Morgan'
  };

  const token = AuthService.generateToken(mockUser);
  const segments = token.split('.');
  assert('JWT consists of exactly 3 dot-separated Base64 segments', segments.length === 3);

  const decoded = AuthService.verifyToken(token);
  assert('Decoded token contains user id claim', decoded.id === mockUser.id);
  assert('Decoded token contains user email claim', decoded.email === mockUser.email);
  assert('Decoded token contains user role claim', decoded.role === mockUser.role);
  assert('Decoded token does NOT contain passwordHash', decoded.passwordHash === undefined);

  // 4. Token Tampering & Expiration Security
  console.log('\n--- 4. Token Tampering & Rejection ---');
  // Tamper token payload by replacing characters in signature
  const tamperedToken = token.slice(0, -5) + 'XXXXX';
  let tamperError = null;
  try {
    AuthService.verifyToken(tamperedToken);
  } catch (err) {
    tamperError = err;
  }
  assert('Tampered token signature is rejected with 401 Unauthorized', tamperError && tamperError.statusCode === 401);

  // Expired token test
  const expiredToken = jwt.sign(mockUser, config.jwtSecret, { expiresIn: '0s' });
  let expiredError = null;
  try {
    AuthService.verifyToken(expiredToken);
  } catch (err) {
    expiredError = err;
  }
  assert('Expired token is rejected with 401 Unauthorized', expiredError && expiredError.statusCode === 401);

  // 5. Authentication Middleware Pipeline Tests
  console.log('\n--- 5. Authentication Middleware Execution ---');
  
  // Test missing header
  let missingHeaderError = null;
  const mockReqMissing = { headers: {} };
  authenticate(mockReqMissing, {}, (err) => { missingHeaderError = err; });
  assert('Missing Authorization header halts pipeline with 401', missingHeaderError && missingHeaderError.statusCode === 401);

  // Test malformed header
  let malformedHeaderError = null;
  const mockReqMalformed = { headers: { authorization: 'Basic dXNlcjpwYXNz' } };
  authenticate(mockReqMalformed, {}, (err) => { malformedHeaderError = err; });
  assert('Non-Bearer Authorization header halts pipeline with 401', malformedHeaderError && malformedHeaderError.statusCode === 401);

  // Test valid Bearer token
  let validMiddlewareCalled = false;
  const mockReqValid = { headers: { authorization: `Bearer ${token}` } };
  authenticate(mockReqValid, {}, (err) => {
    if (!err) validMiddlewareCalled = true;
  });
  assert('Valid Bearer token allows request to proceed to next middleware', validMiddlewareCalled === true);
  assert('Verified identity is attached to req.user', mockReqValid.user && mockReqValid.user.id === mockUser.id);

  // 6. Role Authorization Middleware Tests
  console.log('\n--- 6. Role-Based Access Control (RBAC) ---');
  const requireAdmin = authorizeRoles('ADMIN');
  let forbiddenError = null;
  requireAdmin(mockReqValid, {}, (err) => { forbiddenError = err; });
  assert('STUDENT accessing ADMIN route receives 403 Forbidden', forbiddenError && forbiddenError.statusCode === 403);

  const requireStudent = authorizeRoles('STUDENT');
  let studentAllowed = false;
  requireStudent(mockReqValid, {}, (err) => {
    if (!err) studentAllowed = true;
  });
  assert('STUDENT accessing STUDENT route is allowed to proceed', studentAllowed === true);

  // 7. User Credential Sanitization
  console.log('\n--- 7. Credential Leak Prevention ---');
  const userWithSecrets = {
    id: 'user-uuid-999',
    email: 'test@tekmira.ai',
    fullName: 'Test Candidate',
    passwordHash: '$2b$10$superSecretHashThatMustNeverBeReturnedInResponses'
  };
  const sanitized = AuthService.sanitizeUser(userWithSecrets);
  assert('Sanitized user object has passwordHash completely stripped', sanitized.passwordHash === undefined);
  assert('Sanitized user preserves public identity fields', sanitized.id === 'user-uuid-999' && sanitized.email === 'test@tekmira.ai');

  console.log(`\n===============================================`);
  console.log(`📊 Test Summary: ${passed} passed, ${failed} failed`);
  console.log(`===============================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityTests();
