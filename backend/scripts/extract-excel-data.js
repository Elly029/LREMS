const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

/**
 * Excel Data Extraction Script for Book Management System
 * Extracts data from Grade 1 and Grade 3 lists from the Excel file
 */

// Column mapping from Excel to database fields
const COLUMN_MAPPING = {
  'BOOK CODE': 'book_code',
  'Learning Area': 'learning_area',
  'Grade Level': 'grade_level',
  'Publisher': 'publisher',
  'Titles': 'title',
  'Status': 'status',
  'Remarks': 'remarks'
};

// Valid statuses from the system
const VALID_STATUSES = [
  'For Evaluation',
  'For Revision',
  'For ROR',
  'For Finalization',
  'For FRR and Signing Off',
  'Final Revised copy',
  'NOT FOUND',
  'RETURNED',
  'DQ/FOR RETURN'
];

/**
 * Clean and normalize string data
 * @param {string} value - The value to clean
 * @returns {string} - Cleaned value
 */
function cleanString(value) {
  if (!value || value === undefined || value === null) {
    return '';
  }
  
  // Convert to string and trim
  let cleaned = String(value).trim();
  
  // Remove footnote markers like [^1], [^2], etc.
  cleaned = cleaned.replace(/\[\^\d+\]/g, '');
  
  // Remove extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ');
  
  return cleaned;
}

/**
 * Convert grade level to number
 * @param {string|number} gradeLevel - Grade level value
 * @returns {number} - Converted grade level number
 */
function convertGradeLevel(gradeLevel) {
  if (typeof gradeLevel === 'number') {
    return gradeLevel;
  }
  
  const cleaned = cleanString(gradeLevel);
  const gradeMatch = cleaned.match(/(\d+)/);
  
  if (gradeMatch) {
    return parseInt(gradeMatch[1], 10);
  }
  
  throw new Error(`Invalid grade level: ${gradeLevel}`);
}

/**
 * Validate and normalize status
 * @param {string} status - Status value
 * @returns {string} - Validated status
 */
function validateStatus(status) {
  const cleaned = cleanString(status);
  
  // Check for exact match
  if (VALID_STATUSES.includes(cleaned)) {
    return cleaned;
  }
  
  // Try to find partial matches
  const normalizedStatus = VALID_STATUSES.find(validStatus => 
    validStatus.toLowerCase().includes(cleaned.toLowerCase()) ||
    cleaned.toLowerCase().includes(validStatus.toLowerCase())
  );
  
  if (normalizedStatus) {
    return normalizedStatus;
  }
  
  // Default to 'For Evaluation' if no match found
  console.warn(`Warning: Unknown status "${status}", defaulting to 'For Evaluation'`);
  return 'For Evaluation';
}

/**
 * Validate required fields
 * @param {Object} record - Book record
 * @returns {Object} - Validation result
 */
function validateRecord(record) {
  const errors = [];
  const warnings = [];
  
  // Required fields validation
  const requiredFields = ['book_code', 'learning_area', 'grade_level', 'publisher', 'title', 'status'];
  
  requiredFields.forEach(field => {
    if (!record[field] || record[field].toString().trim() === '') {
      errors.push(`Missing required field: ${field}`);
    }
  });
  
  // Grade level validation
  if (record.grade_level && (record.grade_level < 1 || record.grade_level > 12)) {
    warnings.push(`Grade level ${record.grade_level} seems unusual (expected 1-12)`);
  }
  
  // Book code validation
  if (record.book_code && record.book_code.length < 3) {
    warnings.push(`Book code "${record.book_code}" seems too short`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Transform Excel row to book record
 * @param {Object} row - Excel row data
 * @param {number} rowIndex - Row index for error reporting
 * @returns {Object} - Transformed book record
 */
function transformRow(row, rowIndex) {
  const record = {};
  
  // Map Excel columns to database fields
  Object.keys(COLUMN_MAPPING).forEach(excelColumn => {
    const dbField = COLUMN_MAPPING[excelColumn];
    const value = row[excelColumn];
    
    // Clean the value
    record[dbField] = cleanString(value);
  });
  
  // Special transformations
  try {
    record.grade_level = convertGradeLevel(record.grade_level);
  } catch (error) {
    console.warn(`Row ${rowIndex}: ${error.message}`);
  }
  
  // Validate and normalize status
  record.status = validateStatus(record.status);
  
  // Add metadata
  record.is_new = true;
  record.extracted_at = new Date().toISOString();
  record.source_row = rowIndex;
  
  return record;
}

/**
 * Process Excel file and extract book data
 * @param {string} filePath - Path to Excel file
 * @returns {Object} - Processing results
 */
async function processExcelFile(filePath) {
  console.log(`Processing Excel file: ${filePath}`);
  
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`Excel file not found: ${filePath}`);
    }
    
    // Read Excel file
    const workbook = XLSX.readFile(filePath);
    console.log(`Loaded workbook with ${workbook.SheetNames.length} sheets`);
    
    // Target sheets
    const targetSheets = ['Grade 3 List', 'Grade 1 List'];
    const availableSheets = workbook.SheetNames;
    
    // Check if target sheets exist
    const missingSheets = targetSheets.filter(sheet => !availableSheets.includes(sheet));
    if (missingSheets.length > 0) {
      console.warn(`Warning: Missing sheets: ${missingSheets.join(', ')}`);
      console.log(`Available sheets: ${availableSheets.join(', ')}`);
    }
    
    const foundSheets = targetSheets.filter(sheet => availableSheets.includes(sheet));
    console.log(`Processing sheets: ${foundSheets.join(', ')}`);
    
    const allBooks = [];
    const processingResults = {
      totalProcessed: 0,
      validRecords: 0,
      invalidRecords: 0,
      warnings: [],
      errors: []
    };
    
    // Process each target sheet
    for (const sheetName of foundSheets) {
      console.log(`\nProcessing sheet: ${sheetName}`);
      
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length === 0) {
        console.warn(`Sheet "${sheetName}" is empty`);
        continue;
      }
      
      // First row should be headers
      const headers = jsonData[0];
      const dataRows = jsonData.slice(1);
      
      console.log(`Found ${dataRows.length} data rows in "${sheetName}"`);
      
      // Process each row
      dataRows.forEach((row, index) => {
        try {
          // Convert row array to object with headers
          const rowObject = {};
          headers.forEach((header, colIndex) => {
            rowObject[header] = row[colIndex];
          });
          
          // Transform the row
          const bookRecord = transformRow(rowObject, index + 2); // +2 because of 0-based index and header row
          
          // Validate the record
          const validation = validateRecord(bookRecord);
          
          if (validation.isValid) {
            allBooks.push(bookRecord);
            processingResults.validRecords++;
          } else {
            processingResults.invalidRecords++;
            validation.errors.forEach(error => {
              processingResults.errors.push(`Row ${index + 2} in "${sheetName}": ${error}`);
            });
          }
          
          validation.warnings.forEach(warning => {
            processingResults.warnings.push(`Row ${index + 2} in "${sheetName}": ${warning}`);
          });
          
          processingResults.totalProcessed++;
          
        } catch (error) {
          processingResults.invalidRecords++;
          processingResults.errors.push(`Row ${index + 2} in "${sheetName}": ${error.message}`);
        }
      });
      
      console.log(`Processed ${dataRows.length} rows from "${sheetName}"`);
    }
    
    return {
      success: true,
      books: allBooks,
      results: processingResults,
      metadata: {
        processedAt: new Date().toISOString(),
        sourceFile: filePath,
        processedSheets: foundSheets,
        totalBooks: allBooks.length
      }
    };
    
  } catch (error) {
    console.error('Error processing Excel file:', error);
    return {
      success: false,
      error: error.message,
      results: null,
      metadata: null
    };
  }
}

/**
 * Save extracted data to JSON file
 * @param {Object} data - Extracted data
 * @param {string} outputPath - Output file path
 */
function saveToJson(data, outputPath) {
  try {
    const jsonContent = JSON.stringify(data, null, 2);
    fs.writeFileSync(outputPath, jsonContent);
    console.log(`Extracted data saved to: ${outputPath}`);
  } catch (error) {
    console.error('Error saving JSON file:', error);
  }
}

/**
 * Main execution function
 */
async function main() {
  const inputFile = process.argv[2] || '../Grades 1 and 3 STATUS.xlsx';
  const outputFile = process.argv[3] || './extracted-books.json';
  
  console.log('=== Book Data Extraction Script ===');
  console.log(`Input file: ${inputFile}`);
  console.log(`Output file: ${outputFile}`);
  console.log('');
  
  // Resolve paths
  const inputPath = path.resolve(__dirname, inputFile);
  const outputPath = path.resolve(__dirname, outputFile);
  
  // Process the Excel file
  const result = await processExcelFile(inputPath);
  
  if (result.success) {
    // Save to JSON
    saveToJson(result, outputPath);
    
    // Display summary
    console.log('\n=== Processing Summary ===');
    console.log(`Total records processed: ${result.results.totalProcessed}`);
    console.log(`Valid records: ${result.results.validRecords}`);
    console.log(`Invalid records: ${result.results.invalidRecords}`);
    console.log(`Total books extracted: ${result.books.length}`);
    
    if (result.results.errors.length > 0) {
      console.log('\n=== Errors ===');
      result.results.errors.forEach(error => console.log(`ERROR: ${error}`));
    }
    
    if (result.results.warnings.length > 0) {
      console.log('\n=== Warnings ===');
      result.results.warnings.forEach(warning => console.log(`WARNING: ${warning}`));
    }
    
    console.log('\n=== Data Sample ===');
    console.log('First 3 book records:');
    result.books.slice(0, 3).forEach((book, index) => {
      console.log(`\nBook ${index + 1}:`);
      console.log(`  Book Code: ${book.book_code}`);
      console.log(`  Title: ${book.title}`);
      console.log(`  Grade Level: ${book.grade_level}`);
      console.log(`  Status: ${book.status}`);
      console.log(`  Learning Area: ${book.learning_area}`);
    });
    
  } else {
    console.error('Failed to process Excel file:', result.error);
    process.exit(1);
  }
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    processExcelFile,
    transformRow,
    validateRecord,
    cleanString,
    convertGradeLevel,
    validateStatus,
    COLUMN_MAPPING,
    VALID_STATUSES
  };
}

// Run main function if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}