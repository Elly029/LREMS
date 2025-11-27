import { connectDatabase, closeConnection } from '../config/database';
import User from '../models/User';
import Evaluator from '../models/Evaluator';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger';

async function createAllEvaluatorAccounts() {
    try {
        await connectDatabase();
        logger.info('Connected to database');

        // Get all evaluators
        const evaluators = await Evaluator.find();
        logger.info(`Found ${evaluators.length} evaluators`);

        const defaultPassword = 'BLRLRE';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(defaultPassword, salt);

        let created = 0;
        let skipped = 0;
        let errors = 0;

        for (const evaluator of evaluators) {
            try {
                // Create username from DepEd email (before @)
                const username = evaluator.depedEmail.split('@')[0].toLowerCase();

                // Check if account already exists
                const existingUser = await User.findOne({ username });
                if (existingUser) {
                    logger.info(`⏭️  Skipped: ${evaluator.name} (${username}) - account already exists`);
                    skipped++;
                    continue;
                }

                // Create user account
                const newUser = new User({
                    username,
                    password: hashedPassword,
                    name: evaluator.name,
                    access_rules: [],
                    is_admin_access: false,
                    evaluator_id: evaluator._id.toString(),
                });

                await newUser.save();

                // Update evaluator with username
                evaluator.username = username;
                await evaluator.save();

                logger.info(`✅ Created: ${evaluator.name} (${username})`);
                created++;
            } catch (error: any) {
                logger.error(`❌ Error creating account for ${evaluator.name}:`, error.message);
                errors++;
            }
        }

        logger.info('\n=== Summary ===');
        logger.info(`✅ Created: ${created}`);
        logger.info(`⏭️  Skipped: ${skipped}`);
        logger.info(`❌ Errors: ${errors}`);
        logger.info(`📊 Total evaluators: ${evaluators.length}`);
        logger.info(`\n🔑 Default password for all evaluator accounts: ${defaultPassword}`);

    } catch (error) {
        logger.error('Error creating evaluator accounts:', error);
    } finally {
        await closeConnection();
    }
}

createAllEvaluatorAccounts();
