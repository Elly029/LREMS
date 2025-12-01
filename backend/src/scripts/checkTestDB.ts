import mongoose from 'mongoose';
import BookModel from '../models/Book';

async function checkTestDB() {
    try {
        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            throw new Error('DATABASE_URL environment variable is required');
        }

        console.log('🔗 Connecting to default (test) database...');
        await mongoose.connect(databaseUrl);
        console.log('✅ Connected\n');

        const totalBooks = await BookModel.countDocuments({});
        console.log(`📚 Total Books in 'test': ${totalBooks}`);

        if (totalBooks > 0) {
            const books = await BookModel.find({}).select('title learning_area');
            console.log('   Books found:');
            books.forEach(b => console.log(`   - ${b.title} (${b.learning_area})`));
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

checkTestDB();
