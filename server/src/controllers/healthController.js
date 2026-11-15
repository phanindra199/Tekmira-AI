import { HealthService } from '../services/healthService.js';

/**
 * Health Check Controller
 * Receives incoming HTTP request, delegates to HealthService, and sends formatted HTTP response
 */
export const getHealth = async (req, res, next) => {
  try {
    const isDetailed = req.query.detailed === 'true';
    
    if (isDetailed) {
      const fullHealth = await HealthService.getFullHealthInfo();
      return res.status(200).json({
        success: true,
        message: fullHealth.message,
        database: fullHealth.database
      });
    }

    const healthData = HealthService.getHealthInfo();
    return res.status(200).json({
      success: true,
      message: healthData.message
    });
  } catch (error) {
    next(error);
  }
};
