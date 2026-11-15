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


/**
 * Zod Schema for Grounded Technical Viva Voce Questions
 */
export const InterviewQuestionSchema = z.object({
  questionIndex: z.number().int().min(0),
  skill: z.string().trim().min(1),
  concept: z.string().trim().min(1),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('INTERMEDIATE'),
  questionText: z.string().trim().min(10),
  fileCitation: z.string().default('Repository codebase'),
  expectedTopics: z.array(z.string()).min(1)
});

export const GeneratedInterviewSessionSchema = z.object({
  targetRole: z.string().default('Junior Full Stack Engineer'),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).default('INTERMEDIATE'),
  questions: z.array(InterviewQuestionSchema).min(1),
  overviewNotes: z.string().default('')
});

/**
 * Gemini OpenAPI Schema for Grounded Interview Questions Generation
 */
export const geminiInterviewQuestionsJsonSchema = {
  type: Type.OBJECT,
  properties: {
    targetRole: { type: Type.STRING },
    difficulty: { type: Type.STRING, enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] },
    overviewNotes: { type: Type.STRING },
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          questionIndex: { type: Type.INTEGER },
          skill: { type: Type.STRING },
          concept: { type: Type.STRING },
          difficulty: { type: Type.STRING, enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] },
          questionText: { type: Type.STRING },
          fileCitation: { type: Type.STRING },
          expectedTopics: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ['questionIndex', 'skill', 'concept', 'questionText', 'expectedTopics']
      }
    }
  },
  required: ['questions', 'difficulty']
};

/**
 * Zod Schema for Grounded Viva Voce Answer Evaluation
 */
export const EvaluatedAnswerSchema = z.object({
  score: z.number().min(0).max(100),
  feedback: z.string().min(10),
  correctPoints: z.array(z.string()).default([]),
  missedGaps: z.array(z.string()).default([]),
  rubricBreakdown: z.object({
    technicalAccuracy: z.number().min(0).max(100).default(75),
    evidenceAwareness: z.number().min(0).max(100).default(70),
    conceptualClarity: z.number().min(0).max(100).default(80)
  }).default({
    technicalAccuracy: 75,
    evidenceAwareness: 70,
    conceptualClarity: 80
  }),
  uncertaintyNotice: z.string().default(
    'AI viva evaluation is advisory and formative. It is designed for interview practice and is not equivalent to a human academic assessor.'
  )
});

/**
 * Gemini OpenAPI Schema for Viva Voce Answer Evaluation
 */
export const geminiEvaluatedAnswerJsonSchema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.NUMBER, description: 'Overall score from 0 to 100 based on the 3-part rubric.' },
    feedback: { type: Type.STRING, description: 'Constructive academic evaluation feedback.' },
    correctPoints: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Specific correct technical points made by the student.'
    },
    missedGaps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Key technical aspects or implementation trade-offs the student omitted.'
    },
    rubricBreakdown: {
      type: Type.OBJECT,
      properties: {
        technicalAccuracy: { type: Type.NUMBER, description: 'Score (0-100) for factual correctness.' },
        evidenceAwareness: { type: Type.NUMBER, description: 'Score (0-100) for familiarity with project implementation.' },
        conceptualClarity: { type: Type.NUMBER, description: 'Score (0-100) for clear communication.' }
      },
      required: ['technicalAccuracy', 'evidenceAwareness', 'conceptualClarity']
    },
    uncertaintyNotice: {
      type: Type.STRING,
      description: 'Disclaimer regarding AI-assisted evaluation limits.'
    }
  },
  required: ['score', 'feedback', 'correctPoints', 'missedGaps', 'rubricBreakdown']
};
