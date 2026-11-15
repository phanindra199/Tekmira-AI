import geminiService from '../services/geminiService.js';

export class AiController {
  /**
   * POST /api/ai/analyze-resume
   * Analyze raw candidate resume text via Gemini.
   */
  static async analyzeResume(req, res, next) {
    try {
      const { resumeText, model, temperature } = req.body;
      const result = await geminiService.analyzeResumeText(resumeText, { model, temperature });

      return res.status(200).json({
        success: true,
        message: 'Resume analyzed successfully with Gemini AI',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/ai/extract-skills
   * Extract structured, schema-validated skills and project evidence.
   */
  static async extractSkills(req, res, next) {
    try {
      const { resumeText, model, temperature } = req.body;
      const result = await geminiService.extractStructuredSkills(resumeText, { model, temperature });

      return res.status(200).json({
        success: true,
        message: 'Structured skills extracted and validated successfully',
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/ai/status
   * Safe status check of Gemini AI service.
   */
  static async getStatus(req, res, next) {
    try {
      const health = geminiService.checkHealth();
      return res.status(200).json({
        success: true,
        message: 'Gemini AI service status retrieved',
        data: health
      });
    } catch (err) {
      next(err);
    }
  }
}

export default AiController;
