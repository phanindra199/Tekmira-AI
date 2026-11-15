import { checkDatabaseHealth } from '../config/database.js';
import { checkMongoHealth } from '../config/mongoDatabase.js';

/**
 * Health Service
 * Pure business logic layer for system and polyglot database health inspection
 */
export class HealthService {
  /**
   * Retrieves basic system operational status
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
   * Retrieves complete system health including polyglot database status without credentials
   * @returns {Promise<Object>} Detailed health metrics
   */
  static async getFullHealthInfo() {
    const [pgStatus, mongoStatus] = await Promise.all([
      checkDatabaseHealth(),
      checkMongoHealth()
    ]);

    return {
      message: 'Tekmira AI backend is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        provider: 'PostgreSQL (Prisma)',
        status: pgStatus.status,
        connected: pgStatus.connected
      },
      databases: {
        relational: {
          provider: 'PostgreSQL (Prisma)',
          status: pgStatus.status,
          connected: pgStatus.connected
        },
        document: {
          provider: 'MongoDB (Mongoose)',
          status: mongoStatus.status,
          connected: mongoStatus.connected
        }
      }
    };
  }
}

export default HealthService;
