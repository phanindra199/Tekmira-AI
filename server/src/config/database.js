import { PrismaClient } from '@prisma/client';
import { config } from './env.js';

let prismaInstance = null;

/**
 * Returns a singleton Prisma Client instance
 * Configured with query logging in development and error logging in production
 */
export function getPrismaClient() {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log: config.isProduction ? ['error'] : ['warn', 'error'],
      errorFormat: 'minimal'
    });
  }
  return prismaInstance;
}

/**
 * Checks PostgreSQL database connectivity safely
 * Never exposes credentials, hosts, or passwords to callers or logs
 * 
 * @returns {Promise<{ status: string, connected: boolean, message: string }>}
 */
export async function checkDatabaseHealth() {
  if (!config.databaseUrl) {
    return {
      status: 'unconfigured',
      connected: false,
      message: 'PostgreSQL DATABASE_URL is not configured'
    };
  }

  try {
    const prisma = getPrismaClient();
    // Execute a fast, lightweight ping query
    await prisma.$queryRaw`SELECT 1 as ping`;
    
    return {
      status: 'connected',
      connected: true,
      message: 'PostgreSQL connection healthy'
    };
  } catch (error) {
    return {
      status: 'disconnected',
      connected: false,
      message: 'PostgreSQL database server unreachable'
    };
  }
}

/**
 * Gracefully disconnects Prisma client on process termination
 */
export async function disconnectDatabase() {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    prismaInstance = null;
  }
}

export default { getPrismaClient, checkDatabaseHealth, disconnectDatabase };
