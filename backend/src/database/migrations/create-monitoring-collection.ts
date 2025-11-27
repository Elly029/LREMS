import mongoose from 'mongoose';
import EvaluationMonitoringModel from '@/models/EvaluationMonitoring';
import logger from '@/utils/logger';

/**
 * Migration script to create the evaluation_monitoring collection
 * and set up indexes
 */
export async function createMonitoringCollection() {
  try {
    logger.info('Creating evaluation monitoring collection...');

    const db = mongoose.connection.db;
    
    if (!db) {
      throw new Error('Database connection not established');
    }

    // Create collection if it doesn't exist
    const collections = await db.listCollections().toArray();
    const collectionExists = collections.some(col => col.name === 'evaluationmonitorings');

    if (!collectionExists) {
      await db.createCollection('evaluationmonitorings');
      logger.info('✓ Collection created');
    } else {
      logger.info('✓ Collection already exists');
    }

    // Ensure indexes are created
    await EvaluationMonitoringModel.createIndexes();
    logger.info('✓ Indexes created');

    logger.info('Migration completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  }
}

// Run migration if executed directly
if (require.main === module) {
  const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/textbooks_inventory';
  
  mongoose.connect(dbUri)
    .then(async () => {
      logger.info('Connected to MongoDB');
      await createMonitoringCollection();
      await mongoose.disconnect();
      logger.info('Disconnected from MongoDB');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Database connection error:', error);
      process.exit(1);
    });
}
