import { Router, Request, Response } from 'express';
import evaluationMonitoringService from '@/services/evaluationMonitoringService';
import { protect } from '@/middleware/auth';
import { ApiResponse } from '@/types';

const router = Router();

// GET /api/monitoring - Get all monitoring entries
router.get('/', protect, async (req: Request, res: Response) => {
  try {
    const entries = await evaluationMonitoringService.getAll(req.user);

    const response: ApiResponse = {
      success: true,
      data: entries,
    };

    res.json(response);
  } catch (error: any) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch monitoring entries',
        timestamp: new Date().toISOString(),
        path: req.path,
      },
    };
    res.status(500).json(errorResponse);
  }
});

// GET /api/monitoring/:bookCode - Get specific monitoring entry
router.get('/:bookCode', protect, async (req: Request, res: Response) => {
  try {
    const entry = await evaluationMonitoringService.getByBookCode(req.params.bookCode, req.user);

    const response: ApiResponse = {
      success: true,
      data: entry,
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
        path: req.path,
      },
    };
    res.status(statusCode).json(errorResponse);
  }
});

// POST /api/monitoring - Create monitoring entry
router.post('/', protect, async (req: Request, res: Response) => {
  try {
    const entry = await evaluationMonitoringService.create(req.body, req.user);

    const response: ApiResponse = {
      success: true,
      data: entry,
      message: 'Monitoring entry created successfully',
    };

    res.status(201).json(response);
  } catch (error: any) {
    const isNotFound = error.message.includes('not found');
    const isForbidden = error.name === 'ForbiddenError' || error.message.includes('already exists');
    const statusCode = isNotFound ? 404 : (isForbidden ? 403 : 500);
    const errorCode = isNotFound ? 'NOT_FOUND' : (isForbidden ? 'FORBIDDEN' : 'SERVER_ERROR');

    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: errorCode,
        message: error.message,
        timestamp: new Date().toISOString(),
        path: req.path,
      },
    };
    res.status(statusCode).json(errorResponse);
  }
});

// POST /api/monitoring/bulk - Bulk create monitoring entries
router.post('/bulk', protect, async (req: Request, res: Response) => {
  try {
    const { entries } = req.body;
    
    if (!Array.isArray(entries)) {
      const errorResponse: ApiResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Entries must be an array',
          timestamp: new Date().toISOString(),
          path: req.path,
        },
      };
      return res.status(400).json(errorResponse);
    }

    const result = await evaluationMonitoringService.bulkCreate(entries, req.user);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: `Created ${result.results.length} monitoring entries, ${result.errors.length} failed`,
    };

    res.status(201).json(response);
  } catch (error: any) {
    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to bulk create monitoring entries',
        timestamp: new Date().toISOString(),
        path: req.path,
      },
    };
    res.status(500).json(errorResponse);
  }
});

// PUT /api/monitoring/:bookCode - Update monitoring entry
router.put('/:bookCode', protect, async (req: Request, res: Response) => {
  try {
    const entry = await evaluationMonitoringService.update(req.params.bookCode, req.body, req.user);

    const response: ApiResponse = {
      success: true,
      data: entry,
      message: 'Monitoring entry updated successfully',
    };

    res.json(response);
  } catch (error: any) {
    const isNotFound = error.message.includes('not found');
    const isForbidden = error.name === 'ForbiddenError' || error.message.includes('already exists');
    const statusCode = isNotFound ? 404 : (isForbidden ? 403 : 500);
    const errorCode = isNotFound ? 'NOT_FOUND' : (isForbidden ? 'FORBIDDEN' : 'SERVER_ERROR');

    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: errorCode,
        message: error.message,
        timestamp: new Date().toISOString(),
        path: req.path,
      },
    };
    res.status(statusCode).json(errorResponse);
  }
});

// DELETE /api/monitoring/:bookCode - Delete monitoring entry
router.delete('/:bookCode', protect, async (req: Request, res: Response) => {
  try {
    await evaluationMonitoringService.delete(req.params.bookCode, req.user);

    const response: ApiResponse = {
      success: true,
      message: 'Monitoring entry deleted successfully',
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
        path: req.path,
      },
    };
    res.status(statusCode).json(errorResponse);
  }
});

export default router;
