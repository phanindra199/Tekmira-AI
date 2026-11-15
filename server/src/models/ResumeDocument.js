import mongoose from 'mongoose';

/**
 * Skill Claim Embedded Schema
 */
const SkillClaimSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    enum: ['FRONTEND', 'BACKEND', 'DATABASE', 'DEVOPS', 'LANGUAGES', 'AI_ML', 'TOOLS', 'GENERAL'],
    default: 'GENERAL' 
  },
  confidence: { type: Number, min: 0, max: 1, default: 0.9 },
  context: { type: String, trim: true } // e.g. "Used in final year project"
}, { _id: false });

/**
 * Project Claim Embedded Schema
 */
const ProjectClaimSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  technologies: [{ type: String, trim: true }],
  repoUrl: { type: String, trim: true }
}, { _id: false });

/**
 * Education Embedded Schema
 */
const EducationSchema = new mongoose.Schema({
  degree: { type: String, required: true },
  institution: { type: String, required: true },
  graduationYear: { type: Number, required: true },
  score: { type: String } // e.g. "8.6 CGPA"
}, { _id: false });

/**
 * ResumeDocument Schema
 * Stores unstructured candidate resume parsing output, extracted claims, and raw text
 */
const ResumeDocumentSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: [true, 'User identifier is required'], 
    index: true 
  }, // References PostgreSQL User UUID
  fileName: { 
    type: String, 
    required: [true, 'File name is required'],
    trim: true 
  },
  fileSize: { 
    type: Number, 
    required: [true, 'File size is required'],
    min: 0 
  },
  mimeType: { 
    type: String, 
    default: 'application/pdf',
    enum: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
  },
  rawText: { 
    type: String, 
    required: [true, 'Extracted resume text is required'] 
  },
  pageCount: {
    type: Number,
    default: 1,
    min: 1
  },
  wordCount: {
    type: Number,
    default: 0,
    min: 0
  },
  sha256Hash: {
    type: String,
    trim: true
  },
  isScanned: {
    type: Boolean,
    default: false
  },
  extractedClaims: {
    skills: [SkillClaimSchema],
    projects: [ProjectClaimSchema],
    education: [EducationSchema],
    experienceYears: { type: Number, default: 0, min: 0 }
  },
  parserVersion: { 
    type: String, 
    default: '1.0.0' 
  }
}, { 
  timestamps: true,
  collection: 'resume_documents'
});

export const ResumeDocument = mongoose.models.ResumeDocument || mongoose.model('ResumeDocument', ResumeDocumentSchema);
export default ResumeDocument;
