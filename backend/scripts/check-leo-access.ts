import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// User model
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

const User = mongoose.model('User', UserSchema);

async function checkLeoAccess() {
    try {
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL is not defined in .env');
        }

        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('✅ Connected to MongoDB\n');

        // Find Leo's user account
        const user = await User.findOne({ username: 'leo' });

        if (!user) {
            console.log('❌ User "leo" not found!');
            return;
        }

        console.log('👤 User Information:');
        console.log('   Username:', user.username);
        console.log('   Name:', user.name);
        console.log('   Is Admin:', user.is_admin_access || false);
        console.log('   Version:', user.access_rules_version || 1);
        console.log('   Access Rules:', JSON.stringify(user.access_rules, null, 2));
        console.log('');

        if (!user.access_rules || user.access_rules.length === 0) {
            console.log('⚠️  WARNING: No access rules defined!');
            console.log('   This user will not see any books.');
        } else {
            console.log('✅ Access Rules Configured:');
            user.access_rules.forEach((rule, index) => {
                console.log(`   Rule ${index + 1}:`);
                console.log(`      Learning Areas: ${rule.learning_areas.join(', ')}`);
                console.log(`      Grade Levels: ${rule.grade_levels.length > 0 ? rule.grade_levels.join(', ') : 'All'}`);
            });
        }

        console.log('\n📌 Expected Access:');
        console.log('   Learning Areas: Science');
        console.log('   Grade Levels: All');
        console.log('   Is Admin: false');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

checkLeoAccess();
