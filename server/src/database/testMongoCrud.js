import mongoose from 'mongoose';
import { ResumeDocument } from '../models/ResumeDocument.js';
import { RepositorySnapshot } from '../models/RepositorySnapshot.js';
import { SkillAnalysisReport } from '../models/SkillAnalysisReport.js';
import { checkMongoHealth } from '../config/mongoDatabase.js';
import { HealthService } from '../services/healthService.js';

console.log('🧪 Starting Tekmira AI MongoDB Document Modeling & Schema Verification...\n');

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
  // 1. Test Mongo Health Check Safety (Must not throw or leak credentials)
  console.log('--- Checking MongoDB Health Function ---');
  const mongoHealth = await checkMongoHealth();
  assert('Mongo health check returns structured status', typeof mongoHealth.status === 'string');
  assert('Mongo health check returns boolean connected property', typeof mongoHealth.connected === 'boolean');
  assert('Mongo health message does not leak credentials or URI', 
    !mongoHealth.message.includes('mongodb://') && !mongoHealth.message.includes('27017'));

  // 2. Test Polyglot Health Aggregator
  console.log('\n--- Checking Polyglot Health Aggregation (Relational + Document) ---');
  const fullHealth = await HealthService.getFullHealthInfo();
  assert('Polyglot health includes relational database provider', fullHealth.databases.relational.provider.includes('PostgreSQL'));
  assert('Polyglot health includes document database provider', fullHealth.databases.document.provider.includes('MongoDB'));

  // 3. Test ResumeDocument Schema Validation
  console.log('\n--- Testing ResumeDocument Schema Validation ---');
  const validResume = new ResumeDocument({
    userId: '11111111-2222-3333-4444-555555555555',
    fileName: 'alex_morgan_resume.pdf',
    fileSize: 1048576,
    mimeType: 'application/pdf',
    rawText: 'Alex Morgan. Final Year B.Tech CS student. Experienced in React, Node.js, and PostgreSQL.',
    extractedClaims: {
      skills: [
        { name: 'React', category: 'FRONTEND', confidence: 0.95 },
        { name: 'Node.js', category: 'BACKEND', confidence: 0.90 }
      ],
      projects: [
        { title: 'Campus Placement Portal', technologies: ['React', 'Express'], repoUrl: 'https://github.com/alexmorgan-dev/portal' }
      ],
      education: [
        { degree: 'B.Tech CS', institution: 'National Institute of Engineering', graduationYear: 2026 }
      ]
    }
  });

  let resumeValidationError = null;
  try {
    await validResume.validate();
  } catch (err) {
    resumeValidationError = err;
  }
  assert('Valid resume document passes Mongoose validation without errors', !resumeValidationError);
  assert('Embedded skills array length is preserved', validResume.extractedClaims.skills.length === 2);
  assert('Embedded skill category enum is valid', validResume.extractedClaims.skills[0].category === 'FRONTEND');

  // Test invalid resume (missing rawText)
  const invalidResume = new ResumeDocument({ userId: '123' });
  let resumeError = null;
  try {
    await invalidResume.validate();
  } catch (err) {
    resumeError = err;
  }
  assert('Invalid resume without required fields triggers validation error', !!resumeError);

  // 4. Test RepositorySnapshot Schema Validation
  console.log('\n--- Testing RepositorySnapshot Schema Validation ---');
  const validSnapshot = new RepositorySnapshot({
    userId: '11111111-2222-3333-4444-555555555555',
    githubHandle: 'alexmorgan-dev',
    repoName: 'tekmira-client',
    repoUrl: 'https://github.com/alexmorgan-dev/tekmira-client',
    isFork: false,
    stargazersCount: 5,
    languages: [
      { name: 'JavaScript', bytes: 85000, percentage: 85 },
      { name: 'CSS', bytes: 15000, percentage: 15 }
    ],
    authenticCommits: [
      {
        hash: 'a1b2c3d',
        message: 'feat: implement accessible design system and components',
        committedAt: new Date(),
        additions: 450,
        deletions: 20,
        verifiedAuthored: true
      }
    ],
    detectedDependencies: ['react', 'tailwindcss', 'axios'],
    hasTestFiles: true
  });

  let snapshotValidationError = null;
  try {
    await validSnapshot.validate();
  } catch (err) {
    snapshotValidationError = err;
  }
  assert('Valid repository snapshot passes Mongoose validation', !snapshotValidationError);
  assert('Authentic commit verifiedAuthored flag is true', validSnapshot.authenticCommits[0].verifiedAuthored === true);
  assert('Detected dependencies array contains tailwindcss', validSnapshot.detectedDependencies.includes('tailwindcss'));

  // 5. Test SkillAnalysisReport Schema Validation (3-Way Triangulation)
  console.log('\n--- Testing SkillAnalysisReport Schema Validation ---');
  const validReport = new SkillAnalysisReport({
    userId: '11111111-2222-3333-4444-555555555555',
    jobId: '99999999-8888-7777-6666-555555555555',
    overallReadinessScore: 84.5,
    status: 'COMPLETED',
    summary: 'Candidate demonstrates strong evidence for React and Node.js. Missing critical unit testing.',
    triangulationMatrix: [
      {
        skillName: 'React',
        isClaimedInResume: true,
        isDemonstratedInCode: true,
        isRequiredInJob: true,
        verificationStatus: 'VERIFIED',
        evidence: [
          { repoName: 'tekmira-client', commitHash: 'a1b2c3d', confidenceScore: 92 }
        ]
      },
      {
        skillName: 'Docker',
        isClaimedInResume: true,
        isDemonstratedInCode: false,
        isRequiredInJob: true,
        verificationStatus: 'INFLATED_CLAIM'
      }
    ],
    remediationPlan: [
      {
        skill: 'Docker',
        gapSeverity: 'HIGH',
        recommendation: 'Containerize backend Express API with multi-stage Dockerfile and docker-compose.'
      }
    ],
    metrics: {
      totalSkillsEvaluated: 2,
      verifiedCount: 1,
      inflatedCount: 1,
      missingCriticalCount: 0,
      unclaimedStrengthsCount: 0
    }
  });

  let reportValidationError = null;
  try {
    await validReport.validate();
  } catch (err) {
    reportValidationError = err;
  }
  assert('Valid 3-way triangulation report passes schema validation', !reportValidationError);
  assert('Triangulation matrix contains VERIFIED status', validReport.triangulationMatrix[0].verificationStatus === 'VERIFIED');
  assert('Triangulation matrix catches INFLATED_CLAIM for Docker', validReport.triangulationMatrix[1].verificationStatus === 'INFLATED_CLAIM');

  console.log(`\n===============================================`);
  console.log(`📊 Test Summary: ${passed} passed, ${failed} failed`);
  console.log(`===============================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
