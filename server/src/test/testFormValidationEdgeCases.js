/**
 * Tekmira AI — Form Validation & Boundary Edge Cases Test Suite (Day 15)
 * 
 * Verifies robust form inputs, client-server validation boundaries,
 * empty values, whitespace bypass prevention, URL formats, excessive lengths,
 * and structured 400 Bad Request error contracts.
 */

import assert from 'assert';
import { registerSchema, loginSchema } from '../validations/authValidation.js';
import { 
  fetchRepositoryEvidenceSchema, 
  triangulateSkillsSchema, 
  createResumeSchema 
} from '../validations/analysisValidation.js';
import { analyzeResumeSchema } from '../validations/aiValidation.js';
import { 
  createInterviewSessionSchema, 
  evaluateAnswerSchema 
} from '../validations/interviewValidation.js';

console.log('🧪 Starting Tekmira AI Form Validation & Boundary Edge Cases Tests (Day 15)...\n');

let totalTests = 0;
let passedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    console.error(`   Error: ${err.message}`);
  }
}

// ==========================================
// 1. Candidate Registration Form Edge Cases
// ==========================================
console.log('--- 1. Candidate Registration Form Edge Cases ---');

runTest('Rejects empty registration payload', () => {
  const result = registerSchema.safeParse({});
  assert.strictEqual(result.success, false);
  const issues = result.error.issues.map(i => i.path[0]);
  assert.ok(issues.includes('email'));
  assert.ok(issues.includes('password'));
  assert.ok(issues.includes('fullName'));
});

runTest('Rejects whitespace-only full name', () => {
  const result = registerSchema.safeParse({
    fullName: '   ',
    email: 'valid.student@university.edu',
    password: 'SecurePassword123'
  });
  assert.strictEqual(result.success, false);
});

runTest('Rejects malformed email formats', () => {
  const malformedEmails = ['plainaddress', 'missingdomain@', '@domain.com', 'user@.com'];
  for (const badEmail of malformedEmails) {
    const result = registerSchema.safeParse({
      fullName: 'Test Candidate',
      email: badEmail,
      password: 'SecurePassword123'
    });
    assert.strictEqual(result.success, false, `Should reject: ${badEmail}`);
  }
});

runTest('Rejects password under 8 characters', () => {
  const result = registerSchema.safeParse({
    fullName: 'Test Candidate',
    email: 'candidate@university.edu',
    password: 'short'
  });
  assert.strictEqual(result.success, false);
  assert.strictEqual(result.error.issues[0].message, 'Password must be at least 8 characters long');
});

runTest('Rejects password exceeding 128 characters', () => {
  const longPassword = 'a'.repeat(129);
  const result = registerSchema.safeParse({
    fullName: 'Test Candidate',
    email: 'candidate@university.edu',
    password: longPassword
  });
  assert.strictEqual(result.success, false);
  assert.strictEqual(result.error.issues[0].message, 'Password must not exceed 128 characters');
});

runTest('Rejects graduation year before 2020 or after 2035', () => {
  const tooEarly = registerSchema.safeParse({
    fullName: 'Test Candidate',
    email: 'candidate@university.edu',
    password: 'SecurePassword123',
    graduationYr: 2018
  });
  assert.strictEqual(tooEarly.success, false);

  const tooLate = registerSchema.safeParse({
    fullName: 'Test Candidate',
    email: 'candidate@university.edu',
    password: 'SecurePassword123',
    graduationYr: 2040
  });
  assert.strictEqual(tooLate.success, false);
});

runTest('Accepts valid registration payload with normalized email', () => {
  const validPayload = {
    fullName: '  Jane Doe  ',
    email: '  Jane.Doe@University.EDU  ',
    password: 'StrongPassword2026',
    graduationYr: 2026,
    collegeName: 'National Institute of Tech',
    githubHandle: 'janedoe-dev'
  };
  const result = registerSchema.safeParse(validPayload);
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.data.email, 'jane.doe@university.edu');
  assert.strictEqual(result.data.fullName, 'Jane Doe');
});

// ==========================================
// 2. Candidate Sign In Form Edge Cases
// ==========================================
console.log('\n--- 2. Candidate Sign In Form Edge Cases ---');

runTest('Rejects empty login payload', () => {
  const result = loginSchema.safeParse({});
  assert.strictEqual(result.success, false);
  assert.strictEqual(result.error.issues.length, 2);
});

runTest('Rejects empty or whitespace password on login', () => {
  const result = loginSchema.safeParse({
    email: 'user@example.com',
    password: ''
  });
  assert.strictEqual(result.success, false);
});

runTest('Normalizes valid login email to lowercase', () => {
  const result = loginSchema.safeParse({
    email: 'Student@Tekmira.AI',
    password: 'Password123'
  });
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.data.email, 'student@tekmira.ai');
});

// ==========================================
// 3. GitHub Mining URL & Email Edge Cases
// ==========================================
console.log('\n--- 3. GitHub Mining URL & Email Edge Cases ---');

runTest('Rejects non-GitHub repository URLs', () => {
  const nonGithubUrls = [
    'https://gitlab.com/owner/repository',
    'https://bitbucket.org/owner/repository',
    'https://google.com'
  ];
  for (const url of nonGithubUrls) {
    const result = fetchRepositoryEvidenceSchema.safeParse({ repoUrl: url });
    assert.strictEqual(result.success, false, `Should reject non-GitHub URL: ${url}`);
  }
});

runTest('Rejects malformed repository URL strings', () => {
  const malformed = ['not-a-url', 'http://', 'https://github.com', 'https://github.com/onlyowner'];
  for (const url of malformed) {
    const result = fetchRepositoryEvidenceSchema.safeParse({ repoUrl: url });
    assert.strictEqual(result.success, false, `Should reject: ${url}`);
  }
});

runTest('Accepts valid public GitHub repository URL', () => {
  const validUrls = [
    'https://github.com/phanindra199/Tekmira-AI',
    'https://github.com/facebook/react',
    'https://github.com/owner/repo-name_123/'
  ];
  for (const url of validUrls) {
    const result = fetchRepositoryEvidenceSchema.safeParse({ repoUrl: url });
    assert.strictEqual(result.success, true, `Should accept valid URL: ${url}`);
  }
});

runTest('Rejects invalid author commit email if provided', () => {
  const result = fetchRepositoryEvidenceSchema.safeParse({
    repoUrl: 'https://github.com/owner/repo',
    candidateEmail: 'invalid-email-string'
  });
  assert.strictEqual(result.success, false);
});

runTest('Allows empty or omitted author commit email', () => {
  const result = fetchRepositoryEvidenceSchema.safeParse({
    repoUrl: 'https://github.com/owner/repo',
    candidateEmail: ''
  });
  assert.strictEqual(result.success, true);
});

// ==========================================
// 4. Resume Text Stream Boundary Edge Cases
// ==========================================
console.log('\n--- 4. Resume Text Stream Boundary Edge Cases ---');

runTest('Rejects resume text under 20 characters', () => {
  const result = analyzeResumeSchema.safeParse({
    body: { resumeText: 'Too short' }
  });
  assert.strictEqual(result.success, false);
});

runTest('Rejects resume text exceeding 50,000 characters', () => {
  const longResume = 'A'.repeat(50001);
  const result = analyzeResumeSchema.safeParse({
    body: { resumeText: longResume }
  });
  assert.strictEqual(result.success, false);
});

runTest('Accepts calibrated technical resume text within bounds', () => {
  const validResume = 'Senior Full Stack Developer experienced with React, Node.js, PostgreSQL, and Docker.';
  const result = analyzeResumeSchema.safeParse({
    body: { resumeText: validResume }
  });
  assert.strictEqual(result.success, true);
});

// ==========================================
// 5. AI Viva Voce Form Boundary Edge Cases
// ==========================================
console.log('\n--- 5. AI Viva Voce Form Boundary Edge Cases ---');

runTest('Rejects interview session with empty target role', () => {
  const result = createInterviewSessionSchema.safeParse({
    targetRole: ' '
  });
  assert.strictEqual(result.success, false);
});

runTest('Rejects viva question evaluation with empty student answer', () => {
  const result = evaluateAnswerSchema.safeParse({
    questionIndex: 0,
    studentAnswer: '   '
  });
  assert.strictEqual(result.success, false);
});

runTest('Rejects viva student answer under 15 characters', () => {
  const result = evaluateAnswerSchema.safeParse({
    questionIndex: 0,
    studentAnswer: 'Too brief ans'
  });
  assert.strictEqual(result.success, false);
  assert.ok(result.error.issues[0].message.includes('at least 15 characters'));
});

runTest('Rejects viva student answer exceeding 4,000 characters', () => {
  const hugeAnswer = 'X'.repeat(4001);
  const result = evaluateAnswerSchema.safeParse({
    questionIndex: 0,
    studentAnswer: hugeAnswer
  });
  assert.strictEqual(result.success, false);
  assert.ok(result.error.issues[0].message.includes('cannot exceed 4,000 characters'));
});

runTest('Coerces string question index to number cleanly', () => {
  const result = evaluateAnswerSchema.safeParse({
    questionIndex: '2',
    studentAnswer: 'We implemented dual-token JWT rotation using HTTP-only cookies.'
  });
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.data.questionIndex, 2);
});

runTest('Rejects negative question index', () => {
  const result = evaluateAnswerSchema.safeParse({
    questionIndex: -1,
    studentAnswer: 'We implemented dual-token JWT rotation using HTTP-only cookies.'
  });
  assert.strictEqual(result.success, false);
});

// ==========================================
// 6. 3-Way Triangulation Boundary Validation
// ==========================================
console.log('\n--- 6. 3-Way Triangulation Boundary Validation ---');

runTest('Accepts empty triangulation payload for guest demo fallback', () => {
  const result = triangulateSkillsSchema.safeParse({});
  assert.strictEqual(result.success, true);
});

runTest('Rejects malformed repository URL in triangulation payload', () => {
  const result = triangulateSkillsSchema.safeParse({
    repoUrl: 'ftp://invalid-server.com'
  });
  assert.strictEqual(result.success, false);
});

runTest('Accepts valid triangulation request with repo URL and role', () => {
  const result = triangulateSkillsSchema.safeParse({
    repoUrl: 'https://github.com/phanindra199/Tekmira-AI',
    targetRole: 'Junior Full Stack Engineer'
  });
  assert.strictEqual(result.success, true);
});

// ==========================================
// Test Summary
// ==========================================
console.log('\n===============================================');
console.log(`📊 Test Summary: ${passedTests} passed, ${totalTests - passedTests} failed`);
console.log('===============================================\n');

if (totalTests !== passedTests) {
  process.exit(1);
}
