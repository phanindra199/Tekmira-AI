import mongoose from 'mongoose';

/**
 * Concrete Evidence Embedded Schema
 */
const EvidenceItemSchema = new mongoose.Schema({
  repoName: { type: String, required: true },
  commitHash: { type: String },
  commitMessage: { type: String },
  codeSnippet: { type: String },
  filePath: { type: String },
  confidenceScore: { type: Number, min: 0, max: 100, default: 85 }
}, { _id: false });

/**
 * Triangulation Matrix Entry Embedded Schema
 * Represents the 3-way evaluation of a single technical skill
 */
const TriangulationItemSchema = new mongoose.Schema({
  skillName: { type: String, required: true, trim: true },
  category: { type: String, default: 'TECHNICAL' },
  isClaimedInResume: { type: Boolean, default: false },
  isDemonstratedInCode: { type: Boolean, default: false },
  isRequiredInJob: { type: Boolean, default: false },
  verificationStatus: {
    type: String,
    enum: [
      'VERIFIED',           // Claimed + Demonstrated in Code (Ideal)
      'INFLATED_CLAIM',     // Claimed in resume but NO code evidence found
      'UNCLAIMED_STRENGTH', // Found in code but not listed on resume
      'MISSING_CRITICAL'    // Required by job, but neither in resume nor code
    ],
    required: true
  },
  evidence: [EvidenceItemSchema]
}, { _id: false });

/**
 * Remediation Action Plan Embedded Schema
 */
const RemediationActionSchema = new mongoose.Schema({
  skill: { type: String, required: true },
  gapSeverity: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], default: 'MEDIUM' },
  recommendation: { type: String, required: true },
  suggestedProject: { type: String },
  suggestedResources: [{ type: String }]
}, { _id: false });

/**
 * SkillAnalysisReport Schema
 * Stores the complete explainable 3-way triangulation report produced by Gemini NLP & GitHub analysis
 */
const SkillAnalysisReportSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: [true, 'User identifier is required'], 
    index: true 
  }, // References PostgreSQL User UUID
  jobId: { 
    type: String, 
    required: [true, 'Target Job identifier is required'], 
    index: true 
  }, // References PostgreSQL JobDescription UUID
  resumeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ResumeDocument',
    required: false
  },
  overallReadinessScore: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 100 
  },
  status: { 
    type: String, 
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'], 
    default: 'PENDING' 
  },
  summary: { 
    type: String, 
    required: true 
  },
  triangulationMatrix: [TriangulationItemSchema],
  remediationPlan: [RemediationActionSchema],
  metrics: {
    totalSkillsEvaluated: { type: Number, default: 0 },
    verifiedCount: { type: Number, default: 0 },
    inflatedCount: { type: Number, default: 0 },
    missingCriticalCount: { type: Number, default: 0 },
    unclaimedStrengthsCount: { type: Number, default: 0 }
  },
  aiModelUsed: { 
    type: String, 
    default: 'gemini-1.5-pro' 
  },
  reportVersion: { 
    type: String, 
    default: '1.0.0' 
  }
}, { 
  timestamps: true,
  collection: 'skill_analysis_reports'
});

export const SkillAnalysisReport = mongoose.models.SkillAnalysisReport || mongoose.model('SkillAnalysisReport', SkillAnalysisReportSchema);
export default SkillAnalysisReport;
