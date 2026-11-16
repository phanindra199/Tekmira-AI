/**
 * Tekmira AI — MongoDB Aggregation Analytics Test Suite (Day 18)
 * 
 * Verifies:
 * 1. Cohort-level multi-faceted readiness and skill deficit aggregations
 * 2. Longitudinal candidate PRI growth trajectories and delta computations
 * 3. Technical viva voce rubric analytics and difficulty breakdowns
 * 4. Compound and multikey Mongoose schema index specifications
 * 5. HTTP REST API contracts for all analytics endpoints
 */

import assert from 'assert';
import { AnalyticsAggregationService } from '../services/analyticsAggregationService.js';
import { SkillAnalysisReport } from '../models/SkillAnalysisReport.js';
import { InterviewSession } from '../models/InterviewSession.js';
import app from '../app.js';

console.log('🧪 Starting Tekmira AI MongoDB Aggregation Analytics Tests (Day 18)...\n');

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

async function runSuite() {
  // ==========================================
  // 1. Cohort Analytics Aggregation Pipeline
  // ==========================================
  console.log('--- 1. Cohort Aggregation Pipeline ($facet, $unwind, $group) ---');

  await runAsyncTest('getCohortOverview returns summary statistics and readiness tiers', async () => {
    const overview = await AnalyticsAggregationService.getCohortOverview();
    assert.ok(overview.summary);
    assert.ok(typeof overview.summary.cohortSize === 'number');
    assert.ok(typeof overview.summary.averagePriScore === 'number');
    assert.ok(overview.summary.averagePriScore >= 0 && overview.summary.averagePriScore <= 100);

    assert.ok(overview.readinessTiers);
    assert.ok(typeof overview.readinessTiers.tier1_IndustryReady === 'number');
    assert.ok(typeof overview.readinessTiers.tier2_PlacementReady === 'number');
    assert.ok(typeof overview.readinessTiers.tier3_NeedsTargetedPractice === 'number');
    assert.ok(typeof overview.readinessTiers.tier4_FoundationalDeficit === 'number');
  });

  await runAsyncTest('getCohortOverview returns skill verification metrics & rates', async () => {
    const overview = await AnalyticsAggregationService.getCohortOverview();
    assert.ok(Array.isArray(overview.topSkills));
    assert.ok(overview.topSkills.length > 0);

    const firstSkill = overview.topSkills[0];
    assert.ok(firstSkill.skillName);
    assert.ok(typeof firstSkill.totalEvaluations === 'number');
    assert.ok(typeof firstSkill.verifiedCount === 'number');
    assert.ok(typeof firstSkill.verificationRate === 'number');
  });

  await runAsyncTest('getCohortOverview returns priority remediation gaps', async () => {
    const overview = await AnalyticsAggregationService.getCohortOverview();
    assert.ok(Array.isArray(overview.priorityRemediations));
    assert.ok(overview.priorityRemediations.length > 0);
    assert.ok(overview.priorityRemediations[0].skill);
    assert.ok(overview.priorityRemediations[0].severity);
  });

  // ==========================================
  // 2. Candidate Longitudinal PRI Trajectory
  // ==========================================
  console.log('\n--- 2. Candidate Longitudinal Growth Trajectory ---');

  await runAsyncTest('getCandidateTrajectory computes growth delta over historical reports', async () => {
    const trajectory = await AnalyticsAggregationService.getCandidateTrajectory('test-candidate-123');
    assert.strictEqual(trajectory.userId, 'test-candidate-123');
    assert.ok(typeof trajectory.initialScore === 'number');
    assert.ok(typeof trajectory.currentScore === 'number');
    assert.strictEqual(trajectory.growthDelta, trajectory.currentScore - trajectory.initialScore);
    assert.ok(Array.isArray(trajectory.history));
    assert.ok(trajectory.history.length > 0);
  });

  // ==========================================
  // 3. Interview Viva Rubric Analytics
  // ==========================================
  console.log('\n--- 3. Interview Viva Rubric Analytics ---');

  await runAsyncTest('getInterviewAnalytics computes rubric breakdowns & difficulties', async () => {
    const analytics = await AnalyticsAggregationService.getInterviewAnalytics();
    assert.ok(Array.isArray(analytics.difficulties));
    assert.ok(analytics.rubrics);
    assert.ok(typeof analytics.rubrics.technicalAccuracy === 'number');
    assert.ok(typeof analytics.rubrics.evidenceAwareness === 'number');
    assert.ok(typeof analytics.rubrics.conceptualClarity === 'number');
  });

  // ==========================================
  // 4. Mongoose Schema Index Optimization
  // ==========================================
  console.log('\n--- 4. Mongoose Schema Index Optimization ---');

  await runAsyncTest('SkillAnalysisReport schema indexes include compound and multikey paths', () => {
    const indexes = SkillAnalysisReport.schema.indexes();
    assert.ok(Array.isArray(indexes));

    // Verify compound index on { userId: 1, createdAt: -1 }
    const hasUserCreated = indexes.some(([idx]) => idx.userId === 1 && idx.createdAt === -1);
    assert.ok(hasUserCreated, 'Must define compound index on { userId: 1, createdAt: -1 }');

    // Verify multikey index on { "triangulationMatrix.skillName": 1, "triangulationMatrix.verificationStatus": 1 }
    const hasSkillMultikey = indexes.some(([idx]) => idx['triangulationMatrix.skillName'] === 1);
    assert.ok(hasSkillMultikey, 'Must define multikey index on triangulationMatrix.skillName');

    // Verify index on overallReadinessScore
    const hasPriIndex = indexes.some(([idx]) => idx.overallReadinessScore === -1);
    assert.ok(hasPriIndex, 'Must define index on overallReadinessScore');
  });

  await runAsyncTest('InterviewSession schema indexes include compound user and skill multikey', () => {
    const indexes = InterviewSession.schema.indexes();
    assert.ok(Array.isArray(indexes));

    const hasUserCreated = indexes.some(([idx]) => idx.userId === 1 && idx.createdAt === -1);
    assert.ok(hasUserCreated, 'Must define compound index on { userId: 1, createdAt: -1 }');

    const hasQuestionSkill = indexes.some(([idx]) => idx['questions.skill'] === 1);
    assert.ok(hasQuestionSkill, 'Must define multikey index on questions.skill');
  });

  // ==========================================
  // 5. REST API Integration Contracts
  // ==========================================
  console.log('\n--- 5. Analytics REST API Endpoints ---');

  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    await runAsyncTest('GET /api/v1/analysis/analytics/cohort returns 200 with cohort overview', async () => {
      const res = await fetch(`${baseUrl}/api/v1/analysis/analytics/cohort`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.data.summary);
      assert.ok(data.data.readinessTiers);
    });

    await runAsyncTest('GET /api/v1/analysis/analytics/trajectory/:userId returns 200 with delta', async () => {
      const res = await fetch(`${baseUrl}/api/v1/analysis/analytics/trajectory/test-candidate-123`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.data.userId, 'test-candidate-123');
      assert.ok(typeof data.data.growthDelta === 'number');
    });

    await runAsyncTest('GET /api/v1/interview/analytics/summary returns 200 with rubrics', async () => {
      const res = await fetch(`${baseUrl}/api/v1/interview/analytics/summary`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.data.rubrics);
    });
  } finally {
    server.close();
  }

  // ==========================================
  // Summary
  // ==========================================
  console.log('\n===============================================');
  console.log(`📊 Aggregation Analytics Summary: ${passedTests}/${totalTests} passed`);
  console.log('===============================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runSuite().catch(err => {
  console.error('Fatal Suite Runner Error:', err);
  process.exit(1);
});
