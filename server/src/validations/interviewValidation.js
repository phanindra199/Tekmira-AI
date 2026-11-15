import { z } from 'zod';

export const createInterviewSessionSchema = z.object({
  reportId: z.string().trim().optional(),
  targetRole: z.string({ required_error: 'Target role is required' })
    .trim()
    .min(2, 'Target role must be at least 2 characters')
    .max(100, 'Target role cannot exceed 100 characters'),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional().default('INTERMEDIATE'),
  skills: z.array(z.string().trim().min(1)).optional()
});

export const evaluateAnswerSchema = z.object({
  questionIndex: z.coerce.number().int().min(0, 'Question index must be non-negative'),
  studentAnswer: z.string({ required_error: 'Answer text is required' })
    .trim()
    .min(15, 'Answer must contain at least 15 characters of technical explanation')
    .max(4000, 'Answer cannot exceed 4,000 characters')
});

export default {
  createInterviewSessionSchema,
  evaluateAnswerSchema
};
