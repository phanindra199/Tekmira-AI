import mongoose from 'mongoose';

/**
 * Question Item Embedded Schema
 */
const QuestionItemSchema = new mongoose.Schema({
  questionIndex: { type: Number, required: true },
  skill: { type: String, required: true, trim: true },
  concept: { type: String, required: true, trim: true },
  difficulty: { 
    type: String, 
    enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], 
    default: 'INTERMEDIATE' 
  },
  questionText: { type: String, required: true },
  fileCitation: { type: String, default: 'Repository Codebase' },
  expectedTopics: [{ type: String, trim: true }],
  studentAnswer: { type: String, default: '' },
  submittedAt: { type: Date },
  evaluation: {
    score: { type: Number, min: 0, max: 100 },
    feedback: { type: String },
    correctPoints: [{ type: String }],
    missedGaps: [{ type: String }],
    rubricBreakdown: {
      technicalAccuracy: { type: Number, min: 0, max: 100, default: 75 },
      evidenceAwareness: { type: Number, min: 0, max: 100, default: 70 },
      conceptualClarity: { type: Number, min: 0, max: 100, default: 80 }
    },
    uncertaintyNotice: { 
      type: String, 
      default: 'AI viva evaluation is advisory and formative. It is designed for interview practice and is not equivalent to a human academic assessor.' 
    }
  }
}, { _id: false });

/**
 * InterviewSession Schema
 * Stores grounded viva voce practice sessions, questions, student answers, and rubric evaluations
 */
const InterviewSessionSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: [true, 'Candidate user identifier is required'], 
    index: true 
  },
  reportId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'SkillAnalysisReport' 
  },
  targetRole: { 
    type: String, 
    default: 'Junior Full Stack Engineer',
    trim: true 
  },
  difficulty: { 
    type: String, 
    enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], 
    default: 'INTERMEDIATE' 
  },
  status: { 
    type: String, 
    enum: ['CREATED', 'IN_PROGRESS', 'COMPLETED'], 
    default: 'IN_PROGRESS' 
  },
  questions: [QuestionItemSchema],
  overallScore: { 
    type: Number, 
    min: 0, 
    max: 100 
  },
  overallFeedback: { 
    type: String 
  }
}, { 
  timestamps: true,
  collection: 'interview_sessions'
});

export const InterviewSession = mongoose.models.InterviewSession || mongoose.model('InterviewSession', InterviewSessionSchema);
export default InterviewSession;
