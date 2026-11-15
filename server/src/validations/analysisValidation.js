import { z } from 'zod';

export const createResumeSchema = z.object({
  userId: z.string({ required_error: 'User ID is required' }).min(1),
  fileName: z.string({ required_error: 'File name is required' }).trim().min(1),
  fileSize: z.number({ required_error: 'File size is required' }).nonnegative(),
  mimeType: z.string().optional().default('application/pdf'),
  rawText: z.string({ required_error: 'Extracted text is required' }).min(10, 'Resume raw text must contain at least 10 characters'),
  extractedClaims: z.object({
    skills: z.array(z.object({
      name: z.string().min(1),
      category: z.string().optional(),
      confidence: z.number().min(0).max(1).optional()
    })).optional(),
    projects: z.array(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      technologies: z.array(z.string()).optional()
    })).optional(),
    education: z.array(z.any()).optional(),
    experienceYears: z.number().nonnegative().optional()
  }).optional()
});

export const saveRepositorySchema = z.object({
  userId: z.string({ required_error: 'User ID is required' }).min(1),
  githubHandle: z.string({ required_error: 'GitHub handle is required' }).trim().min(1),
  repoName: z.string({ required_error: 'Repository name is required' }).trim().min(1),
  repoUrl: z.string({ required_error: 'Repository URL is required' }).url('Must be a valid URL'),
  isFork: z.boolean().optional().default(false),
  languages: z.array(z.object({
    name: z.string(),
    bytes: z.number().nonnegative(),
    percentage: z.number().min(0).max(100)
  })).optional(),
  detectedDependencies: z.array(z.string()).optional(),
  hasTestFiles: z.boolean().optional().default(false)
});

export const createReportSchema = z.object({
  userId: z.string({ required_error: 'User ID is required' }).min(1),
  jobId: z.string({ required_error: 'Job ID is required' }).min(1),
  overallReadinessScore: z.number().min(0).max(100),
  summary: z.string().min(10, 'Summary must be at least 10 characters'),
  triangulationMatrix: z.array(z.object({
    skillName: z.string().min(1),
    isClaimedInResume: z.boolean().default(false),
    isDemonstratedInCode: z.boolean().default(false),
    isRequiredInJob: z.boolean().default(false),
    verificationStatus: z.enum(['VERIFIED', 'INFLATED_CLAIM', 'UNCLAIMED_STRENGTH', 'MISSING_CRITICAL'])
  })).min(1, 'At least one skill must be evaluated')
});

export default { createResumeSchema, saveRepositorySchema, createReportSchema };
