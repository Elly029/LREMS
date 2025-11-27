import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import app from '@/app';
import logger from '@/utils/logger';
import { connectDatabase } from '@/config/database';
import config from '@/config/environment';

async function startServer() {
  try {
    // Connect to MongoDB
    logger.info('Connecting to MongoDB...');
    const dbConnected = await connectDatabase();
    
    if (!dbConnected) {
      logger.error('Failed to connect to MongoDB. Exiting...');
      process.exit(1);
    }

    // Start the server
    const PORT = config.port;
    
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT} in ${config.nodeEnv} mode`);
      logger.info(`📚 Grades 1 and 3 TX and TM records API ready at http://localhost:${PORT}`);
      logger.info(`🔍 Health check available at http://localhost:${PORT}/health`);
      logger.info(`📖 API documentation available at http://localhost:${PORT}/api-docs`);
    });

  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Promise Rejection:', err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception:', err.message);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();