import app from './app.js';
import { config } from './config/env.js';
import { disconnectDatabase } from './config/database.js';
import { connectMongo, disconnectMongo } from './config/mongoDatabase.js';

const PORT = config.port;

// Start HTTP Server
const server = app.listen(PORT, async () => {
  console.log(`===============================================`);
  console.log(`🚀 Tekmira AI Backend Server Active`);
  console.log(`📡 Port:        ${PORT}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Health URL:  http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);

  // Attempt non-blocking document store connection
  await connectMongo();
});

// Graceful Shutdown Handlers
const handleShutdown = async (signal) => {
  console.log(`\n[Server] Received ${signal}. Closing HTTP server gracefully...`);
  
  // Close database connections cleanly
  await Promise.allSettled([
    disconnectDatabase(),
    disconnectMongo()
  ]);

  server.close(() => {
    console.log('[Server] HTTP server closed and databases disconnected. Process terminated.');
    process.exit(0);
  });

  // Force close if graceful shutdown takes longer than 10 seconds
  setTimeout(() => {
    console.error('[Server] Forcing shutdown due to timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

// Process Safety Nets for Production Stability
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Process Safety] Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[Process Safety] Uncaught Exception:', error);
  // Allow pending logs to flush, then terminate cleanly for orchestrator restart
  setTimeout(() => process.exit(1), 1000);
});
