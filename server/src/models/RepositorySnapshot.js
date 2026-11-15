import mongoose from 'mongoose';

/**
 * Language Breakdown Embedded Schema
 */
const LanguageBreakdownSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bytes: { type: Number, required: true, min: 0 },
  percentage: { type: Number, required: true, min: 0, max: 100 }
}, { _id: false });

/**
 * Authentic Commit Embedded Schema
 * Stores proof of authentic developer contribution
 */
const AuthenticCommitSchema = new mongoose.Schema({
  hash: { type: String, required: true },
  message: { type: String, required: true },
  committedAt: { type: Date, required: true },
  additions: { type: Number, default: 0, min: 0 },
  deletions: { type: Number, default: 0, min: 0 },
  verifiedAuthored: { type: Boolean, default: true } // Checked against candidate's author email/handle
}, { _id: false });

/**
 * RepositorySnapshot Schema
 * Stores mined GitHub repository metadata, language distributions, and commit evidence
 */
const RepositorySnapshotSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: [true, 'User identifier is required'], 
    index: true 
  }, // References PostgreSQL User UUID
  githubHandle: { 
    type: String, 
    required: [true, 'GitHub handle is required'], 
    trim: true,
    index: true 
  },
  repoName: { 
    type: String, 
    required: [true, 'Repository name is required'],
    trim: true 
  },
  repoUrl: { 
    type: String, 
    required: true,
    trim: true 
  },
  isFork: { 
    type: Boolean, 
    default: false 
  },
  defaultBranch: { 
    type: String, 
    default: 'main' 
  },
  stargazersCount: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  languages: [LanguageBreakdownSchema],
  authenticCommits: [AuthenticCommitSchema],
  detectedDependencies: [{ type: String, trim: true }], // e.g. ["express", "react", "prisma", "tailwindcss"]
  hasTestFiles: { 
    type: Boolean, 
    default: false 
  },
  minedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true,
  collection: 'repository_snapshots'
});

// Composite index to prevent duplicate snapshots of the same repo for the same user
RepositorySnapshotSchema.index({ userId: 1, repoName: 1 }, { unique: true });

export const RepositorySnapshot = mongoose.models.RepositorySnapshot || mongoose.model('RepositorySnapshot', RepositorySnapshotSchema);
export default RepositorySnapshot;
