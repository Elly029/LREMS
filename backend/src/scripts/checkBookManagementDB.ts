import mongoose from 'mongoose';
import User from '../models/User';
import BookModel from '../models/Book';

/**
 * Script to check data in the 'book_management' database
 * Usage: DATABASE_URL="..." npx tsx src/scripts/checkBookManagementDB.ts
 */
async function checkBookManagementDB() {
    try {
        let databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            throw new Error('DATABASE_URL environment variable is required');
        }

        // Force connection to book_management if not already specified
        if (!databaseUrl.includes('book_management')) {
            console.log('⚠️ URL does not specify book_management. Appending it...');
            // Handle query params if present
            if (databaseUrl.includes('?')) {
                // Insert /book_management before the ?
                const parts = databaseUrl.split('?');
                // Remove trailing slash from base if present
                if (parts[0].endsWith('/')) {
                    parts[0] = parts[0].slice(0, -1);
                }
                databaseUrl = `${parts[0]}/book_management?${parts[1]}`;
            } else {
                // Remove trailing slash if present
                if (databaseUrl.endsWith('/')) {
                    databaseUrl = databaseUrl.slice(0, -1);
                }
                databaseUrl = databaseUrl + '/book_management';
            }
        }

        console.log('🔗 Connecting to book_management database...');
        await mongoose.connect(databaseUrl);
        console.log('✅ Connected\n');

        // 1. Check Books
        const totalBooks = await BookModel.countDocuments({});
        console.log(`📚 Total Books in 'book_management': ${totalBooks}`);

        if (totalBooks > 0) {
            const areas = await BookModel.distinct('learning_area');
            console.log(`   Learning Areas: ${areas.join(', ')}`);
        }

        console.log('\n' + '='.repeat(40) + '\n');

        // 2. Check Users
        const usersToCheck = ['admin-l', 'leo', 'celso'];

        for (const username of usersToCheck) {
            const user = await User.findOne({ username });
            if (user) {
                console.log(`👤 User: ${user.username}`);
                console.log(`   Name: ${user.name}`);
                console.log(`   Is Admin: ${user.is_admin_access}`);
                console.log(`   Access Rules: ${JSON.stringify(user.access_rules)}`);
            } else {
                console.log(`❌ User '${username}' NOT FOUND in this database`);
            }
            console.log('---');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

checkBookManagementDB();
