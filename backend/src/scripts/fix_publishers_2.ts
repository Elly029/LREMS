import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Book from '../models/Book';
import { connectDatabase } from '../config/database';

// Load environment variables
dotenv.config();

const PUBLISHER_MAPPINGS: { [key: string]: string } = {
    // Standardize Books on Wheels to ALL CAPS with comma
    'Books on Wheels Enterprises Inc.': 'BOOKS ON WHEELS ENTERPRISES, INC.',
    'Books on Wheels Enterprises, Inc.': 'BOOKS ON WHEELS ENTERPRISES, INC.', // Just in case
};

async function fixMorePublishers() {
    try {
        console.log('Connecting to database...');
        await connectDatabase();

        console.log('\nStarting additional publisher name standardization...\n');

        for (const [oldName, newName] of Object.entries(PUBLISHER_MAPPINGS)) {
            const result = await Book.updateMany(
                { publisher: oldName },
                { $set: { publisher: newName } }
            );

            if (result.modifiedCount > 0) {
                console.log(`✅ Updated "${oldName}" -> "${newName}" (${result.modifiedCount} books)`);
            } else {
                console.log(`ℹ️ No books found for "${oldName}"`);
            }
        }

        console.log('\nPublisher standardization complete.');

    } catch (error) {
        console.error('Error fixing publisher names:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from database.');
    }
}

fixMorePublishers();
