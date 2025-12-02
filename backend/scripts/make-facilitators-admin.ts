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
 * Make facilitators admin while keeping their access rules
 */
async function makeFacilitatorsAdmin() {
    try {
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL is not defined in .env');
        }

        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('✅ Connected to MongoDB\n');

        // List of facilitators to make admin
        const facilitators = [
            'celso',
            'mak',
            'rhod',
            'ven',
            'micah',
            'leo',
            'rejoice'
        ];

        console.log('📝 Making facilitators admin...\n');

        let updatedCount = 0;
        let notFoundCount = 0;

        for (const username of facilitators) {
            const user = await User.findOne({ username: username.toLowerCase() });

            if (!user) {
                console.log(`⚠️  User "${username}" not found - skipping`);
                notFoundCount++;
                continue;
            }

            // Make them admin and increment version
            user.is_admin_access = true;
            user.access_rules_version = (user.access_rules_version || 1) + 1; // Increment version
            await user.save();

            console.log(`✅ Updated ${username}:`);
            console.log(`   Name: ${user.name}`);
            console.log(`   Is Admin: ${user.is_admin_access}`);
            console.log(`   Access Rules: ${user.access_rules.length > 0 ? 'Kept (for reference)' : 'None'}`);
            if (user.access_rules.length > 0) {
                user.access_rules.forEach((rule, index) => {
                    console.log(`      Rule ${index + 1}: ${rule.learning_areas.join(', ')} (Grades: ${rule.grade_levels.length > 0 ? rule.grade_levels.join(', ') : 'All'})`);
                });
            }
            console.log(`   Version: ${user.access_rules_version} (incremented for cache invalidation)`);
            console.log('');

            updatedCount++;
        }

        console.log('═'.repeat(60));
        console.log(`\n✅ Update completed!`);
        console.log(`   Updated: ${updatedCount} users`);
        console.log(`   Not found: ${notFoundCount} users`);
        console.log('\n📌 Summary:');
        console.log('   All listed facilitators are now admins');
        console.log('   They have full access to all books and features');
        console.log('   Their access rules are kept for reference');
        console.log('   Version incremented to force re-login');
        console.log('\n💡 Next steps:');
        console.log('   1. Users will be auto-logged out within 5 minutes');
        console.log('   2. They log back in as admins');
        console.log('   3. They now have full system access\n');

    } catch (error) {
        console.error('❌ Error making facilitators admin:', error);
        throw error;
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the update
makeFacilitatorsAdmin();
