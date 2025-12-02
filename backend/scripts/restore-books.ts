import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Define Book Schema (minimal for restoration)
const BookSchema = new mongoose.Schema({
    book_code: String,
    learning_area: String,
    grade_level: Number,
    publisher: String,
    title: String,
    status: String,
    is_new: Boolean,
    ntp_date: Date,
    created_by: String,
    created_at: Date,
    updated_at: Date
}, { strict: false }); // Use strict: false to allow all fields from export

const Book = mongoose.model('Book', BookSchema);

async function restoreBooks() {
    try {
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL is not defined in .env');
        }

        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('✅ Connected to MongoDB\n');

        // Read export file
        const exportPath = path.join(__dirname, '..', 'database_export.json');
        if (!fs.existsSync(exportPath)) {
            throw new Error('database_export.json not found');
        }

        console.log('📖 Reading export file...');
        const data = fs.readFileSync(exportPath, 'utf8');
        const json = JSON.parse(data);

        if (!json.books || !Array.isArray(json.books)) {
            throw new Error('No books array found in export file');
        }

        const booksToRestore = json.books;
        console.log(`Found ${booksToRestore.length} books to restore.`);

        // Check current count
        const currentCount = await Book.countDocuments();
        console.log(`Current database has ${currentCount} books.`);

        if (currentCount > 0) {
            console.log('⚠️ Database is not empty. Aborting to prevent duplicates.');
            // You might want to add logic here to handle this case if needed
            // For now, safety first.
            return;
        }

        console.log('🔄 Restoring books...');

        // Transform _id if necessary (usually mongo export includes $oid)
        // But assuming the export is just the raw documents

        const result = await Book.insertMany(booksToRestore);
        console.log(`✅ Successfully restored ${result.length} books.`);

    } catch (error) {
        console.error('❌ Error restoring books:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

restoreBooks();
