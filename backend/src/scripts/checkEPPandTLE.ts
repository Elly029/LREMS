import mongoose from 'mongoose';
import BookModel from '../models/Book';

/**
 * Script to check if EPP/TLE might be categorized under different names
 */
async function checkEPPandTLE() {
    try {
        let databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            throw new Error('DATABASE_URL environment variable is required');
        }

        if (!databaseUrl.includes('book_management')) {
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

        await mongoose.connect(databaseUrl);

        // Get all books and their titles to see if EPP/TLE might be in titles
        const allBooks = await BookModel.find({}).select('learning_area title').lean();

        console.log('🔍 Searching for EPP or TLE in book titles...\n');

        const eppBooks = allBooks.filter(book =>
            book.title?.toLowerCase().includes('epp') ||
            book.title?.toLowerCase().includes('edukasyon')
        );

        const tleBooks = allBooks.filter(book =>
            book.title?.toLowerCase().includes('tle') ||
            book.title?.toLowerCase().includes('livelihood')
        );

        if (eppBooks.length > 0) {
            console.log('📚 Books that might be EPP:');
            eppBooks.forEach(book => {
                console.log(`   - ${book.learning_area}: ${book.title}`);
            });
        } else {
            console.log('❌ No books found with EPP in title');
        }

        console.log('');

        if (tleBooks.length > 0) {
            console.log('📚 Books that might be TLE:');
            tleBooks.forEach(book => {
                console.log(`   - ${book.learning_area}: ${book.title}`);
            });
        } else {
            console.log('❌ No books found with TLE in title');
        }

        console.log('\n💡 Note: EPP (Edukasyon sa Pagpapakatao) and TLE (Technology and Livelihood Education)');
        console.log('   may not have books in the current database, or they might be categorized differently.');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

checkEPPandTLE();
