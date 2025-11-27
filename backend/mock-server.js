// Simple Mock API Server for testing frontend integration
import http from 'http';
import { URL } from 'url';

const PORT = 3000;

// Mock data
const mockBooks = [
  {
    book_code: '25G3-MATH001',
    learning_area: 'Mathematics',
    grade_level: 3,
    publisher: 'Educational Press',
    title: 'Basic Math for Grade 3',
    status: 'For Evaluation',
    is_new: true,
    created_at: '2025-01-15T08:00:00Z',
    updated_at: '2025-01-15T08:00:00Z',
    remarks: [
      {
        id: '1',
        book_code: '25G3-MATH001',
        text: 'Needs review for mathematical accuracy',
        timestamp: '2025-01-15T09:00:00Z'
      }
    ]
  },
  {
    book_code: '25G3-SCI001',
    learning_area: 'Science',
    grade_level: 3,
    publisher: 'Science Publishers',
    title: 'Introduction to Science',
    status: 'For Revision',
    is_new: true,
    created_at: '2025-01-15T08:00:00Z',
    updated_at: '2025-01-15T08:00:00Z',
    remarks: []
  },
  {
    book_code: '25G3-ENG001',
    learning_area: 'English',
    grade_level: 3,
    publisher: 'Language Arts Inc',
    title: 'Reading Adventures',
    status: 'For ROR',
    is_new: false,
    created_at: '2025-01-10T08:00:00Z',
    updated_at: '2025-01-14T08:00:00Z',
    remarks: [
      {
        id: '2',
        book_code: '25G3-ENG001',
        text: 'Great content, approved for use',
        timestamp: '2025-01-14T10:00:00Z'
      },
      {
        id: '3',
        book_code: '25G3-ENG001',
        text: 'Initial review completed',
        timestamp: '2025-01-10T15:00:00Z'
      }
    ]
  }
];

// Helper function to create JSON response
function createJsonResponse(data, statusCode = 200, requestPath = '') {
  return JSON.stringify({
    success: statusCode >= 200 && statusCode < 300,
    data,
    ...(statusCode >= 400 && {
      error: {
        code: 'MOCK_ERROR',
        message: 'Mock error for testing',
        timestamp: new Date().toISOString(),
        path: requestPath
      }
    })
  });
}

// API Router
function handleApiRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  const method = req.method;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight requests
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // GET /api/books - Fetch all books
  if (path === '/api/books' && method === 'GET') {
    const response = {
      success: true,
      data: mockBooks,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: mockBooks.length,
        itemsPerPage: 100,
        hasNext: false,
        hasPrev: false
      },
      filters: {
        availableStatuses: ['For Evaluation', 'For Revision', 'For ROR', 'For Finalization', 'For FRR', 'For Signing off', 'NOT FOUND', 'RETURNED', 'In Progress'],
        availableLearningAreas: ['Mathematics', 'Science', 'English'],
        availablePublishers: ['Educational Press', 'Science Publishers', 'Language Arts Inc'],
        gradeLevels: [3]
      }
    };
    
    res.writeHead(200);
    res.end(JSON.stringify(response));
    return;
  }

  // GET /api/books/:bookCode - Get specific book
  if (path.startsWith('/api/books/') && !path.includes('/remarks') && method === 'GET') {
    const bookCode = path.split('/')[3];
    const book = mockBooks.find(b => b.book_code === bookCode);
    
    if (book) {
      res.writeHead(200);
      res.end(createJsonResponse(book));
    } else {
      res.writeHead(404);
      res.end(createJsonResponse({ message: 'Book not found' }, 404, `/api/books/${bookCode}`));
    }
    return;
  }

  // POST /api/books - Create new book
  if (path === '/api/books' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const bookData = JSON.parse(body);
        const newBook = {
          book_code: `25G3-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          learning_area: bookData.learningArea,
          grade_level: bookData.gradeLevel,
          publisher: bookData.publisher,
          title: bookData.title,
          status: bookData.status,
          is_new: bookData.isNew || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          remarks: []
        };
        
        mockBooks.unshift(newBook);
        res.writeHead(201);
        res.end(createJsonResponse(newBook));
      } catch (error) {
        res.writeHead(400);
        res.end(createJsonResponse({ message: 'Invalid request body' }, 400, `/api/books`));
      }
    });
    return;
  }

  // PUT /api/books/:bookCode - Update book
  if (path.startsWith('/api/books/') && !path.includes('/remarks') && method === 'PUT') {
    const bookCode = path.split('/')[3];
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const updateData = JSON.parse(body);
        const bookIndex = mockBooks.findIndex(b => b.book_code === bookCode);
        
        if (bookIndex !== -1) {
          const updatedBook = {
            ...mockBooks[bookIndex],
            ...updateData,
            learning_area: updateData.learningArea || mockBooks[bookIndex].learning_area,
            grade_level: updateData.gradeLevel || mockBooks[bookIndex].grade_level,
            publisher: updateData.publisher || mockBooks[bookIndex].publisher,
            title: updateData.title || mockBooks[bookIndex].title,
            status: updateData.status || mockBooks[bookIndex].status,
            is_new: updateData.isNew !== undefined ? updateData.isNew : mockBooks[bookIndex].is_new,
            updated_at: new Date().toISOString()
          };
          
          mockBooks[bookIndex] = updatedBook;
          res.writeHead(200);
          res.end(createJsonResponse(updatedBook));
        } else {
          res.writeHead(404);
          res.end(createJsonResponse({ message: 'Book not found' }, 404, `/api/books/${bookCode}`));
        }
      } catch (error) {
        res.writeHead(400);
        res.end(createJsonResponse({ message: 'Invalid request body' }, 400, `/api/books/${bookCode}`));
      }
    });
    return;
  }

  // DELETE /api/books/:bookCode - Delete book
  if (path.startsWith('/api/books/') && !path.includes('/remarks') && method === 'DELETE') {
    const bookCode = path.split('/')[3];
    const bookIndex = mockBooks.findIndex(b => b.book_code === bookCode);
    
    if (bookIndex !== -1) {
      mockBooks.splice(bookIndex, 1);
      res.writeHead(204);
      res.end();
    } else {
      res.writeHead(404);
      res.end(createJsonResponse({ message: 'Book not found' }, 404, `/api/books/${bookCode}`));
    }
    return;
  }

  // POST /api/books/:bookCode/remarks - Add remark
  if (path.includes('/remarks') && method === 'POST') {
    const bookCode = path.split('/')[3];
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const remarkData = JSON.parse(body);
        const bookIndex = mockBooks.findIndex(b => b.book_code === bookCode);
        
        if (bookIndex !== -1) {
          const newRemark = {
            id: (mockBooks[bookIndex].remarks.length + 1).toString(),
            book_code: bookCode,
            text: remarkData.text,
            timestamp: new Date().toISOString()
          };
          
          mockBooks[bookIndex].remarks.unshift(newRemark);
          res.writeHead(201);
          res.end(createJsonResponse(newRemark));
        } else {
          res.writeHead(404);
          res.end(createJsonResponse({ message: 'Book not found' }, 404, `/api/books/${bookCode}/remarks`));
        }
      } catch (error) {
        res.writeHead(400);
        res.end(createJsonResponse({ message: 'Invalid request body' }, 400, `/api/books/${bookCode}/remarks`));
      }
    });
    return;
  }

  // 404 for unmatched routes
  res.writeHead(404);
  res.end(createJsonResponse({ message: 'API endpoint not found' }, 404));
}

// Create and start server
const server = http.createServer(handleApiRequest);

server.listen(PORT, () => {
  console.log(`🚀 Mock API Server running on http://localhost:${PORT}`);
  console.log(`📚 Available endpoints:`);
  console.log(`   GET    /api/books`);
  console.log(`   GET    /api/books/:bookCode`);
  console.log(`   POST   /api/books`);
  console.log(`   PUT    /api/books/:bookCode`);
  console.log(`   DELETE /api/books/:bookCode`);
  console.log(`   POST   /api/books/:bookCode/remarks`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server shut down successfully');
    process.exit(0);
  });
});