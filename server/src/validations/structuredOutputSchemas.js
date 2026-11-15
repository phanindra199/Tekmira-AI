import { z } from 'zod';
import { Type } from '@google/genai';

/**
 * Standardized Skill Categories across Tekmira AI.
 */
export const SkillCategoryEnum = z.enum([
  'LANGUAGES',
  'FRONTEND',
  'BACKEND',
  'DATABASES',
  'DEVOPS_CLOUD',
  'TESTING_QUALITY',
  'TOOLS_OTHER'
]);

/**
 * Zod Schema for an extracted technical skill claim.
 */
export const ExtractedSkillSchema = z.object({
  skillName: z.string().trim().min(1, 'Skill name cannot be empty'),
  category: SkillCategoryEnum.catch('TOOLS_OTHER'),
  confidence: z.number().min(0).max(1).default(0.8),
  evidenceSnippet: z.string().default(''),
  context: z.string().default('')
});

/**
 * Zod Schema for an extracted academic or portfolio project.
 */
export const ExtractedProjectSchema = z.object({
  projectName: z.string().trim().min(1, 'Project name cannot be empty'),
  description: z.string().default(''),
  technologies: z.array(z.string()).default([])
});

/**
 * Zod Schema for complete structured resume claim analysis.
 * Acts as the server-side validator for model JSON responses.
 */
export const StructuredResumeAnalysisSchema = z.object({
  candidateName: z.string().nullable().optional(),
  summary: z.string().default('Candidate resume parsed.'),
  overallConfidence: z.number().min(0).max(1).default(0.7),
  skills: z.array(ExtractedSkillSchema).default([]),
  projects: z.array(ExtractedProjectSchema).default([]),
  unsubstantiatedClaims: z.array(z.string()).default([]),
  uncertainties: z.array(z.string()).default([])
});

/**
 * Gemini responseJsonSchema configuration conforming to OpenAPI 3.0 via @google/genai.
 * This instructs the Gemini model to output strictly typed JSON matching this schema.
 */
export const geminiResumeAnalysisJsonSchema = {
  type: Type.OBJECT,
  properties: {
    candidateName: {
      type: Type.STRING,
      description: 'Candidate full name if present on resume, else null.'
    },
    summary: {
      type: Type.STRING,
      description: 'A 2-3 sentence executive technical summary of the candidate claims.'
    },
    overallConfidence: {
      type: Type.NUMBER,
      description: 'Confidence in parsing clarity from 0.0 (unclear/sparse) to 1.0 (clear/detailed).'
    },
    skills: {
      type: Type.ARRAY,
      description: 'List of all explicit technical skills and tools claimed on the resume.',
      items: {
        type: Type.OBJECT,
        properties: {
          skillName: {
            type: Type.STRING,
            description: 'Canonical skill or tool name (e.g. React, PostgreSQL, Python).'
          },
          category: {
            type: Type.STRING,
            enum: [
              'LANGUAGES',
              'FRONTEND',
              'BACKEND',
              'DATABASES',
              'DEVOPS_CLOUD',
              'TESTING_QUALITY',
              'TOOLS_OTHER'
            ],
            description: 'Standardized skill category.'
          },
          confidence: {
            type: Type.NUMBER,
            description: 'Confidence in this specific claim from 0.0 to 1.0.'
          },
          evidenceSnippet: {
            type: Type.STRING,
            description: 'Exact direct quote or context line from the resume where the skill was claimed.'
          },
          context: {
            type: Type.STRING,
            description: 'Project or role where the candidate reported using this skill.'
          }
        },
        required: ['skillName', 'category', 'confidence']
      }
    },
    projects: {
      type: Type.ARRAY,
      description: 'Portfolio, academic, or capstone projects listed on the resume.',
      items: {
        type: Type.OBJECT,
        properties: {
          projectName: {
            type: Type.STRING,
            description: 'Title or name of the project.'
          },
          description: {
            type: Type.STRING,
            description: 'Brief overview of project scope.'
          },
          technologies: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Technologies, languages, or tools reported for this project.'
          }
        },
        required: ['projectName', 'technologies']
      }
    },
    unsubstantiatedClaims: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Skills listed in bullet points that have zero project or implementation context.'
    },
    uncertainties: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Ambiguities, contradictory timelines, or unverified claims detected in the resume.'
    }
  },
  required: ['summary', 'skills', 'projects', 'unsubstantiatedClaims', 'uncertainties']
};
