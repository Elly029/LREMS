import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function checkBooks() {
    try {
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL is not defined');
        }

        await mongoose.connect(process.env.DATABASE_URL);
        console.log('✅ Connected to MongoDB\n');

        const booksCollection = mongoose.connection.db?.collection('books');

        // Count total books
        const totalBooks = await booksCollection?.countDocuments();
        console.log(`📊 Total Books in Database: ${totalBooks}\n`);

        // Count by learning area
        const booksByArea = await booksCollection?.aggregate([
            { $group: { _id: '$learning_area', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]).toArray();

        console.log('📚 Books by Learning Area:');
        booksByArea?.forEach(area => {
            console.log(`   ${area._id}: ${area.count} books`);
        });
        console.log('');

        // Show first 10 books
        const sampleBooks = await booksCollection?.find({}).limit(10).toArray();
        console.log('📖 Sample Books (first 10):');
        sampleBooks?.forEach((book, index) => {
            console.log(`   ${index + 1}. ${book.book_code} - ${book.title} (${book.learning_area}, Grade ${book.grade_level})`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkBooks();
