import { checkDatabaseHealth } from '../config/database.js';
import { JobApplicationService } from '../services/jobApplicationService.js';
import { HealthService } from '../services/healthService.js';

/**
 * Tekmira AI — Relational Architecture & Database Verification Test
 */
console.log('🧪 Starting Tekmira AI Relational Database Verification...\n');

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
  // 1. Test Database Health Safety (Must never throw or expose credentials)
  console.log('--- Checking Database Health Function ---');
  const dbHealth = await checkDatabaseHealth();
  assert('Database health check returns structured status', typeof dbHealth.status === 'string');
  assert('Database health check returns boolean connected property', typeof dbHealth.connected === 'boolean');
  assert('Database health message does not leak credentials or password', 
    !dbHealth.message.includes('password') && !dbHealth.message.includes('postgres:'));

  // 2. Test Full Health Service Integration
  console.log('\n--- Checking Full System Health Integration ---');
  const fullHealth = await HealthService.getFullHealthInfo();
  assert('Health info includes database provider metadata', fullHealth.database.provider.includes('PostgreSQL'));
  assert('Health info uptime is a valid number', typeof fullHealth.uptime === 'number');

  // 3. Test Viva Voce SQL JOIN Reference
  console.log('\n--- Checking Viva Voce SQL Reference Queries ---');
  const vivaQueries = JobApplicationService.getVivaJoinReference();
  assert('Candidate applications INNER JOIN query is defined', vivaQueries.candidateApplications.includes('INNER JOIN job_applications'));
  assert('Inactive candidates LEFT JOIN query is defined', vivaQueries.inactiveCandidates.includes('LEFT JOIN job_applications') && vivaQueries.inactiveCandidates.includes('WHERE a.id IS NULL'));
  assert('Job match aggregation query with GROUP BY is defined', vivaQueries.jobMatchAggregation.includes('GROUP BY') && vivaQueries.jobMatchAggregation.includes('AVG(a.matchScore)'));

  console.log(`\n===============================================`);
  console.log(`📊 Test Summary: ${passed} passed, ${failed} failed`);
  console.log(`===============================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
