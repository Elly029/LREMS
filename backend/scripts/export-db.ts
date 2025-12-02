import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from the .env file in the backend directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const exportDb = async () => {
    try {
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL is not defined in .env');
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        if (!db) {
            throw new Error('Database connection not established');
        }

        const collections = await db.listCollections().toArray();
        const data: Record<string, any[]> = {};

        for (const collection of collections) {
            const name = collection.name;
            console.log(`Exporting collection: ${name}`);
            const documents = await db.collection(name).find({}).toArray();
            data[name] = documents;
        }

        const outputPath = path.join(__dirname, '..', 'database_export.json');
        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
        console.log(`Database exported to ${outputPath}`);

    } catch (error) {
        console.error('Error exporting database:', error);
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
            console.log('Disconnected from MongoDB');
        }
    }
};

exportDb();
