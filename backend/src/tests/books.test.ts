import request from 'supertest';
import app from '@/app';
import { Book } from '@/types';

describe('Books API', () => {
  describe('GET /api/books', () => {
    it('should return paginated list of books', async () => {
      const response = await request(app)
        .get('/api/books?page=1&limit=10')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body).toHaveProperty('filters');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toHaveProperty('currentPage', 1);
      expect(response.body.pagination).toHaveProperty('itemsPerPage', 10);
    });

    it('should filter books by status', async () => {
      const response = await request(app)
        .get('/api/books?status=In%20Progress')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should search books by text', async () => {
      const response = await request(app)
        .get('/api/books?search=mathematics')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return validation error for invalid query params', async () => {
      const response = await request(app)
        .get('/api/books?page=-1&limit=999')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/books', () => {
    it('should create a new book', async () => {
      const bookData = {
        learningArea: 'Mathematics',
        gradeLevel: 5,
        publisher: 'Test Publisher',
        title: 'Test Book',
        status: 'For Evaluation',
        remark: 'Initial remark'
      };

      const response = await request(app)
        .post('/api/books')
        .send(bookData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('book_code');
      expect(response.body.data.title).toBe(bookData.title);
      expect(response.body.data.learning_area).toBe(bookData.learningArea);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/books')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should validate book data', async () => {
      const invalidBookData = {
        learningArea: '', // Too short
        gradeLevel: 15, // Out of range
        publisher: 'Test Publisher',
        title: 'Test Book',
        status: 'Invalid Status'
      };

      const response = await request(app)
        .post('/api/books')
        .send(invalidBookData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/books/:bookCode', () => {
    it('should return specific book', async () => {
      // First create a book
      const bookData = {
        learningArea: 'Science',
        gradeLevel: 6,
        publisher: 'Science Publisher',
        title: 'Science Book',
        status: 'In Progress'
      };

      const createResponse = await request(app)
        .post('/api/books')
        .send(bookData)
        .expect(201);

      const bookCode = createResponse.body.data.book_code;

      // Then retrieve it
      const response = await request(app)
        .get(`/api/books/${bookCode}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.book_code).toBe(bookCode);
      expect(response.body.data.title).toBe(bookData.title);
    });

    it('should return 404 for non-existent book', async () => {
      const response = await request(app)
        .get('/api/books/NONEXISTENT')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('PUT /api/books/:bookCode', () => {
    it('should update existing book', async () => {
      // First create a book
      const bookData = {
        learningArea: 'History',
        gradeLevel: 7,
        publisher: 'History Publisher',
        title: 'History Book',
        status: 'For Revision'
      };

      const createResponse = await request(app)
        .post('/api/books')
        .send(bookData)
        .expect(201);

      const bookCode = createResponse.body.data.book_code;

      // Update the book
      const updateData = {
        title: 'Updated History Book',
        status: 'For Finalization',
        remark: 'Status updated'
      };

      const response = await request(app)
        .put(`/api/books/${bookCode}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.status).toBe(updateData.status);
    });

    it('should return 404 for non-existent book', async () => {
      const updateData = {
        title: 'Updated Book'
      };

      const response = await request(app)
        .put('/api/books/NONEXISTENT')
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('DELETE /api/books/:bookCode', () => {
    it('should delete existing book', async () => {
      // First create a book
      const bookData = {
        learningArea: 'Art',
        gradeLevel: 4,
        publisher: 'Art Publisher',
        title: 'Art Book',
        status: 'For Evaluation'
      };

      const createResponse = await request(app)
        .post('/api/books')
        .send(bookData)
        .expect(201);

      const bookCode = createResponse.body.data.book_code;

      // Delete the book
      const response = await request(app)
        .delete(`/api/books/${bookCode}`)
        .expect(204);

      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent book', async () => {
      const response = await request(app)
        .delete('/api/books/NONEXISTENT')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('POST /api/books/:bookCode/remarks', () => {
    it('should add remark to book', async () => {
      // First create a book
      const bookData = {
        learningArea: 'Music',
        gradeLevel: 3,
        publisher: 'Music Publisher',
        title: 'Music Book',
        status: 'In Progress'
      };

      const createResponse = await request(app)
        .post('/api/books')
        .send(bookData)
        .expect(201);

      const bookCode = createResponse.body.data.book_code;

      // Add a remark
      const remarkData = {
        text: 'This book needs more examples',
        timestamp: '2024-01-15T10:30:00Z'
      };

      const response = await request(app)
        .post(`/api/books/${bookCode}/remarks`)
        .send(remarkData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.text).toBe(remarkData.text);
      expect(response.body.data.book_code).toBe(bookCode);
    });

    it('should validate remark data', async () => {
      const remarkData = {
        text: '' // Too short
      };

      const response = await request(app)
        .post('/api/books/SOMEBOOK/remarks')
        .send(remarkData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('environment');
    });
  });
});