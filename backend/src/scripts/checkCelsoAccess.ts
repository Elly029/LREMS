import mongoose from 'mongoose';
import User from '../models/User';
import BookModel from '../models/Book';

/**
 * Script to check Celso's access and matching books
 */
async function checkCelsoAccess() {
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

        console.log('👤 Celso\'s User Info:');
        console.log(`   Username: ${celso.username}`);
        console.log(`   Name: ${celso.name}`);
        console.log(`   Is Admin: ${celso.is_admin_access}`);
        console.log(`   Access Rules: ${JSON.stringify(celso.access_rules, null, 2)}`);
        console.log('\n' + '='.repeat(60) + '\n');

        // Get all learning areas in the database
        const allLearningAreas = await BookModel.distinct('learning_area');
        console.log('📚 All Learning Areas in Database:');
        allLearningAreas.forEach(area => console.log(`   - ${area}`));
        console.log('\n' + '='.repeat(60) + '\n');

        // Check what Celso should have access to
        console.log('🔍 Celso\'s Access Rules specify:');
        celso.access_rules.forEach((rule, index) => {
            console.log(`   Rule ${index + 1}:`);
            console.log(`     Learning Areas: ${rule.learning_areas.join(', ')}`);
            console.log(`     Grade Levels: ${rule.grade_levels?.length ? rule.grade_levels.join(', ') : 'All'}`);
        });
        console.log('\n' + '='.repeat(60) + '\n');

        // Check for matching books
        console.log('📖 Checking for matching books...\n');

        for (const rule of celso.access_rules) {
            for (const area of rule.learning_areas) {
                const count = await BookModel.countDocuments({ learning_area: area });
                console.log(`   "${area}": ${count} books found`);

                if (count === 0) {
                    // Try to find similar learning areas
                    const similar = allLearningAreas.filter(dbArea =>
                        dbArea.toLowerCase().includes(area.toLowerCase()) ||
                        area.toLowerCase().includes(dbArea.toLowerCase())
                    );
                    if (similar.length > 0) {
                        console.log(`     ⚠️ No exact match, but found similar: ${similar.join(', ')}`);
                    }
                }
            }
        }

        console.log('\n' + '='.repeat(60) + '\n');

        // Show actual book counts by learning area
        console.log('📊 Actual Book Counts by Learning Area:');
        for (const area of allLearningAreas) {
            const count = await BookModel.countDocuments({ learning_area: area });
            console.log(`   ${area}: ${count} books`);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

checkCelsoAccess();
