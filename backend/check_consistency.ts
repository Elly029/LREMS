import mongoose from 'mongoose';
import dotenv from 'dotenv';
import BookModel from './src/models/Book';
import RemarkModel from './src/models/Remark';

dotenv.config();

async function checkDataConsistency() {
    try {
        console.log('🔍 Checking data consistency between books and remarks...');
        
        // Connect to database
        await mongoose.connect(process.env.DATABASE_URL!);
        console.log('✅ Connected to MongoDB\n');
        
        // Get counts
        const booksCount = await BookModel.countDocuments();
        const remarksCount = await RemarkModel.countDocuments();
        
        console.log(`📚 Books: ${booksCount}`);
        console.log(`💬 Remarks: ${remarksCount}\n`);
        
        // Find orphaned remarks (remarks without corresponding books)
        const allBooks = await BookModel.find({}, { book_code: 1 }).lean();
        const bookCodes = new Set(allBooks.map(b => b.book_code));
        
        const allRemarks = await RemarkModel.find({}, { book_code: 1 }).lean();
        const orphanedRemarks = allRemarks.filter(r => !bookCodes.has(r.book_code));
        
        console.log(`👻 Orphaned remarks: ${orphanedRemarks.length}`);
        
        if (orphanedRemarks.length > 0) {
            const orphanedBookCodes = [...new Set(orphanedRemarks.map(r => r.book_code))];
            console.log('Orphaned remark book codes:', orphanedBookCodes);
        }
        
        // Find books without remarks
        const booksWithRemarks = await RemarkModel.distinct('book_code');
        const booksWithoutRemarks = allBooks.filter(b => !booksWithRemarks.includes(b.book_code));
        
        console.log(`\n📖 Books without remarks: ${booksWithoutRemarks.length}`);
        
        // Sample check
        console.log('\n📋 Sample consistency check:');
        const sampleBook = await BookModel.findOne();
        if (sampleBook) {
            console.log(`Sample book: ${sampleBook.book_code} (${sampleBook.learning_area})`);
            const relatedRemarks = await RemarkModel.find({ book_code: sampleBook.book_code });
            console.log(`Related remarks: ${relatedRemarks.length}`);
        }
        
    } catch (error) {
        console.error('❌ Error checking consistency:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
    }
}

checkDataConsistency();