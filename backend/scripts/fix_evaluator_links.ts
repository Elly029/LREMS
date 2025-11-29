
import mongoose from 'mongoose';
import User from '../src/models/User';
import Evaluator from '../src/models/Evaluator';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const fixEvaluatorLinks = async () => {
    const logFile = path.join(__dirname, '../../fix_evaluators_output.txt');
    const log = (msg: string) => {
        console.log(msg);
        fs.appendFileSync(logFile, msg + '\n');
    };

    try {
        fs.writeFileSync(logFile, 'Starting evaluator link fix...\n');
        const dbUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/book_management';
        log(`Connecting to ${dbUrl}`);

        await mongoose.connect(dbUrl);
        log('Connected to MongoDB');

        const evaluators = await Evaluator.find({});
        log(`Found ${evaluators.length} evaluators profiles.`);

        let updatedCount = 0;
        let notFoundCount = 0;
        let alreadyLinkedCount = 0;

        for (const evaluator of evaluators) {
            // Determine username from email if not set
            const username = evaluator.username || evaluator.depedEmail.split('@')[0].toLowerCase();

            const user = await User.findOne({ username: username });

            if (user) {
                if (user.evaluator_id === evaluator._id.toString()) {
                    alreadyLinkedCount++;
                    // log(`User ${username} already linked.`);
                } else {
                    user.evaluator_id = evaluator._id.toString();
                    await user.save();
                    updatedCount++;
                    log(`Linked User ${username} to Evaluator ${evaluator._id}`);
                }
            } else {
                notFoundCount++;
                log(`User account not found for evaluator: ${evaluator.name} (${username})`);
            }
        }

        log('\nSummary:');
        log(`Total Evaluators: ${evaluators.length}`);
        log(`Updated Users: ${updatedCount}`);
        log(`Already Linked: ${alreadyLinkedCount}`);
        log(`User Accounts Not Found: ${notFoundCount}`);

    } catch (error) {
        log(`Error: ${error}`);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

fixEvaluatorLinks();
