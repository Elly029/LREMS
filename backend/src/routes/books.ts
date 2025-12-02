import { Router, Request, Response } from 'express';
import bookService from '@/services/bookService';
import { validateBooksQuery, validateCreateBook, validateUpdateBook, validateRemark, validateRemarkParams } from '@/middleware/validation';
import logger from '@/utils/logger';
import { ApiResponse, BooksResponse } from '@/types';
import { protect } from '@/middleware/auth';

const router = Router();

// GET /api/books - Fetch books with filtering, search, and pagination
router.get('/', protect, validateBooksQuery, async (req: Request, res: Response) => {
  try {
    const result = await bookService.getBooks(req.query, req.user);

    const response: BooksResponse = {
      success: true,
      data: result.data,
      pagination: result.pagination,
      filters: result.filters
    };

    const payload = JSON.stringify(response);
    const etag = 'W/"' + Buffer.from(payload).toString('base64').slice(0, 32) + '"';
    const ifNoneMatch = req.headers['if-none-match'];

    res.setHeader('Cache-Control', 'public, max-age=120, stale-while-revalidate=600');
    res.setHeader('ETag', etag);

    if (ifNoneMatch && ifNoneMatch === etag) {
      return res.status(304).end();
    }

    res.json(response);
  } catch (error: any) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch books',
        timestamp: new Date().toISOString(),
        path: req.path
      }
    };
    res.status(500).json(errorResponse);
  }
});

// GET /api/books/:bookCode - Get specific book by code
router.get('/:bookCode', protect, async (req: Request, res: Response) => {
  try {
    const book = await bookService.getBookByCode(req.params.bookCode);

    const response: ApiResponse = {
      success: true,
      data: book,
      message: 'Book retrieved successfully'
    };

    const payload = JSON.stringify(response);
    const etag = 'W/"' + Buffer.from(payload).toString('base64').slice(0, 32) + '"';
    const ifNoneMatch = req.headers['if-none-match'];

    res.setHeader('Cache-Control', 'public, max-age=120, stale-while-revalidate=600');
    res.setHeader('ETag', etag);

    if (ifNoneMatch && ifNoneMatch === etag) {
      return res.status(304).end();
    }

    res.json(response);
  } catch (error: any) {
    const errorCode = error.message.includes('not found') ? 'NOT_FOUND' : 'SERVER_ERROR';
    const statusCode = error.message.includes('not found') ? 404 : 500;

    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: errorCode,
        message: error.message,
        timestamp: new Date().toISOString(),
        path: req.path
      }
    };
    res.status(statusCode).json(errorResponse);
  }
});

// POST /api/books - Create new book
router.post('/', protect, validateCreateBook, async (req: Request, res: Response) => {
  try {
    const book = await bookService.createBook(req.body, req.user);

    const response: ApiResponse = {
      success: true,
      data: book,
      message: 'Book created successfully'
    };

    res.status(201).json(response);
  } catch (error: any) {
    const statusCode = error.name === 'ForbiddenError' ? 403 : 500;
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: error.name === 'ForbiddenError' ? 'FORBIDDEN' : 'SERVER_ERROR',
        message: error.message || 'Failed to create book',
        timestamp: new Date().toISOString(),
        path: req.path
      }
    };
    res.status(statusCode).json(errorResponse);
  }
});

// PUT /api/books/:bookCode - Update existing book
router.put('/:bookCode', protect, validateUpdateBook, async (req: Request, res: Response) => {
  try {
    const book = await bookService.updateBook(req.params.bookCode, req.body, req.user);

    const response: ApiResponse = {
      success: true,
      data: book,
      message: 'Book updated successfully'
    };

    res.json(response);
  } catch (error: any) {
    const isNotFound = error.message.includes('not found');
    const isForbidden = error.name === 'ForbiddenError';

    const statusCode = isNotFound ? 404 : (isForbidden ? 403 : 500);
    const errorCode = isNotFound ? 'NOT_FOUND' : (isForbidden ? 'FORBIDDEN' : 'SERVER_ERROR');

    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: errorCode,
        message: error.message,
        timestamp: new Date().toISOString(),
        path: req.path
      }
    };
    res.status(statusCode).json(errorResponse);
  }
});

// DELETE /api/books/:bookCode - Delete book
router.delete('/:bookCode', protect, async (req: Request, res: Response) => {
  try {
    await bookService.deleteBook(req.params.bookCode, req.user);

    const response: ApiResponse = {
      success: true,
      message: 'Book deleted successfully'
    };

    res.status(200).json(response);
  } catch (error: any) {
    const isNotFound = error.message.includes('not found');
    const isForbidden = error.name === 'ForbiddenError';

    const statusCode = isNotFound ? 404 : (isForbidden ? 403 : 500);
    const errorCode = isNotFound ? 'NOT_FOUND' : (isForbidden ? 'FORBIDDEN' : 'SERVER_ERROR');

    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: errorCode,
        message: error.message,
        timestamp: new Date().toISOString(),
        path: req.path
      }
    };
    res.status(statusCode).json(errorResponse);
  }
});

// POST /api/books/:bookCode/remarks - Add remark to book
router.post('/:bookCode/remarks', protect, validateRemark, async (req: Request, res: Response) => {
  try {
    const remark = await bookService.addRemark(req.params.bookCode, req.body, req.user);

    const response: ApiResponse = {
      success: true,
      data: remark,
      message: 'Remark added successfully'
    };

    res.status(201).json(response);
  } catch (error: any) {
    const isNotFound = error.message.includes('not found');
    const isForbidden = error.name === 'ForbiddenError';

    const statusCode = isNotFound ? 404 : (isForbidden ? 403 : 500);
    const errorCode = isNotFound ? 'NOT_FOUND' : (isForbidden ? 'FORBIDDEN' : 'SERVER_ERROR');

    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: errorCode,
        message: error.message,
        timestamp: new Date().toISOString(),
        path: req.path
      }
    };
    res.status(statusCode).json(errorResponse);
  }
});

// PUT /api/books/:bookCode/remarks/:remarkId - Update remark
router.put('/:bookCode/remarks/:remarkId', protect, validateRemarkParams, async (req: Request, res: Response) => {
  try {
    const remark = await bookService.updateRemark(req.params.bookCode, req.params.remarkId, req.body, req.user);

    const response: ApiResponse = {
      success: true,
      data: remark,
      message: 'Remark updated successfully'
    };

    res.json(response);
  } catch (error: any) {
    const statusCode = error.name === 'NotFoundError' ? 404 : error.name === 'ForbiddenError' ? 403 : error.name === 'ValidationError' ? 400 : 500;
    const errorCode = error.name === 'NotFoundError' ? 'NOT_FOUND' : error.name === 'ForbiddenError' ? 'FORBIDDEN' : error.name === 'ValidationError' ? 'VALIDATION_ERROR' : 'SERVER_ERROR';
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: errorCode,
        message: error.message,
        timestamp: new Date().toISOString(),
        path: req.path
      }
    };
    res.status(statusCode).json(errorResponse);
  }
});

// DELETE /api/books/:bookCode/remarks/:remarkId - Delete remark
router.delete('/:bookCode/remarks/:remarkId', protect, validateRemarkParams, async (req: Request, res: Response) => {
  try {
    logger.info('Attempting to delete remark', { bookCode: req.params.bookCode, remarkId: req.params.remarkId, user: req.user?.username });
    await bookService.deleteRemark(req.params.bookCode, req.params.remarkId, req.user);

    const response: ApiResponse = {
      success: true,
      message: 'Remark deleted successfully'
    };

    res.json(response);
  } catch (error: any) {
    const statusCode = error.name === 'NotFoundError' ? 404 : error.name === 'ForbiddenError' ? 403 : error.name === 'ValidationError' ? 400 : 500;
    const errorCode = error.name === 'NotFoundError' ? 'NOT_FOUND' : error.name === 'ForbiddenError' ? 'FORBIDDEN' : error.name === 'ValidationError' ? 'VALIDATION_ERROR' : 'SERVER_ERROR';
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: errorCode,
        message: error.message,
        timestamp: new Date().toISOString(),
        path: req.path
      }
    };
    res.status(statusCode).json(errorResponse);
  }
});

export default router;
