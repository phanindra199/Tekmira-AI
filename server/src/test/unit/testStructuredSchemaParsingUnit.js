/**
 * Tekmira AI — Unit Test Suite: Structured Schema Parsing & Transformations (Day 16)
 * 
 * Verifies runtime validation of Gemini LLM JSON outputs, fallback defaults,
 * enum boundaries, and zero-hallucination structured guarantees.
 */

import assert from 'assert';
import { 
  StructuredResumeAnalysisSchema, 
  ExtractedSkillSchema,
  GeneratedInterviewSessionSchema, 
  InterviewQuestionSchema,
  EvaluatedAnswerSchema,
  SkillCategoryEnum
} from '../../validations/structuredOutputSchemas.js';

console.log('🧪 Starting Tekmira AI Structured Schema Parsing Unit Tests...\n');

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

// 1. Resume Claims Schema
console.log('--- 1. Extracted Resume Claims Schema ---');

runTest('Parses valid resume claims JSON with defaults', () => {
  const rawModelJson = {
    candidateName: 'Alex Morgan',
    summary: 'Full Stack engineer with 2 years of Node and React experience.',
    skills: [
      { skillName: 'React', category: 'FRONTEND', confidence: 0.95 },
      { skillName: 'Node.js', category: 'BACKEND', confidence: 0.90 }
    ],
    projects: [
      { projectName: 'Tekmira Placement Engine', technologies: ['React', 'Express', 'PostgreSQL'] }
    ]
  };

  const parsed = StructuredResumeAnalysisSchema.parse(rawModelJson);
  assert.strictEqual(parsed.candidateName, 'Alex Morgan');
  assert.strictEqual(parsed.skills.length, 2);
  assert.strictEqual(parsed.skills[0].confidence, 0.95);
  assert.strictEqual(parsed.overallConfidence, 0.7); // default applied
  assert.deepStrictEqual(parsed.unsubstantiatedClaims, []); // default applied
});

runTest('Catches invalid skill category and safely defaults to TOOLS_OTHER', () => {
  const skill = ExtractedSkillSchema.parse({
    skillName: 'UnusualSkill',
    category: 'NON_EXISTENT_CATEGORY',
    confidence: 0.8
  });
  assert.strictEqual(skill.category, 'TOOLS_OTHER');
});

runTest('Rejects skill confidence score outside [0, 1]', () => {
  assert.throws(() => {
    ExtractedSkillSchema.parse({
      skillName: 'React',
      category: 'FRONTEND',
      confidence: 1.5 // Invalid: > 1.0
    });
  }, /too_big|less than or equal to 1|<=1/i);
});

// 2. Grounded Viva Session Schemas
console.log('\n--- 2. Grounded Viva Session Schemas ---');

runTest('Validates grounded interview question with file citation', () => {
  const validQuestion = {
    questionIndex: 0,
    skill: 'PostgreSQL',
    concept: 'Relational Health Verification & Prepared Statements',
    difficulty: 'INTERMEDIATE',
    questionText: 'In server/src/database/health.js, how does your implementation verify connection state without leaking database credentials?',
    fileCitation: 'server/src/database/health.js',
    expectedTopics: ['Prepared statements', 'Credentials stripping', 'Timeout handling']
  };

  const parsed = InterviewQuestionSchema.parse(validQuestion);
  assert.strictEqual(parsed.questionIndex, 0);
  assert.strictEqual(parsed.fileCitation, 'server/src/database/health.js');
  assert.strictEqual(parsed.expectedTopics.length, 3);
});

runTest('Rejects grounded interview question with empty question text', () => {
  assert.throws(() => {
    InterviewQuestionSchema.parse({
      questionIndex: 0,
      skill: 'PostgreSQL',
      concept: 'Health Check',
      questionText: 'Too short', // < 10 chars
      expectedTopics: ['Health']
    });
  });
});

// 3. Viva Answer Evaluation Schema
console.log('\n--- 3. Viva Voce Answer Evaluation Schema ---');

runTest('Parses valid rubric answer evaluation with ethical disclaimer', () => {
  const rawEval = {
    score: 84,
    feedback: 'Clear technical articulation of connection pool lifecycle and error boundaries.',
    correctPoints: ['Explained connection timeout logic', 'Mentioned credential stripping in catch block'],
    missedGaps: ['Did not discuss read-replica failovers'],
    rubricBreakdown: {
      technicalAccuracy: 85,
      evidenceAwareness: 82,
      conceptualClarity: 85
    }
  };

  const parsed = EvaluatedAnswerSchema.parse(rawEval);
  assert.strictEqual(parsed.score, 84);
  assert.strictEqual(parsed.rubricBreakdown.technicalAccuracy, 85);
  assert.strictEqual(parsed.correctPoints.length, 2);
  assert.ok(parsed.uncertaintyNotice.includes('AI viva evaluation is advisory and formative'));
});

runTest('Rejects rubric score outside [0, 100]', () => {
  assert.throws(() => {
    EvaluatedAnswerSchema.parse({
      score: 105, // > 100
      feedback: 'Good answer but score is invalid.'
    });
  });
});

console.log('\n===============================================');
console.log(`📊 Schema Parsing Summary: ${passedTests}/${totalTests} passed`);
console.log('===============================================\n');

if (passedTests !== totalTests) process.exit(1);
