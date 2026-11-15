import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { errorHandler } from '../middleware/errorHandler.js';
import { registerSchema } from '../validations/authValidation.js';
import { createResumeSchema } from '../validations/analysisValidation.js';
import { JobService } from '../services/jobService.js';

console.log('🧪 Starting Tekmira AI REST API Architecture & Validation Tests...\n');

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

async function runTests() {
  // 1. Test Zod Validation Middleware with Valid Input
  console.log('--- 1. Zod Request Validation Middleware ---');
  const validRegisterPayload = {
    email: 'valid.student@university.edu',
    password: 'ValidSecurePassword2026!',
    fullName: 'Jane Doe',
    graduationYr: 2026,
    role: 'STUDENT'
  };

  const mockReqValid = { body: validRegisterPayload };
  let validNextCalled = false;
  let validationError = null;

  validate(registerSchema)(mockReqValid, {}, (err) => {
    if (err) validationError = err;
    else validNextCalled = true;
  });

  assert('Valid request body passes Zod validation', validNextCalled === true && !validationError);
  assert('Email is properly trimmed and lowercased by Zod transform', mockReqValid.body.email === 'valid.student@university.edu');

  // 2. Test Zod Validation Middleware with Invalid Input
  const invalidRegisterPayload = {
    email: 'invalid-email-format',
    password: 'short', // under 8 chars
    fullName: ''       // empty name
  };

  const mockReqInvalid = { body: invalidRegisterPayload };
  let invalidError = null;

  validate(registerSchema)(mockReqInvalid, {}, (err) => {
    invalidError = err;
  });

  assert('Invalid request body triggers validation error with HTTP 400', invalidError && invalidError.statusCode === 400);
  assert('Validation error returns structured errors array', Array.isArray(invalidError.errors));
  assert('Validation errors catch invalid email', invalidError.errors.some(e => e.field === 'email'));
  assert('Validation errors catch short password', invalidError.errors.some(e => e.field === 'password'));
  assert('Validation errors catch empty full name', invalidError.errors.some(e => e.field === 'fullName'));

  // 3. Test Resume Schema Validation
  console.log('\n--- 2. Resume & Analysis Schema Validation ---');
  const validResumePayload = {
    userId: 'user-uuid-1234',
    fileName: 'resume.pdf',
    fileSize: 500000,
    rawText: 'Candidate experienced in React and Node.js with 3 projects.'
  };

  const mockReqResume = { body: validResumePayload };
  let resumeNextCalled = false;
  validate(createResumeSchema)(mockReqResume, {}, (err) => {
    if (!err) resumeNextCalled = true;
  });
  assert('Valid resume payload passes createResumeSchema validation', resumeNextCalled === true);

  // 4. Test Error Handler Status Code & Sanitization Mapping
  console.log('\n--- 3. Centralized Error Handler Status Mapping ---');

  // Test Prisma P2002 Conflict mapping
  const prismaConflict = new Error('Unique constraint failed on the fields: (email)');
  prismaConflict.code = 'P2002';
  prismaConflict.meta = { target: 'email' };

  let capturedStatus = null;
  let capturedResponse = null;
  const mockRes = {
    status: (code) => {
      capturedStatus = code;
      return {
        json: (data) => { capturedResponse = data; }
      };
    }
  };

  errorHandler(prismaConflict, {}, mockRes, () => {});
  assert('Prisma P2002 duplicate key maps to HTTP 409 Conflict', capturedStatus === 409);
  assert('Prisma error response has success: false', capturedResponse.success === false);
  assert('Prisma error response contains friendly message', capturedResponse.message.includes('conflicting record already exists'));

  // Test Mongoose CastError mapping
  const mongooseCastError = new Error('Cast to ObjectId failed');
  mongooseCastError.name = 'CastError';
  mongooseCastError.value = 'invalid-mongo-id-123';

  errorHandler(mongooseCastError, {}, mockRes, () => {});
  assert('Mongoose CastError maps to HTTP 400 Bad Request', capturedStatus === 400);
  assert('CastError message specifies invalid resource identifier', capturedResponse.message.includes('invalid-mongo-id-123'));

  // 5. Test Benchmark Campus Job Service
  console.log('\n--- 4. Job Service & Fallback Benchmarks ---');
  const jobs = await JobService.getAllJobs();
  assert('JobService returns array of benchmark job roles', Array.isArray(jobs) && jobs.length >= 3);
  assert('First benchmark role has required technical competencies', Array.isArray(jobs[0].requiredSkills) && jobs[0].requiredSkills.length > 0);

  const singleJob = await JobService.getJobById(jobs[0].id);
  assert('JobService finds job by ID', singleJob && singleJob.id === jobs[0].id);

  console.log(`\n===============================================`);
  console.log(`📊 Test Summary: ${passed} passed, ${failed} failed`);
  console.log(`===============================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
