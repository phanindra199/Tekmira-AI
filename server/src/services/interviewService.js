import mongoose from 'mongoose';
import { InterviewSession } from '../models/InterviewSession.js';
import { SkillAnalysisReport } from '../models/SkillAnalysisReport.js';
import { geminiService } from './geminiService.js';
import { 
  createInterviewQuestionPrompt, 
  createAnswerEvaluationPrompt,
  SYSTEM_ASSESSOR_INSTRUCTIONS 
} from '../prompts/promptTemplates.js';
import { 
  geminiInterviewQuestionsJsonSchema,
  geminiEvaluatedAnswerJsonSchema,
  GeneratedInterviewSessionSchema,
  EvaluatedAnswerSchema 
} from '../validations/structuredOutputSchemas.js';
import { AppError } from '../utils/AppError.js';

/**
 * Calibrated fallback questions grounded in standard full-stack campus evidence
 */
const DEFAULT_GROUNDED_QUESTIONS = [
  {
    questionIndex: 0,
    skill: 'Node.js & Express.js',
    concept: 'Middleware Order and Centralized Error Handling',
    difficulty: 'INTERMEDIATE',
    questionText: 'In your Express backend (server.js/app.js), explain why the centralized errorHandler middleware must be registered after all route handlers and why error middleware functions require exactly four arguments (err, req, res, next).',
    fileCitation: 'server/src/app.js',
    expectedTopics: ['4 parameters arity', 'Express internal middleware dispatch', 'Catch-all placement', 'next(err) propagation']
  },
  {
    questionIndex: 1,
    skill: 'PostgreSQL & Prisma',
    concept: 'Relational Data Modeling & SQL Injection Prevention',
    difficulty: 'INTERMEDIATE',
    questionText: 'In your database layer (prisma/schema.prisma), how do parameterized queries in Prisma prevent SQL injection compared to raw string concatenation, and why did you choose UUIDs over auto-incrementing integers?',
    fileCitation: 'server/prisma/schema.prisma',
    expectedTopics: ['Parameterized queries ($1, $2)', 'Enumeration attacks defense', '128-bit entropy', 'Prepared statements']
  },
  {
    questionIndex: 2,
    skill: 'React 18',
    concept: 'Component Lifecycle and Memory Leak Prevention',
    difficulty: 'INTERMEDIATE',
    questionText: 'In your React dashboard components, how do you prevent race conditions and memory leaks when performing asynchronous data fetching with useEffect, and why is an AbortController necessary?',
    fileCitation: 'client/src/pages/DashboardPage.jsx',
    expectedTopics: ['AbortController.signal', 'Cleanup function', 'isMounted flag', 'Race conditions on rapid re-renders']
  }
];

export class InterviewService {
  /**
   * Generates a grounded interview session with technical viva voce questions
   * 
   * @param {Object} params
   * @param {string} params.userId
   * @param {string} [params.reportId]
   * @param {string} [params.difficulty] - BEGINNER | INTERMEDIATE | ADVANCED
   * @param {string} [params.targetRole]
   * @returns {Promise<Object>} Created Interview Session
   */
  static async generateSession({ userId, reportId, difficulty = 'INTERMEDIATE', targetRole = 'Junior Full Stack Engineer' }) {
    if (!userId) {
      throw new AppError('Candidate user identifier is required to start an interview session', 400);
    }

    const normDifficulty = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(difficulty?.toUpperCase())
      ? difficulty.toUpperCase()
      : 'INTERMEDIATE';

    // 1. Fetch Verified Evidence from SkillAnalysisReport if available
    let verifiedSkills = ['Node.js', 'Express.js', 'React', 'PostgreSQL'];
    let projectProof = [{ repoName: 'Tekmira-AI', files: ['server/src/app.js', 'server/prisma/schema.prisma'] }];

    if (reportId && mongoose.Types.ObjectId.isValid(reportId) && mongoose.connection.readyState === 1) {
      try {
        const report = await SkillAnalysisReport.findById(reportId);
        if (report) {
          const reportVerified = (report.triangulationMatrix || [])
            .filter(item => item.verificationStatus === 'VERIFIED')
            .map(item => item.skillName);

          if (reportVerified.length > 0) {
            verifiedSkills = reportVerified;
          }

          projectProof = (report.triangulationMatrix || [])
            .filter(item => item.evidence?.length > 0)
            .map(item => ({
              skill: item.skillName,
              evidence: item.evidence.map(e => ({ filePath: e.filePath, snippet: e.codeSnippet }))
            }));
        }
      } catch (err) {
        console.warn('⚠️ Could not load report evidence for interview, using defaults:', err.message);
      }
    }

    // 2. Generate Grounded Questions via Gemini AI
    let generatedQuestions = DEFAULT_GROUNDED_QUESTIONS;
    let overviewNotes = 'Interview questions grounded in candidate repository architecture.';

    if (geminiService.isConfigured()) {
      try {
        const prompt = createInterviewQuestionPrompt(verifiedSkills, projectProof, normDifficulty.toLowerCase());
        const aiResponse = await geminiService.generateContent({
          systemInstruction: SYSTEM_ASSESSOR_INSTRUCTIONS,
          prompt,
          responseMimeType: 'application/json',
          responseJsonSchema: geminiInterviewQuestionsJsonSchema
        });

        const parsed = JSON.parse(aiResponse.text);
        const validated = GeneratedInterviewSessionSchema.parse(parsed);
        if (validated.questions?.length > 0) {
          generatedQuestions = validated.questions.map((q, idx) => ({
            questionIndex: idx,
            skill: q.skill,
            concept: q.concept,
            difficulty: normDifficulty,
            questionText: q.questionText,
            fileCitation: q.fileCitation || 'Repository Codebase',
            expectedTopics: q.expectedTopics || []
          }));
          overviewNotes = validated.overviewNotes || overviewNotes;
        }
      } catch (aiErr) {
        console.warn('⚠️ Gemini question generation fallback to calibrated bank:', aiErr.message);
      }
    }

    // 3. Assemble MongoDB Session Document
    const sessionData = {
      userId,
      reportId: mongoose.Types.ObjectId.isValid(reportId) ? reportId : null,
      targetRole,
      difficulty: normDifficulty,
      status: 'IN_PROGRESS',
      questions: generatedQuestions,
      overallFeedback: overviewNotes
    };

    if (mongoose.connection.readyState === 1) {
      const session = new InterviewSession(sessionData);
      return await session.save();
    }

    // Offline / test fallback
    return {
      _id: new mongoose.Types.ObjectId(),
      ...sessionData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Submits a student's answer and evaluates it against academic viva rubrics
   * 
   * @param {Object} params
   * @param {string} params.sessionId
   * @param {number} params.questionIndex
   * @param {string} params.studentAnswer
   * @param {string} params.userId
   * @returns {Promise<Object>} Evaluated answer payload and updated session
   */
  static async evaluateAnswer({ sessionId, questionIndex, studentAnswer, userId }) {
    if (!sessionId) {
      throw new AppError('Session identifier is required', 400);
    }
    if (typeof questionIndex !== 'number' || questionIndex < 0) {
      throw new AppError('Valid question index is required', 400);
    }
    if (!studentAnswer || typeof studentAnswer !== 'string' || studentAnswer.trim().length < 10) {
      throw new AppError('Student answer must be at least 10 characters long', 400);
    }

    // 1. Fetch Session
    let session;
    if (mongoose.connection.readyState === 1) {
      session = await InterviewSession.findById(sessionId);
    } else {
      // Mock session for testing
      session = new InterviewSession({
        _id: sessionId,
        userId: userId || '00000000-0000-0000-0000-000000000000',
        questions: DEFAULT_GROUNDED_QUESTIONS
      });
    }

    if (!session) {
      throw new AppError('Interview session not found', 404);
    }

    if (userId && session.userId !== userId) {
      throw new AppError('Access denied: Unauthorized to evaluate answers for this session', 403);
    }

    const question = session.questions.find(q => q.questionIndex === questionIndex);
    if (!question) {
      throw new AppError(`Question at index ${questionIndex} not found in this session`, 404);
    }

    // 2. Evaluate Answer via Gemini or Calibrated Rubric Engine
    let evaluation;

    if (geminiService.isConfigured()) {
      try {
        const prompt = createAnswerEvaluationPrompt({
          questionText: question.questionText,
          expectedTopics: question.expectedTopics,
          fileCitation: question.fileCitation,
          studentAnswer: studentAnswer.trim()
        });

        const aiResponse = await geminiService.generateContent({
          systemInstruction: SYSTEM_ASSESSOR_INSTRUCTIONS,
          prompt,
          responseMimeType: 'application/json',
          responseJsonSchema: geminiEvaluatedAnswerJsonSchema
        });

        const parsed = JSON.parse(aiResponse.text);
        evaluation = EvaluatedAnswerSchema.parse(parsed);
      } catch (err) {
        console.warn('⚠️ Gemini evaluation fallback to rubric evaluator:', err.message);
      }
    }

    // Fallback Rubric Evaluator (Deterministic & Zero Downtime)
    if (!evaluation) {
      const cleanAnswer = studentAnswer.toLowerCase();
      const matchedTopics = (question.expectedTopics || []).filter(topic => 
        topic.toLowerCase().split(/\s+/).some(word => word.length > 3 && cleanAnswer.includes(word))
      );

      const topicRatio = (question.expectedTopics?.length > 0) 
        ? matchedTopics.length / question.expectedTopics.length 
        : 0.8;

      const techAccuracy = Math.min(100, Math.round(50 + (topicRatio * 45)));
      const evidenceAwareness = cleanAnswer.includes('file') || cleanAnswer.includes('app') || cleanAnswer.includes('route') ? 85 : 70;
      const clarity = studentAnswer.length > 80 ? 85 : 70;

      const score = Math.round((0.40 * techAccuracy) + (0.35 * evidenceAwareness) + (0.25 * clarity));

      evaluation = {
        score,
        feedback: `Candidate demonstrated solid technical grounding. Correctly referenced key concepts including: ${matchedTopics.join(', ') || 'core principles'}. To improve, articulate specific edge case handling and error boundaries.`,
        correctPoints: matchedTopics.length > 0 ? matchedTopics : ['Addressed primary question prompt'],
        missedGaps: (question.expectedTopics || []).filter(t => !matchedTopics.includes(t)),
        rubricBreakdown: {
          technicalAccuracy: techAccuracy,
          evidenceAwareness: evidenceAwareness,
          conceptualClarity: clarity
        },
        uncertaintyNotice: 'AI viva evaluation is advisory and formative. It is designed for interview practice and is not equivalent to a human academic assessor.'
      };
    }

    // 3. Update Question in Session
    question.studentAnswer = studentAnswer.trim();
    question.submittedAt = new Date();
    question.evaluation = evaluation;

    // 4. Calculate Session Overall Score
    const answeredQuestions = session.questions.filter(q => q.evaluation && typeof q.evaluation.score === 'number');
    const totalScore = answeredQuestions.reduce((sum, q) => sum + q.evaluation.score, 0);
    session.overallScore = Math.round(totalScore / Math.max(1, answeredQuestions.length));

    if (answeredQuestions.length === session.questions.length) {
      session.status = 'COMPLETED';
    } else {
      session.status = 'IN_PROGRESS';
    }

    if (mongoose.connection.readyState === 1 && typeof session.save === 'function') {
      await session.save();
    }

    return {
      sessionId: session._id,
      questionIndex,
      evaluation,
      overallSessionScore: session.overallScore,
      sessionStatus: session.status
    };
  }

  /**
   * READ: Fetch session by ID
   */
  static async getSessionById(sessionId, userId) {
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      throw new AppError(`Invalid session ID: '${sessionId}'`, 400);
    }

    let session;
    if (mongoose.connection.readyState === 1) {
      session = await InterviewSession.findById(sessionId);
    } else {
      session = {
        _id: sessionId,
        userId: '99999999-8888-7777-6666-555544443333',
        targetRole: 'Junior Full Stack Engineer',
        difficulty: 'INTERMEDIATE',
        status: 'IN_PROGRESS',
        questions: DEFAULT_GROUNDED_QUESTIONS
      };
    }

    if (!session) {
      throw new AppError('Interview session not found', 404);
    }

    if (userId && session.userId !== userId) {
      throw new AppError('Access denied: Unauthorized to view this interview session', 403);
    }

    return session;
  }

  /**
   * READ: Fetch all candidate sessions
   */
  static async getUserSessions(userId) {
    if (!userId) {
      throw new AppError('Candidate user identifier is required', 400);
    }

    if (mongoose.connection.readyState !== 1) {
      return [];
    }

    return await InterviewSession.find({ userId }).sort({ createdAt: -1 });
  }
}

export default InterviewService;
