// Simple database initialization script
import { knex } from 'knex';

const config = {
  client: 'sqlite3',
  connection: {
    filename: './database.sqlite',
  },
  useNullAsDefault: true,
  migrations: {
    directory: './src/database/migrations',
    tableName: 'knex_migrations',
  },
};

const db = knex(config);

async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Create tables manually for simplicity
    await db.schema.createTable('books', (table) => {
      table.string('book_code').primary();
      table.string('learning_area').notNullable();
      table.integer('grade_level').notNullable().checkPositive();
      table.string('publisher').notNullable();
      table.string('title').notNullable();
      table.string('status').notNullable();
      table.boolean('is_new').defaultTo(true);
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now());
      table.string('created_by').nullable();
      table.string('updated_by').nullable();
    });

    await db.schema.createTable('remarks', (table) => {
      table.increments('id').primary();
      table.string('book_code').references('book_code').inTable('books').onDelete('CASCADE');
      table.text('text').notNullable().checkLength('<=', 1000);
      table.timestamp('timestamp').notNullable().defaultTo(db.fn.now());
      table.string('created_by').nullable();
    });

    // Insert some sample data
    await db('books').insert([
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
    ]);

    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await db.destroy();
  }
}

initializeDatabase();