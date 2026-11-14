import app from './app.js';
import { config } from './config/env.js';

const PORT = config.port;

// Start HTTP Server
const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Tekmira AI Backend Server Active`);
  console.log(`📡 Port:        ${PORT}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Health URL:  http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);
});

// Graceful Shutdown Handlers
const handleShutdown = (signal) => {
  console.log(`\n[Server] Received ${signal}. Closing HTTP server gracefully...`);
  server.close(() => {
    console.log('[Server] HTTP server closed. Process terminated.');
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
