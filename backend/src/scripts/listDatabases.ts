import mongoose from 'mongoose';

async function listDatabases() {
    try {
        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            throw new Error('DATABASE_URL environment variable is required');
        }

        console.log('🔗 Connecting to cluster...');
        // Connect to the admin database to list all dbs
        await mongoose.connect(databaseUrl);
        console.log('✅ Connected\n');

        // Use the native Mongo client to list databases
        if (!mongoose.connection.db) {
            throw new Error('Database connection not established');
        }
        const adminDb = mongoose.connection.db.admin();
        const result = await adminDb.listDatabases();

        console.log('📂 Databases found on this cluster:');
        console.log('===================================');

        for (const db of result.databases) {
            const sizeMb = db.sizeOnDisk ? (db.sizeOnDisk / 1024 / 1024).toFixed(2) : '0.00';
            console.log(`   - ${db.name} (${sizeMb} MB)`);

            // If it's not local/admin/config, let's peek inside
            if (!['local', 'admin', 'config'].includes(db.name)) {
                try {
                    // Switch to this db
                    const connection = mongoose.connection.useDb(db.name);
                    if (connection.db) {
                        const collections = await connection.db.listCollections().toArray();
                        const collectionNames = collections.map(c => c.name);
                        console.log(`     Collections: ${collectionNames.join(', ')}`);

                        if (collectionNames.includes('books')) {
                            const count = await connection.collection('books').countDocuments();
                            console.log(`     📚 Books count: ${count}`);
                        }
                    }
                } catch (e: any) {
                    console.log(`     ⚠️ Could not inspect: ${e.message}`);
                }
            }
        }
        console.log('===================================');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

listDatabases();
