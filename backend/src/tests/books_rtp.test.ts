import request from 'supertest';
import app from '@/app';

describe('Books API - RTP Status', () => {
  it('creates a book with RTP status', async () => {
    const bookData = {
      learningArea: 'Mathematics',
      gradeLevel: 3,
      publisher: 'RTP Publisher',
      title: 'RTP Book',
      status: 'RTP'
    };

    const response = await request(app)
      .post('/api/books')
      .send(bookData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('RTP');
  });

  it('filters books by RTP status', async () => {
    await request(app)
      .post('/api/books')
      .send({
        learningArea: 'Science',
        gradeLevel: 2,
        publisher: 'Filter Pub',
        title: 'Filter RTP Book',
        status: 'RTP'
      })
      .expect(201);

    const response = await request(app)
      .get('/api/books?status=RTP')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    const hasOnlyRTP = response.body.data.every((b: any) => b.status === 'RTP');
    expect(hasOnlyRTP).toBe(true);
  });

  it('updates book status to and from RTP', async () => {
    const createRes = await request(app)
      .post('/api/books')
      .send({
        learningArea: 'English',
        gradeLevel: 5,
        publisher: 'Update Pub',
        title: 'Update RTP Book',
        status: 'For Evaluation'
      })
      .expect(201);

    const code = createRes.body.data.book_code;

    const toRtp = await request(app)
      .put(`/api/books/${code}`)
      .send({ status: 'RTP' })
      .expect(200);
    expect(toRtp.body.data.status).toBe('RTP');

    const fromRtp = await request(app)
      .put(`/api/books/${code}`)
      .send({ status: 'For Revision' })
      .expect(200);
    expect(fromRtp.body.data.status).toBe('For Revision');
  });
});
