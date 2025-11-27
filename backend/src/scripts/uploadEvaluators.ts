import dotenv from 'dotenv';
dotenv.config();

import { connectDatabase } from '../config/database';
import Evaluator from '../models/Evaluator';
import { englishEvaluators } from '../data/englishEvaluators';
import { scienceEvaluators } from '../data/scienceEvaluators';
import { additionalScienceEvaluators } from '../data/additionalScienceEvaluators';
import { makabansaEvaluators } from '../data/makabansaEvaluators';
import { filipinoEvaluators } from '../data/filipinoEvaluators';
import { gmrcEvaluators } from '../data/gmrcEvaluators';
import logger from '../utils/logger';

async function uploadEvaluators() {
    try {
        logger.info('Connecting to database...');
        const connected = await connectDatabase();

        if (!connected) {
            logger.error('Failed to connect to database');
            process.exit(1);
        }

        logger.info('Database connected successfully');

        // Check if evaluators already exist
        const existingCount = await Evaluator.countDocuments();
        logger.info(`Found ${existingCount} existing evaluators in database`);

        // Combine all evaluators
        const allEvaluators = [
            ...englishEvaluators,
            ...scienceEvaluators,
            ...additionalScienceEvaluators,
            ...makabansaEvaluators,
            ...filipinoEvaluators,
            ...gmrcEvaluators,
        ];

        // Upload evaluators
        logger.info(`Uploading ${allEvaluators.length} evaluators:`);
        logger.info(`  - ${englishEvaluators.length} English`);
        logger.info(`  - ${scienceEvaluators.length + additionalScienceEvaluators.length} Science (${scienceEvaluators.length} + ${additionalScienceEvaluators.length} new)`);
        logger.info(`  - ${makabansaEvaluators.length} MAKABANSA`);
        logger.info(`  - ${filipinoEvaluators.length} Filipino`);
        logger.info(`  - ${gmrcEvaluators.length} GMRC/Values Education`);

        let successCount = 0;
        let skipCount = 0;
        let errorCount = 0;

        for (const evaluatorData of allEvaluators) {
            try {
                // Check if evaluator already exists by email
                const existing = await Evaluator.findOne({ depedEmail: evaluatorData.depedEmail });

                if (existing) {
                    logger.info(`Skipping ${evaluatorData.name} - already exists`);
                    skipCount++;
                    continue;
                }

                const evaluator = new Evaluator(evaluatorData);
                await evaluator.save();
                logger.info(`✓ Added: ${evaluatorData.name} (${evaluatorData.areaOfSpecialization})`);
                successCount++;
            } catch (error) {
                logger.error(`✗ Error adding ${evaluatorData.name}:`, error);
                errorCount++;
            }
        }

        logger.info('\n=== Upload Summary ===');
        logger.info(`Successfully added: ${successCount}`);
        logger.info(`Skipped (already exists): ${skipCount}`);
        logger.info(`Errors: ${errorCount}`);
        logger.info(`Total in database: ${await Evaluator.countDocuments()}`);

        process.exit(0);
    } catch (error) {
        logger.error('Upload failed:', error);
        process.exit(1);
    }
}

uploadEvaluators();
