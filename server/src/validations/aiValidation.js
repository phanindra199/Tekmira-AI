import { z } from 'zod';

export const analyzeResumeSchema = z.object({
  body: z.object({
    resumeText: z
      .string({ required_error: 'Resume text is required' })
      .trim()
      .min(20, 'Resume text must be at least 20 characters long')
      .max(50000, 'Resume text exceeds maximum allowed length of 50,000 characters')
  })
});
