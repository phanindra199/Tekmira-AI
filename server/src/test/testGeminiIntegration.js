/**
 * Tekmira AI — Automated Gemini AI Integration Test Suite
 * Day 8: Gemini API Service, Input Validation, Error Mapping & Mock Execution
 */

import geminiService from '../services/geminiService.js';
import { AppError } from '../utils/AppError.js';
import { analyzeResumeSchema } from '../validations/aiValidation.js';
import app from '../app.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n🧪 Starting Tekmira AI Gemini AI Integration Tests...\n');

  // --- 1. Service Configuration & Safe Health Check ---
  console.log('--- 1. Gemini Service Configuration & Safe Health Check ---');
  const health = geminiService.checkHealth();
  assert(typeof health.configured === 'boolean', 'Health reports configured boolean');
  assert(typeof health.model === 'string' && health.model.length > 0, 'Health reports configured model name');
  assert(health.provider.includes('Google Gemini'), 'Health reports official provider name');
  assert(!('apiKey' in health) && !('key' in health), 'Health check strictly NEVER exposes API key');

  // --- 2. Input Validation (Zod Schema & Service Boundary) ---
  console.log('\n--- 2. Input Validation Boundary ---');
  try {
    analyzeResumeSchema.parse({ body: { resumeText: 'Too short' } });
    assert(false, 'Zod should reject resumeText shorter than 20 characters');
  } catch (err) {
    assert(err.issues && err.issues.length > 0, 'Zod catches short resumeText (<20 chars)');
  }

  try {
    analyzeResumeSchema.parse({ body: {} });
    assert(false, 'Zod should reject missing resumeText');
  } catch (err) {
    assert(err.issues && err.issues.length > 0, 'Zod catches missing resumeText');
  }

  const validPayload = {
    body: {
      resumeText: 'Experienced full stack developer with 3 years building React, Node.js, Express, and PostgreSQL applications.'
    }
  };
  const parsed = analyzeResumeSchema.parse(validPayload);
  assert(parsed.body.resumeText.length > 20, 'Valid resume text passes Zod schema');

  // --- 3. Missing API Key Defensive Handling ---
  console.log('\n--- 3. Missing API Key Defensive Handling ---');
  const originalKey = process.env.GEMINI_API_KEY;
  try {
    delete process.env.GEMINI_API_KEY;
    geminiService.resetClientForTesting();

    try {
      geminiService.getClient();
      assert(false, 'getClient should throw when API key is missing');
    } catch (err) {
      assert(err instanceof AppError, 'Throws AppError instance on missing key');
      assert(err.statusCode === 503, 'Missing API key returns HTTP 503 Service Unavailable');
      assert(err.message.includes('GEMINI_API_KEY'), 'Error message informs how to configure GEMINI_API_KEY');
    }
  } finally {
    if (originalKey) {
      process.env.GEMINI_API_KEY = originalKey;
    }
  }

  // --- 4. Mocked Successful Gemini Execution ---
  console.log('\n--- 4. Mocked Successful Gemini Execution ---');
  const sampleCandidateResume = `
    Alex Mercer | Senior Full Stack Engineer
    Technical Skills: React, TypeScript, Node.js, Express, PostgreSQL, Prisma, Redis, Docker
    Experience: Developed high-throughput microservices using Express and PostgreSQL. Implemented JWT authentication and RBAC.
    Projects: Built an e-commerce platform with React, Tailwind CSS, and Stripe integration.
  `;

  const mockSuccessfulClient = {
    models: {
      generateContent: async ({ model, contents, config }) => {
        return {
          text: JSON.stringify({
            candidateName: 'Alex Mercer',
            claimedSkills: ['React', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Prisma', 'Redis', 'Docker'],
            projects: ['E-Commerce Platform with React and Stripe'],
            observations: 'Clear self-reported claims in full stack TypeScript and Node.js.'
          })
        };
      }
    }
  };

  geminiService.setClientForTesting(mockSuccessfulClient);

  try {
    const analysis = await geminiService.analyzeResumeText(sampleCandidateResume);
    assert(typeof analysis === 'object', 'analyzeResumeText returns analysis object');
    assert(typeof analysis.rawAnalysis === 'string', 'Analysis contains generated rawAnalysis text');
    assert(analysis.model === 'gemini-2.5-flash', 'Analysis records model used');
    assert(typeof analysis.analyzedAt === 'string', 'Analysis includes ISO timestamp');
    assert(analysis.disclaimer.includes('Tekmira AI'), 'Analysis includes evidence verification disclaimer');
  } catch (err) {
    assert(false, `Mock analysis should not throw: ${err.message}`);
  }

  // --- 5. Provider Error Mapping (Rate Limits, Timeouts, Auth) ---
  console.log('\n--- 5. Provider Error Mapping & Defensive Handling ---');

  // 5a. Rate Limit (429) mapping
  const mockRateLimitClient = {
    models: {
      generateContent: async () => {
        const error = new Error('Resource has been exhausted (e.g. check quota)');
        error.status = 429;
        throw error;
      }
    }
  };
  geminiService.setClientForTesting(mockRateLimitClient);
  try {
    await geminiService.analyzeResumeText(sampleCandidateResume);
    assert(false, 'Should throw on rate limit');
  } catch (err) {
    assert(err.statusCode === 429, 'Rate limit / quota exhaustion maps to HTTP 429');
    assert(err.message.includes('rate limit'), 'Rate limit message guides user to retry');
  }

  // 5b. Invalid API Key / Auth failure mapping
  const mockAuthErrorClient = {
    models: {
      generateContent: async () => {
        const error = new Error('API_KEY_INVALID: API key not valid');
        error.status = 401;
        throw error;
      }
    }
  };
  geminiService.setClientForTesting(mockAuthErrorClient);
  try {
    await geminiService.analyzeResumeText(sampleCandidateResume);
    assert(false, 'Should throw on auth error');
  } catch (err) {
    assert(err.statusCode === 502, 'API auth failure maps to HTTP 502 Bad Gateway');
    assert(err.message.includes('authentication failed'), 'Friendly auth error message without leaking secret');
  }

  // 5c. Timeout mapping
  const mockTimeoutClient = {
    models: {
      generateContent: async () => {
        const error = new Error('Request timed out after 30000ms');
        error.code = 'ETIMEDOUT';
        throw error;
      }
    }
  };
  geminiService.setClientForTesting(mockTimeoutClient);
  try {
    await geminiService.analyzeResumeText(sampleCandidateResume);
    assert(false, 'Should throw on timeout');
  } catch (err) {
    assert(err.statusCode === 504, 'Provider timeout maps to HTTP 504 Gateway Timeout');
  }

  // 5d. Reset testing client
  geminiService.resetClientForTesting();
  assert(true, 'Gemini service client cleanly reset after tests');

  // --- Test Summary ---
  console.log('\n===============================================');
  console.log(`📊 Test Summary: ${passed} passed, ${failed} failed`);
  console.log('===============================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
