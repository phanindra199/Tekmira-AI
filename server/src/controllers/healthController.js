import { HealthService } from '../services/healthService.js';

/**
 * Health Check Controller
 * Receives incoming HTTP request, delegates to HealthService, and sends formatted HTTP response
 */
export const getHealth = (req, res, next) => {
  try {
    const healthData = HealthService.getHealthInfo();

    return res.status(200).json({
      success: true,
      message: healthData.message
    });
  } catch (error) {
    next(error);
  }
};
