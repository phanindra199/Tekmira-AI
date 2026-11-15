import { normalizeApiError, ApiError } from './apiError.js';

/**
 * Tekmira AI — Client API Error Mapping Verification Test
 * Tests safe error normalization, sanitization, and AbortController handling
 */
console.log('🧪 Starting Tekmira AI Client Error Mapping Verification...\n');

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

// 1. Test Network / Server Offline Error
const mockNetworkError = new Error('Network Error');
const normalizedNetwork = normalizeApiError(mockNetworkError);
assert('Network error flag is set', normalizedNetwork.isNetworkError === true);
assert('Network error status code is 0', normalizedNetwork.statusCode === 0);
assert('Network error message is user-friendly', normalizedNetwork.message.includes('Network connection failed'));

// 2. Test 400 Validation Error
const mockValidationError = {
  response: {
    status: 400,
    data: {
      success: false,
      message: 'Invalid email format',
      errors: [{ field: 'email', message: 'Must be a valid college email' }]
    }
  }
};
const normalizedValidation = normalizeApiError(mockValidationError);
assert('Validation error status code is 400', normalizedValidation.statusCode === 400);
assert('Validation error type is VALIDATION_ERROR', normalizedValidation.type === 'VALIDATION_ERROR');
assert('Validation errors array is preserved', normalizedValidation.errors?.length === 1);

// 3. Test 401 Unauthorized Error
const mockAuthError = {
  response: {
    status: 401,
    data: { success: false, message: 'Invalid or expired JWT token' }
  }
};
const normalizedAuth = normalizeApiError(mockAuthError);
assert('Auth error status code is 401', normalizedAuth.statusCode === 401);
assert('Auth error type is UNAUTHORIZED', normalizedAuth.type === 'UNAUTHORIZED');

// 4. Test 404 Not Found Error
const mock404Error = {
  response: {
    status: 404,
    data: { success: false, message: 'Resource not found at /api/unknown' }
  }
};
const normalized404 = normalizeApiError(mock404Error);
assert('404 error status code is 404', normalized404.statusCode === 404);
assert('404 error type is NOT_FOUND', normalized404.type === 'NOT_FOUND');

// 5. Test 500 Internal Server Error (Sanitization test: NO STACK TRACE LEAK)
const mock500Error = {
  response: {
    status: 500,
    data: {
      success: false,
      message: 'Database connection failed: FATAL password authentication failed for user postgres',
      stack: 'Error at pg.connect(/var/app/db.js:42:15)'
    }
  }
};
const normalized500 = normalizeApiError(mock500Error);
assert('500 error status code is 500', normalized500.statusCode === 500);
assert('500 error type is SERVER_ERROR', normalized500.type === 'SERVER_ERROR');
assert('500 error does NOT leak database password or internal stack trace', 
  !normalized500.message.includes('postgres') && !normalized500.message.includes('FATAL'));
assert('500 error provides safe user message', 
  normalized500.message.includes('internal server error'));

// 6. Test AbortController Cancellation
const mockAbortError = new Error('The user aborted a request.');
mockAbortError.name = 'CanceledError';
const normalizedAbort = normalizeApiError(mockAbortError);
assert('Cancelled request flag is true', normalizedAbort.isCancelled === true);
assert('Cancelled request type is REQUEST_CANCELLED', normalizedAbort.type === 'REQUEST_CANCELLED');

console.log(`\n===============================================`);
console.log(`📊 Test Summary: ${passed} passed, ${failed} failed`);
console.log(`===============================================\n`);

if (failed > 0) {
  process.exit(1);
}
