import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Book from '../models/Book';
import { connectDatabase } from '../config/database';

// Load environment variables
dotenv.config();

const PUBLISHER_MAPPINGS: { [key: string]: string } = {
    // J.C. Palabay - Standardize to ALL CAPS as requested
    'JC PALABAY': 'J.C. PALABAY ENTERPRISES, INC.',
    'J.C. Palabay Enterprises, Inc.': 'J.C. PALABAY ENTERPRISES, INC.',

    // Johnny and Hansel - Standardize to full name
    'JOHNNY & HANSEL': 'Johnny and Hansel Publications',

    // Learnovate - Standardize to Inc version (keeping caps if that's the existing formal one)
    'Learnovate': 'LEARNOVATE INC.',

    // Magallanes - Standardize to Title Case
    'MAGALLANES PUBLISHING HOUSE': 'Magallanes Publishing House',

    // Sibs - Standardize to Title Case with Inc
    'SIBS PUBLISHING HOUSE': 'Sibs Publishing House, Inc.',

    // Merryland - Standardize to Title Case (if desired, but let's stick to merging duplicates)
    // 'MERRYLAND PUBLISHING CORPORATION' - Only one version exists in caps, so leaving it.
};

async function fixPublisherNames() {
    try {
        console.log('Connecting to database...');
        await connectDatabase();

        console.log('\nStarting publisher name standardization...\n');

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

fixPublisherNames();
