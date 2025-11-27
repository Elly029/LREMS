import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Book from '../models/Book';
import { connectDatabase } from '../config/database';

// Load environment variables
dotenv.config();

async function addNtpDateField() {
    try {
        console.log('Connecting to database...');
        await connectDatabase();

        console.log('Adding ntp_date field to all books...');

        // Get all books
        const books = await Book.find({});
        console.log(`Found ${books.length} books`);

        // Update each book to ensure it has the ntp_date field
        let updatedCount = 0;
        for (const book of books) {
            // Check if the book already has ntp_date field
            if (book.ntp_date === undefined) {
                await Book.updateOne(
                    { _id: book._id },
                    {
                        $set: {
                            ntp_date: null // Set to null for existing books without a date
                        }
                    }
                );
                updatedCount++;
            }
        }

        console.log(`Updated ${updatedCount} books with ntp_date field.`);
        console.log(`${books.length - updatedCount} books already had the ntp_date field.`);
        console.log('Migration completed successfully!');

    } catch (error) {
        console.error('Error adding ntp_date field:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from database.');
    }
}

addNtpDateField();
