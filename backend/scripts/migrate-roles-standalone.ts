import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Define User schema inline
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    email: String,
    access_rules: [{
        learning_areas: [String],
        grade_levels: [Number]
    }],
    access_rules_version: { type: Number, default: 1 },
    is_admin_access: { type: Boolean, default: false },
    evaluator_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Evaluator' },
    role: {
        type: String,
        enum: ['Administrator', 'Facilitator', 'Evaluator'],
        default: 'Facilitator',
    },
});

const User = mongoose.model('User', UserSchema);

const migrateRoles = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.DATABASE_URL || 'mongodb://localhost:27017/book_management';
        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        const users = await User.find({});
        console.log(`Found ${users.length} users to check.`);

        let updatedCount = 0;

        for (const user of users) {
            let newRole = 'Facilitator'; // Default

            if (user.is_admin_access) {
                newRole = 'Administrator';
            } else if (user.evaluator_id) {
                newRole = 'Evaluator';
            }

            // Update if role is different or not set
            if (user.role !== newRole) {
                user.role = newRole as any;
                await user.save();
                console.log(`Updated user ${user.username} to role ${newRole}`);
                updatedCount++;
            } else {
                console.log(`User ${user.username} already has correct role: ${user.role}`);
            }
        }

        console.log(`\nMigration complete. Updated ${updatedCount} users.`);
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
};

migrateRoles();
