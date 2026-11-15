import { GoogleGenAI } from '@google/genai';
import { AppError } from '../utils/AppError.js';
import { SYSTEM_ASSESSOR_INSTRUCTIONS, createResumeSkillExtractionPrompt } from '../prompts/promptTemplates.js';
import { StructuredResumeAnalysisSchema, geminiResumeAnalysisJsonSchema } from '../validations/structuredOutputSchemas.js';

class GeminiService {
  constructor() {
    this._client = null;
    this._mockClient = null;
  }

  /**
   * Determine whether the Gemini API key is configured.
   * Never logs or exposes the actual key string.
   */
  isConfigured() {
    const key = process.env.GEMINI_API_KEY;
    return typeof key === 'string' && key.trim().length > 0;
  }

  /**
   * Get the configured model name or fallback to default.
   */
  getModelName() {
    return process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  }

  /**
   * Return initialized GoogleGenAI client singleton.
   */
  getClient() {
    if (this._mockClient) {
      return this._mockClient;
    }

    if (!this.isConfigured()) {
      throw new AppError(
        'Gemini API key is not configured on the server. Please add GEMINI_API_KEY to your server environment.',
        503
      );
    }

    if (!this._client) {
      this._client = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY.trim()
      });
    }

    return this._client;
  }

  /**
   * Safe status check without leaking credentials.
   */
  checkHealth() {
    return {
      configured: this.isConfigured(),
      model: this.getModelName(),
      provider: 'Google Gemini AI (@google/genai)'
    };
  }

  /**
   * Set a mock client for automated testing.
   */
  setClientForTesting(mockClient) {
    this._mockClient = mockClient;
  }

  /**
   * Reset mock client after testing.
   */
  resetClientForTesting() {
    this._mockClient = null;
    this._client = null;
  }

  /**
   * Analyze raw candidate resume text using Gemini.
   *
   * @param {string} resumeText - Extracted text from candidate resume
   * @param {object} [options] - Additional prompt parameters or temperature override
   * @returns {Promise<object>} Structured AI extraction result
   */
  async analyzeResumeText(resumeText, options = {}) {
    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 20) {
      throw new AppError('Resume text must be a valid string of at least 20 characters.', 400);
    }

    const ai = this.getClient();
    const model = options.model || this.getModelName();

    const systemInstruction = 
      'You are Tekmira AI\'s technical placement assessor. ' +
      'Evaluate candidate resume text objectively. ' +
      'Extract explicit claimed technical skills, libraries, tools, and reported project scopes. ' +
      'Do not invent, embellish, or hallucinate skills not explicitly stated. ' +
      'Format your response clearly.';

    const prompt = `
Please analyze the following candidate resume text and extract the technical competencies:

Candidate Resume Text:
"""
${resumeText.trim()}
"""

Provide:
1. Candidate Summary
2. Explicit Claimed Skills categorized into:
   - Languages
   - Frontend Frameworks
   - Backend & Databases
   - DevOps & Cloud
   - Tools & Miscellaneous
3. Key Technical Projects identified with reported technologies
4. Initial Placement Assessment and observations regarding claim depth.
`;

    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          temperature: options.temperature ?? 0.2
        }
      });

      const generatedText = response.text || '';

      return {
        model,
        analyzedAt: new Date().toISOString(),
        inputLength: resumeText.length,
        rawAnalysis: generatedText,
        disclaimer: 'This analysis reflects self-reported resume claims and requires GitHub code verification by Tekmira AI.'
      };
    } catch (err) {
      return this._handleGeminiError(err, model);
    }
  }

  /**
   * Extract structured, schema-validated technical skills from candidate resume text.
   * Leverages Gemini responseJsonSchema and enforces server-side Zod verification.
   *
   * @param {string} resumeText
   * @param {object} [options]
   * @returns {Promise<object>} Schema-validated analysis payload
   */
  async extractStructuredSkills(resumeText, options = {}) {
    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length < 20) {
      throw new AppError('Resume text must be a valid string of at least 20 characters.', 400);
    }

    const ai = this.getClient();
    const model = options.model || this.getModelName();
    const prompt = createResumeSkillExtractionPrompt(resumeText);

    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_ASSESSOR_INSTRUCTIONS,
          responseMimeType: 'application/json',
          responseJsonSchema: geminiResumeAnalysisJsonSchema,
          temperature: options.temperature ?? 0.1
        }
      });

      const rawJsonText = response.text || '{}';
      let parsedJson;

      try {
        parsedJson = JSON.parse(rawJsonText);
      } catch (parseErr) {
        throw new AppError('Model returned malformed JSON output that could not be parsed.', 502);
      }

      // STRICT DEFENSIVE BOUNDARY: Validate against Zod schema
      const validatedData = StructuredResumeAnalysisSchema.parse(parsedJson);

      return {
        model,
        analyzedAt: new Date().toISOString(),
        inputLength: resumeText.length,
        promptVersion: '1.0.0',
        data: validatedData,
        disclaimer: 'Extracted competencies reflect self-reported claims. Verification against GitHub repositories is required by Tekmira AI.'
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      if (err.name === 'ZodError') {
        throw new AppError(`Model JSON failed server-side schema validation: ${err.message}`, 502);
      }
      return this._handleGeminiError(err, model);
    }
  }

  /**
   * Internal error mapper for upstream Gemini and network failures.
   */
  _handleGeminiError(err, model) {
    if (err instanceof AppError) throw err;

    const errorMessage = err.message || '';
    const errorStatus = err.status || 500;

    // Rate limit / Quota exceeded
    if (errorStatus === 429 || errorMessage.toLowerCase().includes('quota') || errorMessage.toLowerCase().includes('rate limit')) {
      throw new AppError(
        'Gemini API quota or rate limit reached. Please wait a moment before trying again.',
        429
      );
    }

    // Invalid API Key or Unauthorized
    if (errorStatus === 401 || errorStatus === 403 || errorMessage.toLowerCase().includes('api_key') || errorMessage.toLowerCase().includes('api key')) {
      throw new AppError(
        'Gemini API authentication failed. Verify server GEMINI_API_KEY.',
        502
      );
    }

    // Model not found or invalid argument
    if (errorStatus === 404 || errorMessage.toLowerCase().includes('not found')) {
      throw new AppError(
        `Requested Gemini model '${model}' is not accessible or does not exist.`,
        502
      );
    }

    // Timeout or network error
    if (errorMessage.toLowerCase().includes('timeout') || err.code === 'ETIMEDOUT') {
      throw new AppError(
        'Gemini API request timed out. Please try again.',
        504
      );
    }

    // Generic provider failure (sanitized)
    throw new AppError(
      'Gemini AI provider encountered an error while analyzing the resume.',
      502
    );
  }
}

export const geminiService = new GeminiService();
export default geminiService;
