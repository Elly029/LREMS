import mongoose from 'mongoose';
import User from '../models/User';
import config from '../config/environment';

/**
 * Script to update Leo and Celso from admin users to regular users
 * This ensures they only see books in their assigned learning areas
 */
async function updateUserAccess() {
    try {
        // Connect to MongoDB
        if (!config.database.url) {
            throw new Error('Database URL is not configured');
        }
        await mongoose.connect(config.database.url);
        console.log('✅ Connected to MongoDB');

        // Update Leo - Science only
        const leoResult = await User.updateOne(
            { username: 'leo' },
            {
                $set: {
                    is_admin_access: false,
                    access_rules: [{ learning_areas: ['Science'], grade_levels: [] }]
                }
            }
        );
        console.log(`✅ Updated Leo: ${leoResult.modifiedCount} document(s) modified`);

        // Update Celso - Math, EPP, TLE only
        const celsoResult = await User.updateOne(
            { username: 'celso' },
            {
                $set: {
                    is_admin_access: false,
                    access_rules: [{ learning_areas: ['Mathematics', 'EPP', 'TLE'], grade_levels: [] }]
                }
            }
        );
        console.log(`✅ Updated Celso: ${celsoResult.modifiedCount} document(s) modified`);

        // Verify the updates
        const leo = await User.findOne({ username: 'leo' }).select('-password');
        const celso = await User.findOne({ username: 'celso' }).select('-password');

        console.log('\n📋 Updated User Details:');
        console.log('\nLeo:', {
            username: leo?.username,
            name: leo?.name,
            is_admin_access: leo?.is_admin_access,
            access_rules: leo?.access_rules
        });
        console.log('\nCelso:', {
            username: celso?.username,
            name: celso?.name,
            is_admin_access: celso?.is_admin_access,
            access_rules: celso?.access_rules
        });

        console.log('\n✅ Migration completed successfully!');
        console.log('\n📌 Next steps:');
        console.log('   1. Restart your backend server');
        console.log('   2. Log out and log back in as Leo or Celso');
        console.log('   3. Verify they only see books in their assigned learning areas');

    } catch (error) {
        console.error('❌ Error updating user access:', error);
        throw error;
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
    }
}

// Run the migration
updateUserAccess()
    .then(() => {
        console.log('\n✨ Script completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Script failed:', error);
        process.exit(1);
    });
