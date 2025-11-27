const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import Book model
const Book = require('../dist/models/Book').default;

/**
 * MongoDB Migration Script for Book Management System
 * Migrates extracted Excel data to MongoDB Atlas
 */

class MigrationLogger {
  constructor() {
    this.logs = [];
    this.startTime = new Date();
  }

  log(level, message, details = null) {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message, details };
    this.logs.push(logEntry);
    
    // Console output with colors
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    
    const color = colors[level] || colors.info;
    console.log(`${color}[${level.toUpperCase()}]${colors.reset} ${message}`);
    
    if (details) {
      console.log(`  Details: ${JSON.stringify(details, null, 2)}`);
    }
  }

  info(message, details = null) { this.log('info', message, details); }
  success(message, details = null) { this.log('success', message, details); }
  warning(message, details = null) { this.log('warning', message, details); }
  error(message, details = null) { this.log('error', message, details); }

  generateReport() {
    const duration = new Date() - this.startTime;
    return {
      executionTime: this.startTime.toISOString(),
      duration: `${duration}ms`,
      totalLogs: this.logs.length,
      logs: this.logs
    };
  }
}

/**
 * Load extracted data from JSON file
 */
function loadExtractedData(dataFilePath) {
  try {
    if (!fs.existsSync(dataFilePath)) {
      throw new Error(`Data file not found: ${dataFilePath}`);
    }

    const rawData = fs.readFileSync(dataFilePath, 'utf8');
    const data = JSON.parse(rawData);

    if (!data.books || !Array.isArray(data.books)) {
      throw new Error('Invalid data format: books array not found');
    }

    return data.books;
  } catch (error) {
    throw new Error(`Failed to load data: ${error.message}`);
  }
}

/**
 * Transform book record for MongoDB
 */
function transformBookRecord(record, index) {
  try {
    const transformed = {
      book_code: record.book_code?.trim(),
      learning_area: record.learning_area?.trim(),
      grade_level: parseInt(record.grade_level),
      publisher: record.publisher?.trim(),
      title: record.title?.trim(),
      status: record.status,
      remarks: record.remarks?.trim() || '',
      is_new: record.is_new !== false,
      source_row: record.source_row || index + 1
    };

    // Validate required fields
    const requiredFields = ['book_code', 'learning_area', 'grade_level', 'publisher', 'title', 'status'];
    const missingFields = requiredFields.filter(field => !transformed[field] || transformed[field].toString().trim() === '');
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate grade level
    if (isNaN(transformed.grade_level) || transformed.grade_level < 1 || transformed.grade_level > 12) {
      throw new Error(`Invalid grade level: ${transformed.grade_level}`);
    }

    return transformed;
  } catch (error) {
    throw new Error(`Record ${index + 1}: ${error.message}`);
  }
}

/**
 * Check for existing book codes in database
 */
async function getExistingBookCodes(mongoose, bookCodes) {
  try {
    const existingCodes = await Book.find(
      { book_code: { $in: bookCodes } },
      { book_code: 1, _id: 0 }
    ).lean();

    return new Set(existingCodes.map(book => book.book_code));
  } catch (error) {
    throw new Error(`Failed to check existing book codes: ${error.message}`);
  }
}

/**
 * Perform bulk insert with error handling
 */
async function performBulkInsert(books, existingCodes) {
  const results = {
    total: books.length,
    inserted: 0,
    skipped: 0,
    errors: [],
    duplicates: 0,
    progress: []
  };

  // Process in batches to avoid memory issues
  const batchSize = 100;
  const batches = [];
  
  for (let i = 0; i < books.length; i += batchSize) {
    batches.push(books.slice(i, i + batchSize));
  }

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    const progress = {
      batch: batchIndex + 1,
      totalBatches: batches.length,
      processed: 0,
      inserted: 0,
      skipped: 0
    };

    try {
      const insertDocs = [];
      const skipDocs = [];

      for (let i = 0; i < batch.length; i++) {
        const book = batch[i];
        const globalIndex = batchIndex * batchSize + i;
        
        try {
          // Check for duplicates
          if (existingCodes.has(book.book_code)) {
            results.duplicates++;
            progress.skipped++;
            results.skipped++;
            continue;
          }

          // Transform for database
          const doc = transformBookRecord(book, globalIndex);
          insertDocs.push(doc);
          
        } catch (error) {
          results.errors.push({
            index: globalIndex,
            book_code: book.book_code || 'UNKNOWN',
            error: error.message
          });
          progress.skipped++;
          results.skipped++;
        }

        progress.processed++;
      }

      // Bulk insert documents
      if (insertDocs.length > 0) {
        try {
          const bulkResult = await Book.insertMany(insertDocs, { ordered: false });
          results.inserted += bulkResult.length;
          progress.inserted += bulkResult.length;
        } catch (bulkError) {
          // Handle partial bulk insert errors
          if (bulkError.writeErrors) {
            bulkError.writeErrors.forEach(writeError => {
              results.errors.push({
                index: batchIndex * batchSize + writeError.index,
                book_code: insertDocs[writeError.index]?.book_code || 'UNKNOWN',
                error: writeError.errmsg
              });
            });
            results.inserted += (insertDocs.length - bulkError.writeErrors.length);
            progress.inserted += (insertDocs.length - bulkError.writeErrors.length);
          } else {
            throw bulkError;
          }
        }
      }

      results.progress.push(progress);
      
      // Log batch progress
      migrationLogger.info(`Batch ${progress.batch}/${progress.totalBatches} completed`, {
        processed: progress.processed,
        inserted: progress.inserted,
        skipped: progress.skipped
      });

    } catch (batchError) {
      migrationLogger.error(`Batch ${batchIndex + 1} failed:`, batchError.message);
      results.errors.push({
        batch: batchIndex + 1,
        error: batchError.message
      });
    }
  }

  return results;
}

/**
 * Verify migration by querying database
 */
async function verifyMigration() {
  try {
    const totalCount = await Book.countDocuments();
    const grade1Count = await Book.countDocuments({ grade_level: 1 });
    const grade3Count = await Book.countDocuments({ grade_level: 3 });
    
    const recentBooks = await Book.find()
      .sort({ created_at: -1 })
      .limit(5)
      .lean();

    const sampleBookCodes = recentBooks.map(book => book.book_code);

    return {
      totalBooks: totalCount,
      grade1Books: grade1Count,
      grade3Books: grade3Count,
      recentSampleBooks: sampleBookCodes,
      recentBooks: recentBooks
    };
  } catch (error) {
    throw new Error(`Migration verification failed: ${error.message}`);
  }
}

/**
 * Save migration report
 */
function saveMigrationReport(results, verification) {
  const report = {
    migrationSummary: {
      timestamp: new Date().toISOString(),
      totalRecords: results.total,
      successfullyInserted: results.inserted,
      skipped: results.skipped,
      duplicates: results.duplicates,
      errors: results.errors.length,
      errorRate: `${((results.errors.length / results.total) * 100).toFixed(2)}%`,
      successRate: `${((results.inserted / results.total) * 100).toFixed(2)}%`
    },
    verification: verification,
    detailedLogs: migrationLogger.generateReport(),
    recommendations: [
      results.errors.length > 0 ? "Review and resolve data validation errors" : "All records processed successfully",
      results.duplicates > 0 ? "Consider implementing duplicate detection in the extraction process" : "No duplicate records found",
      verification.totalBooks === results.inserted ? "Database verification passed" : "Database verification shows discrepancy"
    ]
  };

  const reportPath = path.join(__dirname, 'migration-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  migrationLogger.success(`Migration report saved to: ${reportPath}`);
  return report;
}

/**
 * Main migration function
 */
async function runMigration() {
  const dataFilePath = process.argv[2] || './extracted-books.json';
  
  migrationLogger.info('Starting MongoDB Migration Process');
  migrationLogger.info(`Data file: ${dataFilePath}`);
  migrationLogger.info(`MongoDB URI: ${process.env.DATABASE_URL?.replace(/\/\/.*@/, '//***:***@')}`);

  try {
    // Connect to MongoDB
    migrationLogger.info('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.DATABASE_URL, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    migrationLogger.success('Connected to MongoDB Atlas successfully');

    // Load extracted data
    migrationLogger.info('Loading extracted book data...');
    const books = loadExtractedData(dataFilePath);
    migrationLogger.success(`Loaded ${books.length} book records from ${dataFilePath}`);

    // Check for existing records
    migrationLogger.info('Checking for existing book codes...');
    const bookCodes = books.map(book => book.book_code).filter(code => code);
    const existingCodes = await getExistingBookCodes(mongoose, bookCodes);
    migrationLogger.info(`Found ${existingCodes.size} existing book codes`);

    // Perform migration
    migrationLogger.info('Starting bulk insert process...');
    const results = await performBulkInsert(books, existingCodes);
    
    migrationLogger.success('Bulk insert completed', {
      total: results.total,
      inserted: results.inserted,
      skipped: results.skipped,
      duplicates: results.duplicates,
      errors: results.errors.length
    });

    // Verify migration
    migrationLogger.info('Verifying migration...');
    const verification = await verifyMigration();
    migrationLogger.success('Migration verification completed');

    // Generate and save report
    const report = saveMigrationReport(results, verification);
    
    // Display summary
    console.log('\n=== MIGRATION SUMMARY ===');
    console.log(`Total Records Processed: ${results.total}`);
    console.log(`Successfully Inserted: ${results.inserted}`);
    console.log(`Skipped Records: ${results.skipped}`);
    console.log(`Duplicate Records: ${results.duplicates}`);
    console.log(`Errors: ${results.errors.length}`);
    console.log(`Success Rate: ${report.migrationSummary.successRate}`);
    console.log(`Database Verification:`);
    console.log(`  - Total Books in DB: ${verification.totalBooks}`);
    console.log(`  - Grade 1 Books: ${verification.grade1Books}`);
    console.log(`  - Grade 3 Books: ${verification.grade3Books}`);

    if (results.errors.length > 0) {
      console.log('\n=== ERRORS (First 10) ===');
      results.errors.slice(0, 10).forEach(error => {
        console.log(`ERROR: ${error.book_code || error.index}: ${error.error}`);
      });
      if (results.errors.length > 10) {
        console.log(`... and ${results.errors.length - 10} more errors`);
      }
    }

  } catch (error) {
    migrationLogger.error('Migration failed:', error.message);
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    // Close database connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      migrationLogger.info('Database connection closed');
    }
  }
}

// Initialize migration logger
const migrationLogger = new MigrationLogger();

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\nMigration interrupted by user');
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
  process.exit(0);
});

// Run migration if executed directly
if (require.main === module) {
  runMigration().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = {
  runMigration,
  loadExtractedData,
  transformBookRecord,
  verifyMigration
};