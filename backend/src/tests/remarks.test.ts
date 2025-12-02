import request from 'supertest';
import app from '@/app';

describe('Remarks API', () => {
  it('should delete an existing remark', async () => {
    const bookData = {
      learningArea: 'Mathematics',
      gradeLevel: 5,
      publisher: 'Vibal',
      title: 'Algebra Basics',
      status: 'For Evaluation',
      remark: 'Initial remark',
    };

    const createResponse = await request(app)
      .post('/api/books')
      .send(bookData)
      .expect(201);

    const bookCode = createResponse.body.data.book_code;

    const remarkData = {
      text: 'To be deleted',
      timestamp: new Date().toISOString(),
    };

    const addRemarkResponse = await request(app)
      .post(`/api/books/${bookCode}/remarks`)
      .send(remarkData)
      .expect(201);

    const remarkId = addRemarkResponse.body.data._id;

    await request(app)
      .delete(`/api/books/${bookCode}/remarks/${remarkId}`)
      .expect(200);
  });

  it('should return 404 when remark does not exist', async () => {
    const bookData = {
      learningArea: 'Science',
      gradeLevel: 6,
      publisher: 'Vibal',
      title: 'Physics',
      status: 'In Progress',
    };

    const createResponse = await request(app)
      .post('/api/books')
      .send(bookData)
      .expect(201);

    const bookCode = createResponse.body.data.book_code;

    const nonExistentId = 'aaaaaaaaaaaaaaaaaaaaaaaa';

    const response = await request(app)
      .delete(`/api/books/${bookCode}/remarks/${nonExistentId}`)
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 400 for invalid remark ID format', async () => {
    const bookData = {
      learningArea: 'English',
      gradeLevel: 4,
      publisher: 'Vibal',
      title: 'Grammar',
      status: 'For Revision',
    };

    const createResponse = await request(app)
      .post('/api/books')
      .send(bookData)
      .expect(201);

    const bookCode = createResponse.body.data.book_code;

    const invalidId = 'invalid-id';

    const response = await request(app)
      .delete(`/api/books/${bookCode}/remarks/${invalidId}`)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
