import mongoose from 'mongoose';
import dotenv from 'dotenv';
import BookModel from './src/models/Book';
import RemarkModel from './src/models/Remark';

dotenv.config();

async function cleanupOrphanedRemarks() {
    try {
        console.log('🔍 Starting orphaned remarks cleanup...');
        
        // Connect to database
        await mongoose.connect(process.env.DATABASE_URL!);
        console.log('✅ Connected to MongoDB\n');
        
        // Get all book codes
        const allBooks = await BookModel.find({}, { book_code: 1 }).lean();
        const bookCodes = new Set(allBooks.map(b => b.book_code));
        console.log(`📚 Total books in database: ${allBooks.length}`);
        
        // Find orphaned remarks
        const allRemarks = await RemarkModel.find({}, { book_code: 1 }).lean();
        const orphanedRemarks = allRemarks.filter(r => !bookCodes.has(r.book_code));
        
        console.log(`💬 Total remarks in database: ${allRemarks.length}`);
        console.log(`👻 Orphaned remarks found: ${orphanedRemarks.length}`);
        
        if (orphanedRemarks.length > 0) {
            const orphanedBookCodes = [...new Set(orphanedRemarks.map(r => r.book_code))];
            console.log('Orphaned remark book codes:', orphanedBookCodes);
            
            // Confirm before deletion
            console.log('\n⚠️  About to delete orphaned remarks...');
            
            // Delete orphaned remarks
            const deleteResult = await RemarkModel.deleteMany({
                book_code: { $in: orphanedBookCodes }
            });
            
            console.log(`✅ Deleted ${deleteResult.deletedCount} orphaned remarks`);
        } else {
            console.log('✅ No orphaned remarks found. Database is consistent.');
        }
        
        // Verification
        console.log('\n🔍 Verifying cleanup...');
        const remainingRemarks = await RemarkModel.find({}, { book_code: 1 }).lean();
        const remainingOrphaned = remainingRemarks.filter(r => !bookCodes.has(r.book_code));
        
        console.log(`✅ Verification complete. Remaining orphaned remarks: ${remainingOrphaned.length}`);
        
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
    }
}

cleanupOrphanedRemarks();