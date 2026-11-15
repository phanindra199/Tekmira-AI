import { checkDatabaseHealth } from '../config/database.js';

/**
 * Health Service
 * Pure business logic layer for system and database health inspection
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

  /**
   * Retrieves complete system health including database status without credentials
   * @returns {Promise<Object>} Detailed health metrics
   */
  static async getFullHealthInfo() {
    const dbStatus = await checkDatabaseHealth();
    return {
      message: 'Tekmira AI backend is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        provider: 'PostgreSQL (Prisma)',
        status: dbStatus.status,
        connected: dbStatus.connected
      }
    };
  }
}

export default HealthService;
