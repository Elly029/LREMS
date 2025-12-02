
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../src/models/User';
import { connectDatabase } from '../src/config/database';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const migrateRoles = async () => {
    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await connectDatabase();
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

            // Update if role is different or not set (though schema default handles not set, we want to be explicit based on logic)
            if (user.role !== newRole) {
                user.role = newRole as any;
                await user.save();
                console.log(`Updated user ${user.username} to role ${newRole}`);
                updatedCount++;
            }
        }

        console.log(`Migration complete. Updated ${updatedCount} users.`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateRoles();
