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
    const PORT = process.env.PORT || config.port || 3000;
    const HOST = '0.0.0.0'; // Required for Railway and containerized deployments

    const server = app.listen(PORT, HOST, () => {
      logger.info(`🚀 Server running on ${HOST}:${PORT} in ${config.nodeEnv} mode`);
      logger.info(`📚 LR-EMS API ready`);
      logger.info(`🔍 Health check available at /health`);
      logger.info(`📖 API base URL: /api`);
    });

    // Handle server errors
    server.on('error', (error) => {
      logger.error('Server error:', error);
      process.exit(1);
    });

    // Handle server close
    server.on('close', () => {
      logger.info('Server closed');
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