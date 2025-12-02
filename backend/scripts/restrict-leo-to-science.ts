import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// User model interface
interface IAccessRule {
    learning_areas: string[];
    grade_levels: number[];
}

interface IUser extends mongoose.Document {
    username: string;
    name: string;
    access_rules: IAccessRule[];
    access_rules_version?: number;
    is_admin_access?: boolean;
}

// Define User Schema
const AccessRuleSchema = new mongoose.Schema({
    learning_areas: { type: [String], default: [] },
    grade_levels: { type: [Number], default: [] }
}, { _id: false });

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    name: String,
    access_rules: [AccessRuleSchema],
    access_rules_version: { type: Number, default: 1 },
    is_admin_access: { type: Boolean, default: false },
    evaluator_id: String,
    created_at: Date,
    updated_at: Date
});

const User = mongoose.model<IUser>('User', UserSchema);

/**
 * Make Leo a regular facilitator with Science-only access
 */
async function restrictLeoToScience() {
    try {
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL is not defined in .env');
        }

        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('✅ Connected to MongoDB\n');

        const user = await User.findOne({ username: 'leo' });

        if (!user) {
            console.log('❌ User "leo" not found');
            return;
        }

        console.log('📝 Current status:');
        console.log(`   Name: ${user.name}`);
        console.log(`   Is Admin: ${user.is_admin_access}`);
        console.log(`   Current Version: ${user.access_rules_version || 1}`);
        console.log('');

        // Remove admin status and set Science-only access
        user.is_admin_access = false;
        user.access_rules = [{
            learning_areas: ['Science'],
            grade_levels: [] // All grade levels
        }];
        user.access_rules_version = (user.access_rules_version || 1) + 1; // Increment version
        await user.save();

        console.log('✅ Updated Leo:');
        console.log(`   Name: ${user.name}`);
        console.log(`   Is Admin: ${user.is_admin_access}`);
        console.log(`   Learning Areas: Science`);
        console.log(`   Grade Levels: All`);
        console.log(`   New Version: ${user.access_rules_version} (incremented for cache invalidation)`);
        console.log('');

        console.log('═'.repeat(60));
        console.log('\n✅ Update completed!');
        console.log('\n📌 Summary:');
        console.log('   • Leo is now a regular facilitator (not admin)');
        console.log('   • Can only see Science books (all grade levels)');
        console.log('   • Version incremented to force re-login');
        console.log('\n💡 Next steps:');
        console.log('   1. Leo will be auto-logged out within 5 minutes');
        console.log('   2. He logs back in');
        console.log('   3. He will only see Science books\n');

    } catch (error) {
        console.error('❌ Error updating Leo:', error);
        throw error;
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the update
restrictLeoToScience();
