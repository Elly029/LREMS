import mongoose from 'mongoose';
import BookModel from './src/models/Book';
import dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

async function checkBooks() {
    try {
        await mongoose.connect(process.env.DATABASE_URL as string);
        console.log('Connected to MongoDB');

        const totalCount = await BookModel.countDocuments({});
        console.log(`Total books in DB: ${totalCount}`);

        const books = await BookModel.find({
            book_code: '25G3-S001'
        });

        console.log(`Found ${books.length} books with code '25G3-S001':`);
        books.forEach(book => {
            console.log(JSON.stringify(book.toJSON(), null, 2));
            console.log(`'book_code' length: ${book.book_code.length}`);
            console.log(`'book_code' chars: ${book.book_code.split('').map(c => c.charCodeAt(0)).join(', ')}`);
            console.log(`'learning_area' length: ${book.learning_area?.length}`);
            console.log(`'learning_area' chars: ${book.learning_area?.split('').map(c => c.charCodeAt(0)).join(', ')}`);
            console.log(`Matches /Science/i? ${/Science/i.test(book.learning_area)}`);
            console.log(`Equals 'Science'? ${book.learning_area === 'Science'}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkBooks();
