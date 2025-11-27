import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Book from '../models/Book';
import { connectDatabase } from '../config/database';

// Load environment variables
dotenv.config();

async function verifyNtpDateField() {
    try {
        console.log('Connecting to database...');
        await connectDatabase();

        console.log('Checking books for ntp_date field...\n');

        // Get a sample of books
        const books = await Book.find({}).limit(5);

        console.log(`Checking ${books.length} sample books:\n`);

        for (const book of books) {
            console.log(`Book Code: ${book.book_code}`);
            console.log(`Title: ${book.title}`);
            console.log(`Has ntp_date field: ${book.ntp_date !== undefined ? 'Yes' : 'No'}`);
            console.log(`ntp_date value: ${book.ntp_date || 'null'}`);
            console.log('---');
        }

        // Count books with and without ntp_date
        const totalBooks = await Book.countDocuments({});
        const booksWithNtpDate = await Book.countDocuments({ ntp_date: { $ne: null } });
        const booksWithoutNtpDate = totalBooks - booksWithNtpDate;

        console.log(`\nSummary:`);
        console.log(`Total books: ${totalBooks}`);
        console.log(`Books with NTP date set: ${booksWithNtpDate}`);
        console.log(`Books with NTP date as null: ${booksWithoutNtpDate}`);

    } catch (error) {
        console.error('Error verifying ntp_date field:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from database.');
    }
}

verifyNtpDateField();
