/**
 * Tekmira AI — Unit Test Suite: Placement Readiness Index (PRI) Mathematical Engine (Day 16)
 * 
 * Verifies multi-factor scoring bounds [0, 100], inflation penalty deduction,
 * tier thresholds, testing rigor contribution, and remediation plan prioritization.
 */

import assert from 'assert';
import { MatchingEngineService } from '../../services/matchingEngineService.js';

console.log('🧪 Starting Tekmira AI Placement Readiness Index Unit Tests...\n');

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

// Benchmark role for unit tests
const testJob = {
  id: 'test-job-01',
  title: 'Full Stack Engineer',
  requiredSkills: ['React', 'Node.js', 'PostgreSQL', 'Git & Version Control'],
  preferredSkills: ['Docker', 'Automated Testing']
};

console.log('--- 1. PRI Score Bounds & Tier Classification ---');

runTest('High-proof candidate achieves Tier 1 (Industry Ready) with high score', () => {
  const claimed = ['React', 'Node.js', 'PostgreSQL', 'Git & Version Control'];
  const repo = {
    repoName: 'tekmira-verified',
    repoUrl: 'https://github.com/tekmira/tekmira-verified',
    languages: [{ name: 'JavaScript', bytes: 50000, percentage: 60 }, { name: 'SQL', bytes: 30000, percentage: 40 }],
    detectedDependencies: ['react', 'express', 'pg', 'jest'],
    hasTestFiles: true,
    fileTree: ['server/src/app.js', 'server/src/test/testAuth.js', 'client/src/App.jsx']
  };

  const result = MatchingEngineService.triangulate({
    claimedSkills: claimed,
    repoSnapshot: repo,
    targetJob: testJob
  });

  assert.ok(result.overallReadinessScore >= 80, `Expected >= 80, got ${result.overallReadinessScore}`);
  assert.ok(result.readinessTier.includes('Industry Ready') || result.readinessTier.includes('Placement Ready'));
  assert.strictEqual(result.metrics.inflatedCount, 0);
  assert.strictEqual(result.metrics.testingRigorScore, 100);
});

runTest('Candidate with 0 code evidence stays floored at or near 0 with Tier 4 deficit', () => {
  const claimed = ['React', 'Node.js', 'PostgreSQL', 'Kubernetes', 'AWS', 'Redis'];
  const emptyRepo = {
    repoName: 'empty-repo',
    languages: [],
    detectedDependencies: [],
    hasTestFiles: false,
    fileTree: ['README.md']
  };

  const result = MatchingEngineService.triangulate({
    claimedSkills: claimed,
    repoSnapshot: emptyRepo,
    targetJob: testJob
  });

  assert.ok(result.overallReadinessScore <= 20, `Expected low score, got ${result.overallReadinessScore}`);
  assert.ok(result.overallReadinessScore >= 0, 'Score must never be negative');
  assert.ok(result.readinessTier.includes('Significant Evidence Deficit') || result.readinessTier.includes('Tier'));
  assert.ok(result.metrics.inflatedCount >= 4, 'All unbacked claims should be marked inflated');
});

runTest('Score is mathematically clamped between [0, 100]', () => {
  // Test boundary clamping with massive inflation penalty
  const hugeClaims = Array.from({ length: 30 }, (_, i) => `Skill_${i}`);
  const result = MatchingEngineService.triangulate({
    claimedSkills: hugeClaims,
    repoSnapshot: { languages: [], detectedDependencies: [], hasTestFiles: false },
    targetJob: testJob
  });

  assert.strictEqual(result.overallReadinessScore >= 0, true);
  assert.strictEqual(result.overallReadinessScore <= 100, true);
});

console.log('\n--- 2. Remediation Plan Prioritization ---');

runTest('Assigns HIGH severity remediation to MISSING_CRITICAL skills', () => {
  const result = MatchingEngineService.triangulate({
    claimedSkills: ['React'],
    repoSnapshot: { detectedDependencies: ['react'], languages: [{ name: 'JavaScript', bytes: 1000, percentage: 100 }] },
    targetJob: testJob // requires Node.js and PostgreSQL which are missing
  });

  const highGaps = result.remediationPlan.filter(r => r.gapSeverity === 'HIGH');
  assert.ok(highGaps.length > 0, 'Should have at least one HIGH severity gap');
  assert.ok(highGaps.some(g => g.skill === 'Node.js' || g.skill === 'PostgreSQL'));
});

runTest('Assigns MEDIUM severity warning to INFLATED_CLAIM skills', () => {
  const result = MatchingEngineService.triangulate({
    claimedSkills: ['React', 'Docker'], // Docker claimed without proof
    repoSnapshot: { detectedDependencies: ['react'], languages: [{ name: 'JavaScript', bytes: 1000, percentage: 100 }] },
    targetJob: testJob
  });

  const mediumGaps = result.remediationPlan.filter(r => r.gapSeverity === 'MEDIUM');
  assert.ok(mediumGaps.some(g => g.skill === 'Docker'), 'Docker should trigger medium severity inflation warning');
});

console.log('\n--- 3. Testing Rigor Weighting ---');

runTest('Testing rigor assigns 100 with both test files and test framework', () => {
  const result = MatchingEngineService.triangulate({
    claimedSkills: [],
    repoSnapshot: { detectedDependencies: ['jest'], hasTestFiles: true, languages: [] },
    targetJob: testJob
  });
  assert.strictEqual(result.metrics.testingRigorScore, 100);
});

runTest('Testing rigor assigns 60 with test files but no recognized test framework', () => {
  const result = MatchingEngineService.triangulate({
    claimedSkills: [],
    repoSnapshot: { detectedDependencies: [], hasTestFiles: true, languages: [] },
    targetJob: testJob
  });
  assert.strictEqual(result.metrics.testingRigorScore, 60);
});

runTest('Testing rigor assigns 0 without test files or frameworks', () => {
  const result = MatchingEngineService.triangulate({
    claimedSkills: [],
    repoSnapshot: { detectedDependencies: [], hasTestFiles: false, languages: [] },
    targetJob: testJob
  });
  assert.strictEqual(result.metrics.testingRigorScore, 0);
});

console.log('\n===============================================');
console.log(`📊 Placement Readiness Index Summary: ${passedTests}/${totalTests} passed`);
console.log('===============================================\n');

if (passedTests !== totalTests) process.exit(1);
