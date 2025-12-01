import mongoose from 'mongoose';
import BookModel from '../models/Book';
import config from '../config/environment';

/**
 * Script to check what books exist in each learning area
 */
async function checkBooksByLearningArea() {
    try {
        // Connect to MongoDB
        if (!config.database.url) {
            throw new Error('Database URL is not configured');
        }
        await mongoose.connect(config.database.url);
        console.log('✅ Connected to MongoDB\n');

        // Get all distinct learning areas
        const learningAreas = await BookModel.distinct('learning_area');
        console.log('📚 Learning Areas in Database:', learningAreas);
        console.log('\n' + '='.repeat(60) + '\n');

        // Count books per learning area
        for (const area of learningAreas) {
            const count = await BookModel.countDocuments({ learning_area: area });
            const books = await BookModel.find({ learning_area: area })
                .select('book_code title grade_level')
                .limit(5);

            console.log(`📖 ${area}: ${count} book(s)`);
            books.forEach(book => {
                console.log(`   - ${book.book_code}: ${book.title} (Grade ${book.grade_level})`);
            });
            console.log('');
        }

        console.log('='.repeat(60));
        console.log('\n✅ Analysis complete!');

    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

// Run the script
checkBooksByLearningArea()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Script failed:', error);
        process.exit(1);
    });
