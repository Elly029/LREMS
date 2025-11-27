import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Remark from '../models/Remark';
import { connectDatabase } from '../config/database';

// Load environment variables
dotenv.config();

async function updateRemarkSchema() {
    try {
        console.log('Connecting to database...');
        await connectDatabase();

        console.log('Updating remark schema...');

        // Get all remarks
        const remarks = await Remark.find({});
        console.log(`Found ${remarks.length} remarks`);

        // Update each remark to ensure it has the new fields (even if undefined)
        for (const remark of remarks) {
            // These fields will be undefined if not set, which is fine
            // MongoDB will only store them if they have values
            await Remark.updateOne(
                { _id: remark._id },
                {
                    $set: {
                        // Only set if doesn't exist
                        ...(remark.from === undefined && { from: undefined }),
                        ...(remark.to === undefined && { to: undefined }),
                        ...(remark.status === undefined && { status: undefined }),
                        ...(remark.days_delay_deped === undefined && { days_delay_deped: undefined }),
                        ...(remark.days_delay_publisher === undefined && { days_delay_publisher: undefined }),
                    }
                }
            );
        }

        console.log('Remark schema updated successfully!');
        console.log('All remarks now support the new fields.');

    } catch (error) {
        console.error('Error updating remark schema:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from database.');
    }
}

updateRemarkSchema();
