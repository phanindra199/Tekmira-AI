import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string({
    required_error: 'Email address is required'
  })
  .email('Must be a valid email address')
  .trim()
  .toLowerCase(),

  password: z.string({
    required_error: 'Password is required'
  })
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password must not exceed 128 characters'),

  fullName: z.string({
    required_error: 'Full name is required'
  })
  .trim()
  .min(2, 'Full name must be at least 2 characters')
  .max(100, 'Full name cannot exceed 100 characters'),

  githubHandle: z.string().trim().optional().nullable(),
  collegeName: z.string().trim().optional().nullable(),
  graduationYr: z.number().int().min(2020).max(2035).optional().nullable(),
  role: z.enum(['STUDENT', 'RECRUITER']).optional().default('STUDENT')
});

export const loginSchema = z.object({
  email: z.string({
    required_error: 'Email address is required'
  })
  .email('Must be a valid email address')
  .trim()
  .toLowerCase(),

  password: z.string({
    required_error: 'Password is required'
  })
  .min(1, 'Password is required')
});

export default { registerSchema, loginSchema };
