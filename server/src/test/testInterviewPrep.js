import { InterviewService } from '../services/interviewService.js';
import { InterviewSession } from '../models/InterviewSession.js';
import { AppError } from '../utils/AppError.js';

console.log('🧪 Starting Tekmira AI AI Technical Interview & Viva Voce Tests (Day 14)...\n');

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
  const candidateId = '99999999-8888-7777-6666-555544443333';

  // =========================================================================
  // 1. Grounded Question Generation Flow
  // =========================================================================
  console.log('--- 1. Grounded Question Generation Flow ---');

  const session = await InterviewService.generateSession({
    userId: candidateId,
    difficulty: 'INTERMEDIATE',
    targetRole: 'Junior Full Stack Engineer'
  });

  assert('Generates interview session with unique identifier', Boolean(session._id));
  assert('Session records authenticated candidate userId', session.userId === candidateId);
  assert('Session defaults to IN_PROGRESS status', session.status === 'IN_PROGRESS');
  assert('Session contains array of grounded viva questions', Array.isArray(session.questions) && session.questions.length >= 3);

  const firstQ = session.questions[0];
  assert('Question records specific verified skill', typeof firstQ.skill === 'string' && firstQ.skill.length > 0);
  assert('Question contains architectural concept title', typeof firstQ.concept === 'string' && firstQ.concept.length > 0);
  assert('Question explicitly cites codebase implementation file', 
    typeof firstQ.fileCitation === 'string' && firstQ.fileCitation.includes('.'));
  assert('Question includes expected topics list for rubric matching', 
    Array.isArray(firstQ.expectedTopics) && firstQ.expectedTopics.length > 0);

  // Missing userId rejection
  let missingUserError = null;
  try {
    await InterviewService.generateSession({ userId: null });
  } catch (err) {
    missingUserError = err;
  }
  assert('Rejects session creation without candidate userId (HTTP 400)', 
    missingUserError instanceof AppError && missingUserError.statusCode === 400);

  // =========================================================================
  // 2. Answer Submission & Rubric Evaluation
  // =========================================================================
  console.log('\n--- 2. Answer Submission & Rubric Evaluation ---');

  // Short answer rejection (< 10 chars)
  let shortAnswerError = null;
  try {
    await InterviewService.evaluateAnswer({
      sessionId: session._id,
      questionIndex: 0,
      studentAnswer: 'too short',
      userId: candidateId
    });
  } catch (err) {
    shortAnswerError = err;
  }
  assert('Rejects trivial/too-short answer with HTTP 400', 
    shortAnswerError instanceof AppError && shortAnswerError.statusCode === 400);

  // Realistic technical answer referencing file and expected topics
  const realisticAnswer = 
    'In Express, middleware functions execute sequentially in the order registered. The centralized error handler must be last because any previous middleware calling next(err) needs to bubble down to it. Furthermore, Express internally inspects function arity via function.length. Only handlers declaring exactly 4 arguments (err, req, res, next) are recognized as error handlers; otherwise Express treats it as standard route middleware.';

  const evalResult = await InterviewService.evaluateAnswer({
    sessionId: session._id,
    questionIndex: 0,
    studentAnswer: realisticAnswer,
    userId: candidateId
  });

  assert('Returns evaluation object', Boolean(evalResult.evaluation));
  assert('Calculates numerical score between 0 and 100', 
    typeof evalResult.evaluation.score === 'number' && 
    evalResult.evaluation.score >= 0 && 
    evalResult.evaluation.score <= 100);
  assert('Strong technical answer earns passing score (>= 70)', evalResult.evaluation.score >= 70);
  
  const rubric = evalResult.evaluation.rubricBreakdown;
  assert('Includes 3-part rubric: Technical Accuracy', typeof rubric.technicalAccuracy === 'number');
  assert('Includes 3-part rubric: Evidence Awareness', typeof rubric.evidenceAwareness === 'number');
  assert('Includes 3-part rubric: Conceptual Clarity', typeof rubric.conceptualClarity === 'number');

  assert('Identifies specific correct technical points made', 
    evalResult.evaluation.correctPoints?.length > 0);
  assert('Provides constructive academic feedback', 
    typeof evalResult.evaluation.feedback === 'string' && evalResult.evaluation.feedback.length > 20);
  assert('Discloses explicit AI uncertainty notice for viva evaluation', 
    evalResult.evaluation.uncertaintyNotice.includes('advisory'));

  // =========================================================================
  // 3. Session Progress Tracking & Overall Score Calculation
  // =========================================================================
  console.log('\n--- 3. Session Progress & Cumulative Score Tracking ---');

  assert('Session tracks overallSessionScore', typeof evalResult.overallSessionScore === 'number');
  assert('Session remains IN_PROGRESS until all questions answered', 
    evalResult.sessionStatus === 'IN_PROGRESS');

  // =========================================================================
  // 4. Session Retrieval & Unauthorized Access Protection
  // =========================================================================
  console.log('\n--- 4. Session Retrieval & Security Guards ---');

  const retrieved = await InterviewService.getSessionById(session._id, candidateId);
  assert('Retrieves session document by identifier', retrieved._id.toString() === session._id.toString());

  // Unauthorized candidate access test
  let unauthorizedError = null;
  try {
    await InterviewService.getSessionById(session._id, 'attacker-unauthorized-uuid');
  } catch (err) {
    unauthorizedError = err;
  }
  assert('Rejects access from unauthorized candidate ID (HTTP 403 Forbidden)', 
    unauthorizedError instanceof AppError && unauthorizedError.statusCode === 403);

  // =========================================================================
  // 5. MongoDB InterviewSession Schema Compliance
  // =========================================================================
  console.log('\n--- 5. MongoDB InterviewSession Schema Compliance ---');

  const sessionDoc = new InterviewSession({
    userId: candidateId,
    targetRole: 'Full Stack Engineer',
    difficulty: 'INTERMEDIATE',
    status: 'IN_PROGRESS',
    questions: [
      {
        questionIndex: 0,
        skill: 'React',
        concept: 'Hooks',
        questionText: 'Explain useEffect dependency arrays.',
        fileCitation: 'client/src/App.jsx',
        expectedTopics: ['Dependencies', 'Stale Closures'],
        studentAnswer: 'Dependencies declare reactive values used inside the effect.',
        evaluation: {
          score: 85,
          feedback: 'Good explanation.',
          correctPoints: ['Dependencies'],
          missedGaps: ['Stale Closures'],
          rubricBreakdown: {
            technicalAccuracy: 85,
            evidenceAwareness: 80,
            conceptualClarity: 90
          }
        }
      }
    ],
    overallScore: 85
  });

  const schemaError = sessionDoc.validateSync();
  assert('InterviewSession Mongoose document passes schema validation', !schemaError);
  assert('Preserves questions array length', sessionDoc.questions.length === 1);
  assert('Preserves rubricBreakdown in evaluation', 
    sessionDoc.questions[0].evaluation.rubricBreakdown.technicalAccuracy === 85);

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
  console.error('Unhandled Interview Prep test failure:', err);
  process.exit(1);
});
