import mongoose from 'mongoose';
import dotenv from 'dotenv';
import BookModel from './src/models/Book';
import RemarkModel from './src/models/Remark';

dotenv.config();

/**
 * Maintain data consistency between books and remarks collections
 * This script should be run periodically to ensure data integrity
 */
async function maintainDataConsistency() {
    try {
        console.log('🔍 Starting data consistency maintenance...');
        
        // Connect to database
        await mongoose.connect(process.env.DATABASE_URL!);
        console.log('✅ Connected to MongoDB\n');
        
        // Get statistics
        const booksCount = await BookModel.countDocuments();
        const remarksCount = await RemarkModel.countDocuments();
        
        console.log(`📚 Books: ${booksCount}`);
        console.log(`💬 Remarks: ${remarksCount}\n`);
        
        // 1. Remove orphaned remarks (remarks without corresponding books)
        console.log('1. Checking for orphaned remarks...');
        const allBooks = await BookModel.find({}, { book_code: 1 }).lean();
        const bookCodes = new Set(allBooks.map(b => b.book_code));
        
        const allRemarks = await RemarkModel.find({}, { book_code: 1 }).lean();
        const orphanedRemarks = allRemarks.filter(r => !bookCodes.has(r.book_code));
        
        console.log(`   Found ${orphanedRemarks.length} orphaned remarks`);
        
        if (orphanedRemarks.length > 0) {
            const orphanedBookCodes = [...new Set(orphanedRemarks.map(r => r.book_code))];
            const deleteResult = await RemarkModel.deleteMany({
                book_code: { $in: orphanedBookCodes }
            });
            console.log(`   ✅ Deleted ${deleteResult.deletedCount} orphaned remarks`);
        } else {
            console.log('   ✅ No orphaned remarks found');
        }
        
        // 2. Report on books without remarks
        console.log('\n2. Analyzing books without remarks...');
        const booksWithRemarks = await RemarkModel.distinct('book_code');
        const booksWithoutRemarksCount = allBooks.filter(b => !booksWithRemarks.includes(b.book_code)).length;
        
        console.log(`   Books without remarks: ${booksWithoutRemarksCount}/${booksCount} (${Math.round((booksWithoutRemarksCount/booksCount)*100)}%)`);
        
        // 3. Check for duplicate book codes
        console.log('\n3. Checking for duplicate book codes...');
        const bookCodeGroups = await BookModel.aggregate([
            { $group: { _id: "$book_code", count: { $sum: 1 } } },
            { $match: { count: { $gt: 1 } } }
        ]);
        
        if (bookCodeGroups.length > 0) {
            console.log(`   ⚠️  Found ${bookCodeGroups.length} duplicate book codes:`);
            bookCodeGroups.forEach(group => {
                console.log(`     - ${group._id}: ${group.count} duplicates`);
            });
        } else {
            console.log('   ✅ No duplicate book codes found');
        }
        
        // 4. Check for invalid remark references
        console.log('\n4. Checking remark references...');
        const remarkBookCodes = [...new Set(allRemarks.map(r => r.book_code))];
        const invalidRemarkRefs = remarkBookCodes.filter(code => !bookCodes.has(code));
        
        if (invalidRemarkRefs.length > 0) {
            console.log(`   ⚠️  Found ${invalidRemarkRefs.length} invalid remark references`);
        } else {
            console.log('   ✅ All remark references are valid');
        }
        
        // Summary
        console.log('\n📊 SUMMARY');
        console.log('=========');
        console.log(`✅ Books: ${booksCount}`);
        console.log(`✅ Valid remarks: ${remarksCount - orphanedRemarks.length}`);
        console.log(`✅ Orphaned remarks removed: ${orphanedRemarks.length}`);
        console.log(`✅ Data consistency: ${(orphanedRemarks.length === 0) ? 'GOOD' : 'IMPROVED'}`);
        
    } catch (error) {
        console.error('❌ Error during consistency maintenance:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
    }
}

// Run if called directly
if (require.main === module) {
    maintainDataConsistency();
}

export default maintainDataConsistency;