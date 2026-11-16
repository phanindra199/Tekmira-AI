/**
 * Tekmira AI — Unit Test Suite: Canonical Skill Normalization (Day 16)
 * 
 * Verifies deterministic mapping of syntax variants, package names,
 * abbreviations, boundary cases, and unmapped technical skills.
 */

import assert from 'assert';
import { MatchingEngineService, SKILL_NORMALIZATION_MAP } from '../../services/matchingEngineService.js';

console.log('🧪 Starting Tekmira AI Skill Normalization Unit Tests...\n');

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

// 1. Frontend canonical aliasing
console.log('--- 1. Frontend Canonical Aliasing ---');
runTest('Normalizes "react.js", "reactjs", "react-dom" to "React" (FRONTEND)', () => {
  ['react', 'react.js', 'reactjs', 'react-dom'].forEach(variant => {
    const res = MatchingEngineService.normalizeSkill(variant);
    assert.strictEqual(res.canonical, 'React');
    assert.strictEqual(res.category, 'FRONTEND');
  });
});

runTest('Normalizes "tailwind", "tailwindcss" to "Tailwind CSS" (FRONTEND)', () => {
  ['tailwind', 'tailwindcss'].forEach(variant => {
    const res = MatchingEngineService.normalizeSkill(variant);
    assert.strictEqual(res.canonical, 'Tailwind CSS');
    assert.strictEqual(res.category, 'FRONTEND');
  });
});

runTest('Normalizes "next", "next.js", "nextjs" to "Next.js" (FRONTEND)', () => {
  ['next', 'next.js', 'nextjs'].forEach(variant => {
    const res = MatchingEngineService.normalizeSkill(variant);
    assert.strictEqual(res.canonical, 'Next.js');
    assert.strictEqual(res.category, 'FRONTEND');
  });
});

// 2. Backend & Runtime Aliasing
console.log('\n--- 2. Backend & Runtime Aliasing ---');
runTest('Normalizes "node", "nodejs", "node.js" to "Node.js" (BACKEND)', () => {
  ['node', 'nodejs', 'node.js'].forEach(variant => {
    const res = MatchingEngineService.normalizeSkill(variant);
    assert.strictEqual(res.canonical, 'Node.js');
    assert.strictEqual(res.category, 'BACKEND');
  });
});

runTest('Normalizes "express", "express.js", "expressjs" to "Express.js" (BACKEND)', () => {
  ['express', 'express.js', 'expressjs'].forEach(variant => {
    const res = MatchingEngineService.normalizeSkill(variant);
    assert.strictEqual(res.canonical, 'Express.js');
    assert.strictEqual(res.category, 'BACKEND');
  });
});

// 3. Databases & ORM Aliasing
console.log('\n--- 3. Databases & ORM Aliasing ---');
runTest('Normalizes "postgres", "postgresql", "psql", "pg" to "PostgreSQL" (DATABASE)', () => {
  ['postgres', 'postgresql', 'psql', 'pg'].forEach(variant => {
    const res = MatchingEngineService.normalizeSkill(variant);
    assert.strictEqual(res.canonical, 'PostgreSQL');
    assert.strictEqual(res.category, 'DATABASE');
  });
});

runTest('Normalizes "@prisma/client", "prisma", "prisma orm" to "Prisma ORM" (DATABASE)', () => {
  ['@prisma/client', 'prisma', 'prisma orm'].forEach(variant => {
    const res = MatchingEngineService.normalizeSkill(variant);
    assert.strictEqual(res.canonical, 'Prisma ORM');
    assert.strictEqual(res.category, 'DATABASE');
  });
});

runTest('Normalizes "mongo", "mongodb", "mongoose" to "MongoDB" (DATABASE)', () => {
  ['mongo', 'mongodb', 'mongoose'].forEach(variant => {
    const res = MatchingEngineService.normalizeSkill(variant);
    assert.strictEqual(res.canonical, 'MongoDB');
    assert.strictEqual(res.category, 'DATABASE');
  });
});

// 4. Testing & DevOps Aliasing
console.log('\n--- 4. Testing & DevOps Aliasing ---');
runTest('Normalizes "docker", "dockerfile" to "Docker" (DEVOPS)', () => {
  ['docker', 'dockerfile'].forEach(variant => {
    const res = MatchingEngineService.normalizeSkill(variant);
    assert.strictEqual(res.canonical, 'Docker');
    assert.strictEqual(res.category, 'DEVOPS');
  });
});

runTest('Normalizes "jest", "supertest", "vitest", "mocha" to "Automated Testing" (TESTING)', () => {
  ['jest', 'supertest', 'vitest', 'mocha', 'cypress', 'playwright'].forEach(variant => {
    const res = MatchingEngineService.normalizeSkill(variant);
    assert.strictEqual(res.canonical, 'Automated Testing');
    assert.strictEqual(res.category, 'TESTING');
  });
});

// 5. Boundary & Invalid Input Handling
console.log('\n--- 5. Boundary & Edge Case Handling ---');
runTest('Handles null, undefined, empty strings and non-string inputs safely', () => {
  [null, undefined, '', '   ', 123, {}, []].forEach(badInput => {
    const res = MatchingEngineService.normalizeSkill(badInput);
    assert.strictEqual(res.canonical, 'Unknown');
    assert.strictEqual(res.category, 'GENERAL');
  });
});

runTest('Preserves and title-cases unmapped technical skills gracefully', () => {
  const res = MatchingEngineService.normalizeSkill('apache kafka streaming');
  assert.strictEqual(res.canonical, 'Apache Kafka Streaming');
  assert.strictEqual(res.category, 'TECHNICAL');
});

runTest('Is resilient to leading/trailing whitespace and mixed casing', () => {
  const res = MatchingEngineService.normalizeSkill('   pOsTgReS   ');
  assert.strictEqual(res.canonical, 'PostgreSQL');
});

console.log('\n===============================================');
console.log(`📊 Skill Normalization Summary: ${passedTests}/${totalTests} passed`);
console.log('===============================================\n');

if (passedTests !== totalTests) process.exit(1);
