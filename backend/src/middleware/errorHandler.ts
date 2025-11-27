import { Request, Response, NextFunction } from 'express';
import logger from '@/utils/logger';
import { ApiResponse } from '@/types';

export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const timestamp = new Date().toISOString();
  const path = req.path;

  // Log the error
  logger.error('Error occurred', {
    message: error.message,
    stack: error.stack,
    path,
    method: req.method,
    timestamp
  });

  // Determine status code and error code
  let statusCode = 500;
  let errorCode = 'SERVER_ERROR';

  if (error.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    errorCode = 'UNAUTHORIZED';
  } else if (error.name === 'ForbiddenError') {
    statusCode = 403;
    errorCode = 'FORBIDDEN';
  } else if (error.name === 'NotFoundError') {
    statusCode = 404;
    errorCode = 'NOT_FOUND';
  } else if (error.code === '23505') { // PostgreSQL unique constraint violation
    statusCode = 409;
    errorCode = 'DUPLICATE_ENTRY';
  } else if (error.code === '23503') { // PostgreSQL foreign key constraint violation
    statusCode = 400;
    errorCode = 'INVALID_REFERENCE';
  } else if (error.statusCode) {
    statusCode = error.statusCode;
  }

  // Prepare error response
  const errorResponse: ApiResponse = {
    success: false,
    error: {
      code: errorCode,
      message: error.message || 'An unexpected error occurred',
      details: error.details,
      timestamp,
      path
    }
  };

  // Send error response
  res.status(statusCode).json(errorResponse);
};

// Custom error classes
export class ValidationError extends Error {
  public statusCode = 400;
  public code = 'VALIDATION_ERROR';
  public details?: any;

  constructor(message: string, details?: any) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class NotFoundError extends Error {
  public statusCode = 404;
  public code = 'NOT_FOUND';

  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  public statusCode = 401;
  public code = 'UNAUTHORIZED';

  constructor(message: string = 'Unauthorized access') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  public statusCode = 403;
  public code = 'FORBIDDEN';

  constructor(message: string = 'Forbidden access') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

// 404 handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`);
  next(error);
};