
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Define Schemas locally to avoid import issues
const UserSchema = new mongoose.Schema({
    username: String,
    name: String,
    evaluator_id: String,
    is_admin_access: Boolean
});
const User = mongoose.model('User', UserSchema);

const EvaluatorSchema = new mongoose.Schema({
    name: String,
    depedEmail: String,
    username: String
});
const Evaluator = mongoose.model('Evaluator', EvaluatorSchema);

const fixEvaluatorLinks = async () => {
    try {
        const dbUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/book_management';
        console.log(`Connecting to ${dbUrl}`);

        await mongoose.connect(dbUrl);
        console.log('Connected to MongoDB');

        const evaluators = await Evaluator.find({});
        console.log(`Found ${evaluators.length} evaluators profiles.`);

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
                    console.log(`Linked User ${username} to Evaluator ${evaluator._id}`);
                }
            } else {
                notFoundCount++;
                console.log(`User account not found for evaluator: ${evaluator.name} (${username})`);
            }
        }

        console.log('\nSummary:');
        console.log(`Total Evaluators: ${evaluators.length}`);
        console.log(`Updated Users: ${updatedCount}`);
        console.log(`Already Linked: ${alreadyLinkedCount}`);
        console.log(`User Accounts Not Found: ${notFoundCount}`);

    } catch (error) {
        console.error(`Error: ${error}`);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

fixEvaluatorLinks();
