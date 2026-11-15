import { MatchingEngineService, SKILL_NORMALIZATION_MAP, DEFAULT_BENCHMARK_JOB } from '../services/matchingEngineService.js';
import { SkillAnalysisReport } from '../models/SkillAnalysisReport.js';

console.log('🧪 Starting Tekmira AI 3-Way Triangulation & Matching Engine Tests (Day 12)...\n');

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
  // =========================================================================
  // 1. Skill Normalization & Canonical Aliasing
  // =========================================================================
  console.log('--- 1. Skill Normalization & Canonical Aliasing ---');

  const normReact = MatchingEngineService.normalizeSkill('react.js');
  assert('Normalizes react.js to React', normReact.canonical === 'React' && normReact.category === 'FRONTEND');

  const normNode = MatchingEngineService.normalizeSkill('nodejs');
  assert('Normalizes nodejs to Node.js', normNode.canonical === 'Node.js' && normNode.category === 'BACKEND');

  const normPostgres = MatchingEngineService.normalizeSkill('postgresql');
  assert('Normalizes postgresql to PostgreSQL', normPostgres.canonical === 'PostgreSQL' && normPostgres.category === 'DATABASE');

  const normDocker = MatchingEngineService.normalizeSkill('dockerfile');
  assert('Normalizes dockerfile to Docker', normDocker.canonical === 'Docker' && normDocker.category === 'DEVOPS');

  const normJest = MatchingEngineService.normalizeSkill('jest');
  assert('Normalizes jest to Automated Testing', normJest.canonical === 'Automated Testing' && normJest.category === 'TESTING');

  const normPrisma = MatchingEngineService.normalizeSkill('@prisma/client');
  assert('Normalizes @prisma/client to Prisma ORM', normPrisma.canonical === 'Prisma ORM' && normPrisma.category === 'DATABASE');

  const normUnknown = MatchingEngineService.normalizeSkill('graphql subscriptions');
  assert('Handles unmapped technical skill cleanly with title-casing', 
    normUnknown.canonical === 'Graphql Subscriptions' && normUnknown.category === 'TECHNICAL');

  // =========================================================================
  // 2. 3-Way Triangulation Status Classification
  // =========================================================================
  console.log('\n--- 2. 3-Way Triangulation Status Classification ---');

  // Candidate Claims on Resume: React, Node.js, PostgreSQL, Docker (Docker has no code proof)
  const claimedSkills = [
    { name: 'React', category: 'FRONTEND', confidence: 0.95 },
    { name: 'Node.js', category: 'BACKEND', confidence: 0.90 },
    { name: 'PostgreSQL', category: 'DATABASE', confidence: 0.85 },
    { name: 'Docker', category: 'DEVOPS', confidence: 0.80 } // Inflated claim: zero repo evidence
  ];

  // Repository Snapshot Evidence: React, Node.js, PostgreSQL, Tailwind CSS, Jest
  const repoSnapshot = {
    repoName: 'Tekmira-AI-Capstone',
    repoUrl: 'https://github.com/candidate/tekmira-ai',
    languages: [
      { name: 'JavaScript', bytes: 75000, percentage: 75.0 },
      { name: 'HTML', bytes: 15000, percentage: 15.0 },
      { name: 'CSS', bytes: 10000, percentage: 10.0 }
    ],
    detectedDependencies: ['react', 'express', 'pg', 'tailwindcss', 'jest'],
    hasTestFiles: true
  };

  // Target Job: React, Node.js, Express.js, PostgreSQL, Git & Version Control, Docker
  const targetJob = {
    title: 'Junior Full Stack Engineer',
    requiredSkills: ['React', 'Node.js', 'Express.js', 'PostgreSQL', 'Git & Version Control'],
    preferredSkills: ['Docker', 'Automated Testing', 'Tailwind CSS']
  };

  const result = MatchingEngineService.triangulateSkills({
    claimedSkills,
    repoSnapshot,
    targetJob
  });

  const matrix = result.triangulationMatrix;

  // VERIFIED: React (Claimed + Demonstrated)
  const reactItem = matrix.find(m => m.skillName === 'React');
  assert('React is classified as VERIFIED', reactItem && reactItem.verificationStatus === 'VERIFIED');
  assert('Verified React includes concrete evidence citation', 
    reactItem.evidence.length > 0 && reactItem.evidence[0].filePath === 'package.json');

  // VERIFIED: PostgreSQL (Claimed + Demonstrated via 'pg' dependency)
  const pgItem = matrix.find(m => m.skillName === 'PostgreSQL');
  assert('PostgreSQL is classified as VERIFIED via pg alias', pgItem && pgItem.verificationStatus === 'VERIFIED');

  // INFLATED_CLAIM: Docker (Claimed in resume, but 0 evidence in repo)
  const dockerItem = matrix.find(m => m.skillName === 'Docker');
  assert('Docker is classified as INFLATED_CLAIM (Claimed without code proof)', 
    dockerItem && dockerItem.verificationStatus === 'INFLATED_CLAIM');
  assert('Inflated claim has 0 code evidence citations', dockerItem.evidence.length === 0);

  // UNCLAIMED_STRENGTH: Tailwind CSS & Automated Testing (Found in code, not on resume)
  const tailwindItem = matrix.find(m => m.skillName === 'Tailwind CSS');
  assert('Tailwind CSS is classified as UNCLAIMED_STRENGTH', 
    tailwindItem && tailwindItem.verificationStatus === 'UNCLAIMED_STRENGTH');

  const testingItem = matrix.find(m => m.skillName === 'Automated Testing');
  assert('Automated Testing is classified as UNCLAIMED_STRENGTH via test files', 
    testingItem && testingItem.verificationStatus === 'UNCLAIMED_STRENGTH');

  // MISSING_CRITICAL: Git & Version Control (Required by job, neither in resume nor demonstrated)
  const gitItem = matrix.find(m => m.skillName === 'Git & Version Control');
  assert('Git & Version Control is classified as MISSING_CRITICAL', 
    gitItem && gitItem.verificationStatus === 'MISSING_CRITICAL');

  // =========================================================================
  // 3. Placement Readiness Index (PRI) Formula & Scoring Bounds
  // =========================================================================
  console.log('\n--- 3. Placement Readiness Index (PRI) Mathematical Scoring ---');

  assert('Placement Readiness Index is a number', typeof result.overallReadinessScore === 'number');
  assert('PRI score stays strictly within [0, 100] bounds', 
    result.overallReadinessScore >= 0 && result.overallReadinessScore <= 100);
  assert('Candidate achieves strong placement score (> 65)', result.overallReadinessScore > 65);
  assert('Readiness tier is assigned based on score', typeof result.readinessTier === 'string');
  assert('Summary articulates exact verified count and coverage', 
    result.summary.includes('Placement Readiness Index') && result.summary.includes('verified by code proof'));

  // Metrics payload verification
  assert('Metrics records totalSkillsEvaluated', result.metrics.totalSkillsEvaluated > 5);
  assert('Metrics records verifiedCount', result.metrics.verifiedCount >= 2);
  assert('Metrics records inflatedCount as 1 (Docker)', result.metrics.inflatedCount === 1);
  assert('Metrics records unclaimedStrengthsCount >= 2', result.metrics.unclaimedStrengthsCount >= 2);
  assert('Metrics records testingRigorScore = 100 (test files + jest)', result.metrics.testingRigorScore === 100);

  // =========================================================================
  // 4. Actionable Remediation Plan
  // =========================================================================
  console.log('\n--- 4. Actionable Remediation Plan Generation ---');

  assert('Generates structured remediation items', result.remediationPlan.length > 0);
  
  const highSeverityItem = result.remediationPlan.find(r => r.gapSeverity === 'HIGH');
  assert('Creates HIGH severity remediation for MISSING_CRITICAL requirement', 
    highSeverityItem && highSeverityItem.recommendation.includes('Git & Version Control'));

  const mediumSeverityItem = result.remediationPlan.find(r => r.gapSeverity === 'MEDIUM');
  assert('Creates MEDIUM severity warning for INFLATED_CLAIM (Docker)', 
    mediumSeverityItem && mediumSeverityItem.recommendation.includes('Docker'));

  // =========================================================================
  // 5. MongoDB SkillAnalysisReport Schema Compliance
  // =========================================================================
  console.log('\n--- 5. MongoDB SkillAnalysisReport Schema Compliance ---');

  const reportDoc = new SkillAnalysisReport({
    userId: '11111111-2222-3333-4444-555555555555',
    jobId: '00000000-0000-0000-0000-000000000001',
    overallReadinessScore: result.overallReadinessScore,
    status: 'COMPLETED',
    summary: result.summary,
    triangulationMatrix: result.triangulationMatrix,
    remediationPlan: result.remediationPlan,
    metrics: result.metrics,
    aiModelUsed: 'gemini-2.5-flash',
    reportVersion: '1.0.0'
  });

  const schemaError = reportDoc.validateSync();
  assert('SkillAnalysisReport Mongoose document passes schema validation', !schemaError);
  assert('Report stores triangulation matrix items', reportDoc.triangulationMatrix.length > 0);
  assert('Report stores remediation plan items', reportDoc.remediationPlan.length > 0);

  // =========================================================================
  // Summary
  // =========================================================================
  console.log('\n===============================================');
  console.log(`📊 Test Summary: ${passed} passed, ${failed} failed`);
  console.log('===============================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Unhandled Matching Engine test failure:', err);
  process.exit(1);
});
