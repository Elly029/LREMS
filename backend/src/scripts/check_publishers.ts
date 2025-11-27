import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Book from '../models/Book';
import { connectDatabase } from '../config/database';

// Load environment variables
dotenv.config();

async function checkPublishers() {
    try {
        console.log('Connecting to database...');
        await connectDatabase();

        console.log('\nFetching all distinct publishers...\n');

        const publishers = await Book.distinct('publisher');

        // Sort alphabetically
        publishers.sort((a, b) => a.localeCompare(b));

        console.log(`Found ${publishers.length} distinct publishers:\n`);
        publishers.forEach((publisher, index) => {
            console.log(`${index + 1}. ${publisher}`);
        });

        // Group similar publishers (case-insensitive)
        console.log('\n\n=== POTENTIAL DUPLICATES (Case-Insensitive) ===\n');
        const grouped = new Map<string, string[]>();

        publishers.forEach(publisher => {
            const normalized = publisher.toLowerCase().trim();
            if (!grouped.has(normalized)) {
                grouped.set(normalized, []);
            }
            grouped.get(normalized)!.push(publisher);
        });

        // Show groups with multiple variations
        let foundDuplicates = false;
        grouped.forEach((variations, normalized) => {
            if (variations.length > 1) {
                foundDuplicates = true;
                console.log(`\nVariations of "${variations[0]}":`);
                variations.forEach(v => console.log(`  - ${v}`));
            }
        });

        if (!foundDuplicates) {
            console.log('No duplicate publishers found.');
        }

    } catch (error) {
        console.error('Error checking publishers:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n\nDisconnected from database.');
    }
}

checkPublishers();
