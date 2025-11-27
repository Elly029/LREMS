import { connectDatabase, closeConnection } from '../config/database';
import Evaluator from '../models/Evaluator';
import logger from '../utils/logger';

async function fixUsername() {
    try {
        await connectDatabase();

        // Find evaluators where username is missing or empty
        const evaluators = await Evaluator.find({
            $or: [
                { username: { $exists: false } },
                { username: null },
                { username: '' }
            ]
        });

        logger.info(`Found ${evaluators.length} evaluators without username`);

        for (const evaluator of evaluators) {
            if (evaluator.depedEmail) {
                const username = evaluator.depedEmail.split('@')[0].toLowerCase();
                evaluator.username = username;
                await evaluator.save();
                logger.info(`Updated username for ${evaluator.name} to ${username}`);
            } else {
                logger.warn(`Evaluator ${evaluator.name} has no email, skipping`);
            }
        }

        logger.info('Username fix completed');
    } catch (error) {
        logger.error('Error fixing usernames:', error);
    } finally {
        await closeConnection();
    }
}

fixUsername();
