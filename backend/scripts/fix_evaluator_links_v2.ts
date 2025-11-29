
import mongoose from 'mongoose';
import User from '../src/models/User';
import Evaluator from '../src/models/Evaluator';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const fixEvaluatorLinks = async () => {
    try {
        const dbUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/book_management';
        console.error(`Connecting to ${dbUrl}`);

        await mongoose.connect(dbUrl);
        console.error('Connected to MongoDB');

        const evaluators = await Evaluator.find({});
        console.error(`Found ${evaluators.length} evaluators profiles.`);

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
                } else {
                    user.evaluator_id = evaluator._id.toString();
                    await user.save();
                    updatedCount++;
                    console.error(`Linked User ${username} to Evaluator ${evaluator._id}`);
                }
            } else {
                notFoundCount++;
                console.error(`User account not found for evaluator: ${evaluator.name} (${username})`);
            }
        }

        console.error('\nSummary:');
        console.error(`Total Evaluators: ${evaluators.length}`);
        console.error(`Updated Users: ${updatedCount}`);
        console.error(`Already Linked: ${alreadyLinkedCount}`);
        console.error(`User Accounts Not Found: ${notFoundCount}`);

    } catch (error) {
        console.error(`Error: ${error}`);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

fixEvaluatorLinks();
