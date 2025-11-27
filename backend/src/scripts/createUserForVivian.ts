import { connectDatabase, closeConnection } from '../config/database';
import User from '../models/User';
import Evaluator from '../models/Evaluator';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger';

async function createUserAccount() {
    try {
        await connectDatabase();

        const username = 'vivian.intatano';

        // Find the evaluator
        const evaluator = await Evaluator.findOne({ username });
        if (!evaluator) {
            logger.error(`Evaluator with username ${username} not found`);
            return;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            logger.info(`User account already exists for ${username}`);
            return;
        }

        // Create user account
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('BLRLRE', salt);

        const newUser = new User({
            username,
            password: hashedPassword,
            name: evaluator.name,
            access_rules: [],
            is_admin_access: false,
            evaluator_id: evaluator._id.toString(),
        });

        await newUser.save();
        logger.info(`Created user account for ${evaluator.name} with username: ${username}`);
        logger.info('Default password: BLRLRE');

    } catch (error) {
        logger.error('Error creating user account:', error);
    } finally {
        await closeConnection();
    }
}

createUserAccount();
