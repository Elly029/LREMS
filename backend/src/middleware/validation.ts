import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '@/middleware/errorHandler';

// Validation schemas
export const bookSchemas = {
  create: Joi.object({
    bookCode: Joi.string().max(50).optional(),
    learningArea: Joi.string().max(100).required(),
    gradeLevel: Joi.number().integer().min(1).max(12).required(),
    publisher: Joi.string().max(200).required(),
    title: Joi.string().max(500).required(),
    status: Joi.string().valid(
      'For Evaluation',
      'For Revision',
      'For ROR',
      'For Finalization',
      'For FRR and Signing Off',
      'Final Revised copy',
      'NOT FOUND',
      'RETURNED',
      'DQ/FOR RETURN',
      'In Progress'
    ).required(),
    isNew: Joi.boolean(),
    ntpDate: Joi.date().iso().allow(null, '').optional(),
    remark: Joi.string().max(1000)
  }),

  update: Joi.object({
    bookCode: Joi.string().max(50).optional(),
    learningArea: Joi.string().max(100),
    gradeLevel: Joi.number().integer().min(1).max(12),
    publisher: Joi.string().max(200),
    title: Joi.string().max(500),
    status: Joi.string().valid(
      'For Evaluation',
      'For Revision',
      'For ROR',
      'For Finalization',
      'For FRR and Signing Off',
      'Final Revised copy',
      'NOT FOUND',
      'RETURNED',
      'DQ/FOR RETURN',
      'In Progress'
    ),
    isNew: Joi.boolean(),
    ntpDate: Joi.date().iso().allow(null, '').optional(),
    remark: Joi.string().max(1000)
  }).min(1), // At least one field must be present
};

export const remarkSchema = Joi.object({
  text: Joi.string().min(1).max(1000).required(),
  timestamp: Joi.date().iso().optional(),
  from: Joi.string().max(100).optional(),
  to: Joi.string().max(100).optional(),
  from_date: Joi.date().iso().optional(),
  to_date: Joi.date().iso().optional(),
  status: Joi.string().max(1000).optional(),
  days_delay_deped: Joi.number().integer().min(0).optional(),
  days_delay_publisher: Joi.number().integer().min(0).optional(),
});

export const querySchemas = {
  books: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(1000).default(10),
    sortBy: Joi.string().valid(
      'book_code', 'bookCode', 'learning_area', 'learningArea',
      'grade_level', 'gradeLevel', 'publisher',
      'title', 'status', 'created_at', 'createdAt', 'updated_at', 'updatedAt'
    ).default('created_at'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    search: Joi.string().max(500).optional(),
    status: Joi.alternatives().try(
      Joi.string(),
      Joi.array().items(Joi.string())
    ).optional(),
    learningArea: Joi.alternatives().try(
      Joi.string(),
      Joi.array().items(Joi.string())
    ).optional(),
    gradeLevel: Joi.alternatives().try(
      Joi.number().integer().min(1).max(12),
      Joi.array().items(Joi.number().integer().min(1).max(12))
    ).optional(),
    publisher: Joi.alternatives().try(
      Joi.string(),
      Joi.array().items(Joi.string())
    ).optional(),
    hasRemarks: Joi.boolean().optional(),
    adminView: Joi.boolean().optional()
  })
};

// Validation middleware factory
export const validate = (schema: Joi.ObjectSchema, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      console.error('❌ Validation Error:', {
        property,
        data: req[property],
        errors: details
      });

      return next(new ValidationError('Validation failed', details));
    }

    // Replace req[property] with validated and sanitized data
    req[property] = value;
    next();
  };
};

// Common validation middlewares
export const validateCreateBook = validate(bookSchemas.create);
export const validateUpdateBook = validate(bookSchemas.update);
export const validateRemark = validate(remarkSchema);
export const validateBooksQuery = validate(querySchemas.books, 'query');