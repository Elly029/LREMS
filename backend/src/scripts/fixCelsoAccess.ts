import mongoose from 'mongoose';
import User from '../models/User';

/**
 * Script to fix Celso's access rules to match actual learning area names
 */
async function fixCelsoAccess() {
    try {
        let databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            throw new Error('DATABASE_URL environment variable is required');
        }

        // Force connection to book_management if not already specified
        if (!databaseUrl.includes('book_management')) {
            console.log('⚠️ URL does not specify book_management. Appending it...');
            if (databaseUrl.includes('?')) {
                const parts = databaseUrl.split('?');
                if (parts[0].endsWith('/')) {
                    parts[0] = parts[0].slice(0, -1);
                }
                databaseUrl = `${parts[0]}/book_management?${parts[1]}`;
            } else {
                if (databaseUrl.endsWith('/')) {
                    databaseUrl = databaseUrl.slice(0, -1);
                }
                databaseUrl = databaseUrl + '/book_management';
            }
        }

        console.log('🔗 Connecting to book_management database...');
        await mongoose.connect(databaseUrl);
        console.log('✅ Connected\n');

        // Get Celso's user info
        const celso = await User.findOne({ username: 'celso' });
        if (!celso) {
            console.log('❌ Celso not found!');
            return;
        }

        console.log('📋 Current Access Rules:');
        console.log(JSON.stringify(celso.access_rules, null, 2));

        // Update access rules to match actual database learning areas
        // "Mathematics" -> "MATH"
        // Keep EPP and TLE in case books are added later
        celso.access_rules = [
            {
                learning_areas: ['MATH', 'EPP', 'TLE'],
                grade_levels: []
            }
        ];

        await celso.save();

        console.log('\n✅ Updated Access Rules:');
        console.log(JSON.stringify(celso.access_rules, null, 2));
        console.log('\n✨ Celso should now be able to see MATH books!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

fixCelsoAccess();
