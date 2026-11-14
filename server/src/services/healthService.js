/**
 * Health Service
 * Pure business logic layer for system health inspection
 */
export class HealthService {
  /**
   * Retrieves system operational status
   * @returns {Object} System health details
   */
  static getHealthInfo() {
    return {
      message: 'Tekmira AI backend is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    };
  }
}
