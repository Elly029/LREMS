import mongoose from 'mongoose';
import User from '../models/User';
import BookModel from '../models/Book';
import config from '../config/environment';

/**
 * Debug script to simulate the book query for user 'leo'
 * Usage: DATABASE_URL="..." npx tsx src/scripts/debugBookQuery.ts
 */
async function debugBookQuery() {
    try {
        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            throw new Error('DATABASE_URL environment variable is required');
        }

        console.log('🔗 Connecting to database...');
        await mongoose.connect(databaseUrl);
        console.log('✅ Connected\n');

        // 1. Fetch User
        const username = 'leo';
        const user = await User.findOne({ username });
        if (!user) {
            console.error(`❌ User '${username}' not found!`);
            return;
        }
        console.log(`👤 User found: ${user.username}`);
        console.log('   is_admin_access:', user.is_admin_access);
        console.log('   access_rules:', JSON.stringify(user.access_rules, null, 2));

        // 2. Simulate Logic from BookService.getBooks
        console.log('\n🔍 Simulating Query Logic...');

        let accessConditions: any[] = [];

        // Logic from bookService.ts
        if (user.access_rules && user.access_rules.length > 0) {
            // isAdmin check
            const isSuperAdmin = user.access_rules.some(rule =>
                rule.learning_areas.includes('*') &&
                (!rule.grade_levels || rule.grade_levels.length === 0)
            );

            // We assume adminView is false/undefined for this test as per the issue
            const adminView = false;
            const canBypassRestrictions = isSuperAdmin || (adminView && user.is_admin_access);

            console.log(`   isSuperAdmin: ${isSuperAdmin}`);
            console.log(`   canBypassRestrictions: ${canBypassRestrictions}`);

            if (!canBypassRestrictions) {
                const ruleConditions = user.access_rules.map(rule => {
                    const condition: any = {};

                    if (!rule.learning_areas.includes('*')) {
                        condition.learning_area = { $in: rule.learning_areas };
                    }

                    if (rule.grade_levels && rule.grade_levels.length > 0) {
                        condition.grade_level = { $in: rule.grade_levels };
                    }

                    return condition;
                });

                accessConditions = [
                    { $or: ruleConditions },
                    { created_by: user.username }
                ];
            }
        }

        const filter: any = {};
        if (accessConditions.length > 0) {
            filter.$or = accessConditions;
        }

        console.log('\n🛡️ Generated Filter:', JSON.stringify(filter, null, 2));

        // 3. Run Query
        const count = await BookModel.countDocuments(filter);
        console.log(`\n📊 Query Result: Found ${count} books matching the filter.`);

        if (count === 0) {
            console.log('\n⚠️ No books found. Checking why...');

            // Check total books
            const totalBooks = await BookModel.countDocuments({});
            console.log(`   Total books in collection: ${totalBooks}`);

            if (totalBooks > 0) {
                const sampleBook = await BookModel.findOne({});
                console.log('   Sample book:', JSON.stringify(sampleBook, null, 2));

                const distinctAreas = await BookModel.distinct('learning_area');
                console.log('   Distinct Learning Areas:', distinctAreas);
            } else {
                console.log('   ❌ The books collection appears to be empty!');

                // List all collections
                if (mongoose.connection.db) {
                    const collections = await mongoose.connection.db.listCollections().toArray();
                    console.log('   📂 Available collections:', collections.map(c => c.name));
                } else {
                    console.log('   ⚠️ Could not list collections: database connection not established');
                }
            }
        } else {
            const books = await BookModel.find(filter).select('book_code title learning_area').limit(5);
            console.log('   Sample books:', books);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

debugBookQuery();
