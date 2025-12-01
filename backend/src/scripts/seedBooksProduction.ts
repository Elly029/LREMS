import mongoose from 'mongoose';
import BookModel from '../models/Book';
import config from '../config/environment';

const sampleBooks = [
    // Science Books (For Leo)
    {
        book_code: '25G3-S001',
        title: 'Agham Para sa Lahat',
        learning_area: 'Science',
        grade_level: 3,
        publisher: 'Sibs Publishing House, Inc.',
        status: 'For Evaluation',
        is_new: true,
        created_by: 'system'
    },
    {
        book_code: '25G3-S002',
        title: 'Siyensya at Pamana',
        learning_area: 'Science',
        grade_level: 3,
        publisher: 'J.C. PALABAY ENTERPRISES, INC.',
        status: 'For ROR',
        is_new: true,
        created_by: 'system'
    },
    {
        book_code: '25G3-S002-E',
        title: 'Exploring Our World',
        learning_area: 'Science',
        grade_level: 3,
        publisher: 'J.C. PALABAY ENTERPRISES, INC.',
        status: 'For Evaluation',
        is_new: true,
        created_by: 'system'
    },
    {
        book_code: '25G3-S003',
        title: 'Masayang Agham: Mapagtuklas na Kaisipan',
        learning_area: 'Science',
        grade_level: 3,
        publisher: 'Valleybooks OPC',
        status: 'For ROR',
        is_new: true,
        created_by: 'system'
    },
    {
        book_code: 'Vibal-Sci7',
        title: 'Science',
        learning_area: 'Science',
        grade_level: 7,
        publisher: 'Mexico Printing Company Inc.',
        status: 'In Progress',
        is_new: true,
        created_by: 'system'
    },

    // Math Books (For Celso)
    {
        book_code: '25G1-M001',
        title: 'Mathematics',
        learning_area: 'Mathematics',
        grade_level: 1,
        publisher: 'VIBAL FOUNDATION, INC.',
        status: 'NOT FOUND',
        is_new: true,
        created_by: 'system'
    },
    {
        book_code: '25G1-M002',
        title: 'Integrative Math Proficient 21st Century Learners',
        learning_area: 'Mathematics',
        grade_level: 1,
        publisher: 'Sibs Publishing House, Inc.',
        status: 'For Revision',
        is_new: true,
        created_by: 'system'
    },

    // Other Books (For Admin only)
    {
        book_code: '25G1-F002',
        title: 'Salindiwa',
        learning_area: 'Language',
        grade_level: 1,
        publisher: 'LEARNOVATE INC.',
        status: 'NOT FOUND',
        is_new: true,
        created_by: 'system'
    },
    {
        book_code: '25G1-K001',
        title: 'Makabansa: Lahing Pilipino',
        learning_area: 'MAKABANSA',
        grade_level: 1,
        publisher: 'REX PRINTING COMPANY, INC.',
        status: 'For Revision',
        is_new: true,
        created_by: 'system'
    }
];

async function seedBooks() {
    try {
        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            throw new Error('DATABASE_URL environment variable is required');
        }

        console.log('🔗 Connecting to database...');
        await mongoose.connect(databaseUrl);
        console.log('✅ Connected\n');

        console.log('🌱 Seeding books...');

        // Check existing books to avoid duplicates
        for (const book of sampleBooks) {
            const existing = await BookModel.findOne({ book_code: book.book_code });
            if (!existing) {
                await BookModel.create(book);
                console.log(`   ✅ Created: ${book.title} (${book.learning_area})`);
            } else {
                console.log(`   ⚠️ Skipped (Exists): ${book.title}`);
            }
        }

        const total = await BookModel.countDocuments({});
        console.log(`\n📚 Total books in database: ${total}`);
        console.log('✨ Seeding completed!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

seedBooks();
