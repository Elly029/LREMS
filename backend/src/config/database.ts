// Database configuration for the Grades 1 and 3 TX and TM records
import mongoose from 'mongoose';
import config from './environment';
import logger from '@/utils/logger';

// MongoDB connection
export const connectDatabase = async (): Promise<boolean> => {
  try {
    const mongoUri = config.database.url || 'mongodb://localhost:27017/book_management';
    
    await mongoose.connect(mongoUri, {
      maxPoolSize: config.database.poolMax,
      minPoolSize: config.database.poolMin,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info('✅ MongoDB connection successful');
    return true;
  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error);
    return false;
  }
};

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    if (mongoose.connection.readyState === 1) {
      return true;
    }
    return await connectDatabase();
  } catch (error) {
    logger.error('Database connection test failed:', error);
    return false;
  }
};

// Close database connection
export const closeConnection = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  logger.info('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  logger.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose disconnected from MongoDB');
});

export default mongoose;