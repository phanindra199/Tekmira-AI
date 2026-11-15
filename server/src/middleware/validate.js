import { AppError } from '../utils/AppError.js';

/**
 * Reusable Zod Request Validation Middleware
 * 
 * Validates incoming request payloads against a specified Zod schema.
 * Supports validating 'body', 'query', or 'params'.
 * 
 * On validation failure, extracts field paths and issues standardized HTTP 400 Bad Request.
 * 
 * @param {import('zod').ZodSchema} schema - Zod validation schema
 * @param {'body' | 'query' | 'params'} [source='body'] - Request property to validate
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const dataToValidate = req[source];
      const parsedData = schema.parse(dataToValidate);
      
      // Replace with sanitized/transformed data from Zod
      req[source] = parsedData;
      next();
    } catch (error) {
      if (error.name === 'ZodError' || error.issues) {
        const issues = error.issues || error.errors || [];
        const formattedErrors = issues.map(err => ({
          field: (err.path || []).join('.'),
          message: err.message
        }));

        const appError = new AppError('Validation failed for request data', 400);
        appError.errors = formattedErrors;
        return next(appError);
      }

      next(error);
    }
  };
};

export default validate;
