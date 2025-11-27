import mongoose from 'mongoose';
import BookModel from '../models/Book';
import RemarkModel from '../models/Remark';
import config from '../config/environment';

const sampleBooks = [
  {
    book_code: '25G3-MATH001',
    learning_area: 'Mathematics',
    grade_level: 3,
    publisher: 'Educational Press',
    title: 'Basic Math for Grade 3',
    status: 'For Evaluation',
    is_new: true,
  },
  {
    book_code: '25G3-SCI001',
    learning_area: 'Science',
    grade_level: 3,
    publisher: 'Science Publishers',
    title: 'Introduction to Science',
    status: 'For Revision',
    is_new: true,
  },
  {
    book_code: '25G4-ENG001',
    learning_area: 'English',
    grade_level: 4,
    publisher: 'Language Arts Co.',
    title: 'English Grammar Basics',
    status: 'Approved',
    is_new: false,
  },
  {
    book_code: '25G5-HIST001',
    learning_area: 'History',
    grade_level: 5,
    publisher: 'Historical Books Inc.',
    title: 'World History Overview',
    status: 'For Evaluation',
    is_new: true,
  },
];

const sampleRemarks = [
  {
    book_code: '25G3-MATH001',
    text: 'Initial review completed. Content looks good.',
    timestamp: new Date('2024-01-15'),
  },
  {
    book_code: '25G3-SCI001',
    text: 'Needs revision in Chapter 3.',
    timestamp: new Date('2024-01-20'),
  },
  {
    book_code: '25G3-SCI001',
    text: 'Diagrams need to be updated.',
    timestamp: new Date('2024-01-22'),
  },
];

async function seedDatabase() {
  try {
    const mongoUri = config.database.url || 'mongodb://localhost:27017/book_management';
    await mongoose.connect(mongoUri);

    console.log('Connected to MongoDB');

    // Clear existing data
    await BookModel.deleteMany({});
    await RemarkModel.deleteMany({});
    console.log('Cleared existing data');

    // Insert sample books
    await BookModel.insertMany(sampleBooks);
    console.log(`Inserted ${sampleBooks.length} books`);

    // Insert sample remarks
    await RemarkModel.insertMany(sampleRemarks);
    console.log(`Inserted ${sampleRemarks.length} remarks`);

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
