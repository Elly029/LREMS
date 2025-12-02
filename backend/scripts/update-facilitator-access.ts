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
 * Update facilitator access rules based on their assigned learning areas
 */
async function updateFacilitatorAccessRules() {
    try {
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL is not defined in .env');
        }

        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('✅ Connected to MongoDB\n');

        // Define the access rules for each facilitator
        const facilitatorAccessRules: Record<string, { learning_areas: string[], grade_levels: number[] }> = {
            'celso': {
                learning_areas: ['MATH', 'TLE', 'EPP'],
                grade_levels: [] // All grade levels
            },
            'mak': {
                learning_areas: ['English', 'Reading & Literature'],
                grade_levels: [] // All grade levels
            },
            'rhod': {
                learning_areas: ['Values Education', 'GMRC'],
                grade_levels: [] // All grade levels
            },
            'ven': {
                learning_areas: ['GMRC'],
                grade_levels: [] // All grade levels
            },
            'micah': {
                learning_areas: ['AP', 'MAKABANSA'],
                grade_levels: [] // All grade levels
            },
            'leo': {
                learning_areas: ['Science'],
                grade_levels: [] // All grade levels
            },
            'rejoice': {
                learning_areas: ['Language', 'Filipino'],
                grade_levels: [] // All grade levels
            },
            'jc': {
                learning_areas: ['*'], // All learning areas
                grade_levels: [1, 3] // Only grades 1 and 3
            },
            'nonie': {
                learning_areas: ['*'], // All learning areas
                grade_levels: [1, 3] // Only grades 1 and 3
            }
        };

        console.log('📝 Updating facilitator access rules...\n');

        let updatedCount = 0;
        let notFoundCount = 0;

        for (const [username, accessRule] of Object.entries(facilitatorAccessRules)) {
            const user = await User.findOne({ username: username.toLowerCase() });

            if (!user) {
                console.log(`⚠️  User "${username}" not found - skipping`);
                notFoundCount++;
                continue;
            }

            // Update the access rules and increment version
            user.access_rules = [accessRule];
            user.is_admin_access = false; // Ensure they're not admin
            user.access_rules_version = (user.access_rules_version || 1) + 1; // Increment version
            await user.save();

            console.log(`✅ Updated ${username}:`);
            console.log(`   Name: ${user.name}`);
            console.log(`   Learning Areas: ${accessRule.learning_areas.join(', ')}`);
            console.log(`   Grade Levels: ${accessRule.grade_levels.length > 0 ? accessRule.grade_levels.join(', ') : 'All'}`);
            console.log(`   Version: ${user.access_rules_version} (incremented for cache invalidation)`);
            console.log('');

            updatedCount++;
        }

        console.log('═'.repeat(60));
        console.log(`\n✅ Update completed!`);
        console.log(`   Updated: ${updatedCount} users`);
        console.log(`   Not found: ${notFoundCount} users`);
        console.log('\n📌 Summary of Access Rules:');
        console.log('   • celso: MATH, TLE, EPP (all grades)');
        console.log('   • mak: English, Reading & Literature (all grades)');
        console.log('   • rhod: Values Education, GMRC (all grades)');
        console.log('   • ven: GMRC (all grades)');
        console.log('   • micah: AP, MAKABANSA (all grades)');
        console.log('   • leo: Science (all grades)');
        console.log('   • rejoice: Language, Filipino (all grades)');
        console.log('   • jc: All Learning Areas (Grades 1 and 3 only)');
        console.log('   • nonie: All Learning Areas (Grades 1 and 3 only)');
        console.log('\n💡 Next steps:');
        console.log('   1. Users should log out and log back in');
        console.log('   2. Verify they see only books in their assigned areas/grades');
        console.log('   3. Test filtering and monitoring features\n');

    } catch (error) {
        console.error('❌ Error updating facilitator access rules:', error);
        throw error;
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the update
updateFacilitatorAccessRules();
