/**
 * Tekmira AI — HTTP API Integration Test Suite (Day 16)
 * 
 * Verifies end-to-end HTTP request/response lifecycles, authentication boundaries,
 * protected route guards, PDF binary upload, GitHub mining, triangulation,
 * AI viva voce session generation, and centralized error handling.
 * 
 * Implements a Supertest-fluent builder over Node 22's native HTTP stack,
 * ensuring high performance, zero socket exhaustion, and 100% deterministic assertion.
 */

process.env.NODE_ENV = 'test';

import assert from 'assert';
import app from '../../app.js';
import { AuthService } from '../../services/authService.js';

console.log('🧪 Starting Tekmira AI HTTP API Integration Tests (Day 16)...\n');

let totalTests = 0;
let passedTests = 0;

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    console.error(`   Error: ${err.message}`);
  }
}

/**
 * Creates a fluent Supertest-compatible test harness over Node's native HTTP stack
 * Eliminates Windows Node 22 TCP socket reset (ECONNRESET) bugs while preserving
 * standard supertest syntax: req.get(), req.post().send(), req.attach(), etc.
 */
function createTestAgent(expressApp) {
  let server = null;
  let port = null;

  async function ensureServer() {
    if (!server) {
      await new Promise((resolve) => {
        server = expressApp.listen(0, '127.0.0.1', () => {
          port = server.address().port;
          resolve();
        });
      });
    }
    return `http://127.0.0.1:${port}`;
  }

  function createBuilder(method, path) {
    const headers = {};
    let body = null;
    const attachments = [];

    const builder = {
      set(key, value) {
        headers[key] = value;
        return builder;
      },
      send(data) {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(data);
        return builder;
      },
      attach(fieldName, bufferOrString, options = {}) {
        attachments.push({ fieldName, data: bufferOrString, options });
        return builder;
      },
      async then(resolve, reject) {
        try {
          const baseUrl = await ensureServer();
          let fetchBody = body;
          const fetchHeaders = { ...headers };

          if (attachments.length > 0) {
            const formData = new FormData();
            for (const att of attachments) {
              const filename = att.options.filename || 'file.bin';
              const type = att.options.contentType || 'application/octet-stream';
              const blob = new Blob([att.data], { type });
              formData.append(att.fieldName, blob, filename);
            }
            fetchBody = formData;
            delete fetchHeaders['Content-Type'];
          }

          const res = await fetch(baseUrl + path, {
            method,
            headers: fetchHeaders,
            body: fetchBody
          });

          let responseBody = null;
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            responseBody = await res.json();
          } else {
            responseBody = await res.text();
          }

          const responseWrapper = {
            status: res.status,
            statusCode: res.status,
            body: responseBody,
            headers: Object.fromEntries(res.headers.entries())
          };

          resolve(responseWrapper);
        } catch (err) {
          reject(err);
        }
      }
    };
    return builder;
  }

  return {
    get: (path) => createBuilder('GET', path),
    post: (path) => createBuilder('POST', path),
    put: (path) => createBuilder('PUT', path),
    patch: (path) => createBuilder('PATCH', path),
    delete: (path) => createBuilder('DELETE', path),
    close: () => {
      if (server) {
        server.close();
        server = null;
      }
    }
  };
}

async function startSuite() {
  const req = createTestAgent(app);

  try {
    // Test Candidate Identity & Tokens
    const testCandidate = {
      id: 'test-student-uuid-2026',
      email: 'candidate.integration@university.edu',
      role: 'STUDENT',
      fullName: 'Integration Test Candidate'
    };
    const validToken = AuthService.generateToken(testCandidate);
    const tamperedToken = validToken + 'malicious-suffix';

    // ==========================================
    // 1. Health & System Diagnostics Endpoints
    // ==========================================
    console.log('--- 1. Health & Diagnostics Endpoints ---');

    await runAsyncTest('GET /api/health returns 200 and ONLINE status', async () => {
      const res = await req.get('/api/health');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.message);
    });

    await runAsyncTest('GET /api/v1/health returns 200 via v1 prefix router', async () => {
      const res = await req.get('/api/v1/health');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
    });

    // ==========================================
    // 2. Authentication & Credential Boundaries
    // ==========================================
    console.log('\n--- 2. Authentication & Credential Boundaries ---');

    await runAsyncTest('POST /api/v1/auth/register rejects empty payload with 400', async () => {
      const res = await req
        .post('/api/v1/auth/register')
        .send({});
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.errors);
    });

    await runAsyncTest('POST /api/v1/auth/register accepts valid candidate with 200/201', async () => {
      const res = await req
        .post('/api/v1/auth/register')
        .send({
          fullName: 'Supertest Student',
          email: `student.${Date.now()}@university.edu`,
          password: 'Password123!',
          graduationYr: 2026
        });
      assert.ok(res.status === 200 || res.status === 201);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.token);
      assert.strictEqual(res.body.data.user.passwordHash, undefined);
    });

    await runAsyncTest('POST /api/v1/auth/login rejects invalid email format with 400', async () => {
      const res = await req
        .post('/api/v1/auth/login')
        .send({ email: 'not-an-email', password: 'Password123' });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
    });

    await runAsyncTest('POST /api/v1/auth/login rejects incorrect password with 401', async () => {
      const res = await req
        .post('/api/v1/auth/login')
        .send({ email: 'candidate@university.edu', password: 'WrongPassword123!' });
      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
    });

    // ==========================================
    // 3. Protected Route Security & RBAC Guards
    // ==========================================
    console.log('\n--- 3. Protected Routes & RBAC Guards ---');

    await runAsyncTest('GET /api/v1/users/me rejects missing Authorization with 401', async () => {
      const res = await req.get('/api/v1/users/me');
      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes('Authentication required') || res.body.message.includes('Authorization'));
    });

    await runAsyncTest('GET /api/v1/users/me rejects tampered JWT signature with 401', async () => {
      const res = await req
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${tamperedToken}`);
      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
    });

    await runAsyncTest('GET /api/v1/users/me allows verified Bearer token with 200', async () => {
      const res = await req
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${validToken}`);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.user.id, testCandidate.id);
      assert.strictEqual(res.body.data.user.email, testCandidate.email);
      assert.strictEqual(res.body.data.user.passwordHash, undefined, 'Must never leak passwordHash');
    });

    // ==========================================
    // 4. Resume Upload & Magic Byte Enforcement
    // ==========================================
    console.log('\n--- 4. Resume Upload & Binary Ingestion ---');

    await runAsyncTest('POST /api/v1/analysis/resumes/upload rejects request without file with 400', async () => {
      const res = await req
        .post('/api/v1/analysis/resumes/upload');
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
    });

    await runAsyncTest('POST /api/v1/analysis/resumes/upload rejects spoofed file lacking %PDF- with 400', async () => {
      const fakeBuffer = Buffer.from('MZ Fake Executable Content Instead of PDF');
      const res = await req
        .post('/api/v1/analysis/resumes/upload')
        .attach('resume', fakeBuffer, { filename: 'malicious.pdf', contentType: 'application/pdf' });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes('PDF') || res.body.message.includes('%PDF-'));
    });

    await runAsyncTest('POST /api/v1/analysis/resumes/upload accepts authentic PDF buffer with 201', async () => {
      const minimalPdf = '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n190\n%%EOF';
      const pdfBuffer = Buffer.from(minimalPdf);

      const res = await req
        .post('/api/v1/analysis/resumes/upload?allowScanned=true')
        .attach('resume', pdfBuffer, { filename: 'valid_candidate_resume.pdf', contentType: 'application/pdf' });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.sha256Hash);
      assert.strictEqual(res.body.data.sha256Hash.length, 64, 'SHA-256 hash must be 64 hexadecimal chars');
    });

    // ==========================================
    // 5. GitHub Evidence Mining Endpoints
    // ==========================================
    console.log('\n--- 5. GitHub Evidence Mining Endpoints ---');

    await runAsyncTest('POST /api/v1/analysis/repositories/fetch rejects non-GitHub URL with 400', async () => {
      const res = await req
        .post('/api/v1/analysis/repositories/fetch')
        .send({ repoUrl: 'https://gitlab.com/owner/repo' });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.errors.some(e => e.message.includes('GitHub repository URL')));
    });

    await runAsyncTest('POST /api/v1/analysis/repositories/fetch accepts valid GitHub URL with 200', async () => {
      const res = await req
        .post('/api/v1/analysis/repositories/fetch')
        .send({ repoUrl: 'https://github.com/phanindra199/Tekmira-AI' });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.repoName);
      assert.ok(Array.isArray(res.body.data.languages));
    });

    // ==========================================
    // 6. 3-Way Triangulation Endpoints
    // ==========================================
    console.log('\n--- 6. 3-Way Triangulation Endpoints ---');

    await runAsyncTest('POST /api/v1/analysis/triangulate calculates Placement Readiness Index', async () => {
      const res = await req
        .post('/api/v1/analysis/triangulate')
        .send({
          repoUrl: 'https://github.com/phanindra199/Tekmira-AI',
          targetRole: 'Junior Full Stack Engineer'
        });
      assert.ok(res.status === 200 || res.status === 201);
      assert.strictEqual(res.body.success, true);
      assert.ok(typeof res.body.data.overallReadinessScore === 'number');
      assert.ok(res.body.data.overallReadinessScore >= 0 && res.body.data.overallReadinessScore <= 100);
      assert.ok(Array.isArray(res.body.data.triangulationMatrix));
    });

    // ==========================================
    // 7. AI Technical Viva Voce Endpoints
    // ==========================================
    console.log('\n--- 7. AI Technical Viva Voce Endpoints ---');

    let activeSessionId = null;

    await runAsyncTest('POST /api/v1/interview/sessions creates grounded viva session', async () => {
      const res = await req
        .post('/api/v1/interview/sessions')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          targetRole: 'Junior Full Stack Engineer',
          difficulty: 'INTERMEDIATE'
        });
      assert.ok(res.status === 200 || res.status === 201);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.sessionId || res.body.data._id);
      assert.ok(Array.isArray(res.body.data.questions));
      assert.ok(res.body.data.questions.length >= 1);
      assert.ok(res.body.data.questions[0].fileCitation);
      activeSessionId = res.body.data.sessionId || res.body.data._id;
    });

    await runAsyncTest('POST /api/v1/interview/sessions/:id/evaluate rejects answer < 15 chars with 400', async () => {
      const res = await req
        .post(`/api/v1/interview/sessions/${activeSessionId}/evaluate`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          questionIndex: 0,
          studentAnswer: 'Short'
        });
      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.errors.some(e => e.message.includes('at least 15 characters')));
    });

    await runAsyncTest('POST /api/v1/interview/sessions/:id/evaluate evaluates substantive answer with 200', async () => {
      const res = await req
        .post(`/api/v1/interview/sessions/${activeSessionId}/evaluate`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          questionIndex: 0,
          studentAnswer: 'In server/src/database/health.js, we verify database connectivity with timeout bounds and strip credentials from catch blocks to prevent credential leakage.'
        });
      assert.ok(res.status === 200 || res.status === 201);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.evaluation);
      assert.ok(typeof res.body.data.evaluation.score === 'number');
      assert.ok(res.body.data.evaluation.rubricBreakdown);
    });

    // ==========================================
    // 8. Centralized 404 Route & Contract
    // ==========================================
    console.log('\n--- 8. Centralized 404 Route & Contract ---');

    await runAsyncTest('GET /api/v1/non-existent returns structured 404', async () => {
      const res = await req.get('/api/v1/non-existent-route-endpoint');
      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes('not found') || res.body.message.includes('Cannot'));
    });

    // ==========================================
    // Test Summary
    // ==========================================
    console.log('\n===============================================');
    console.log(`📊 HTTP API Integration Summary: ${passedTests}/${totalTests} passed`);
    console.log('===============================================\n');

  } catch (err) {
    console.error('Test Suite Execution Error:', err);
  } finally {
    req.close();
  }

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

startSuite().catch(err => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
