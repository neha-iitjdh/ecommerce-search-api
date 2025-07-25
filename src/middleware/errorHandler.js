/**
 * Global Error Handler Middleware
 * Catches all errors and sends appropriate responses
 */

/**
 * Error handler middleware
 * @param {Error} err - The error object
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  // Log the error for debugging
  console.error('Error occurred:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  // Default error status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle specific error types

  // 1. Sequelize (PostgreSQL) errors
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Validation error';
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    return res.status(statusCode).json({
      success: false,
      message,
      errors
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Resource already exists';
  }

  if (err.name === 'SequelizeDatabaseError') {
    statusCode = 500;
    message = 'Database error';
  }

  // 2. Elasticsearch errors
  if (err.name === 'ResponseError') {
    statusCode = 500;
    message = 'Elasticsearch error';
  }

  // 3. Validation errors (express-validator)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
  }

  // 4. JWT errors (if we add authentication later)
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // 5. Cast errors (invalid ID format)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Build error response
  const errorResponse = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      error: {
        name: err.name,
        stack: err.stack
      }
    })
  };

  // Send response
  res.status(statusCode).json(errorResponse);
};

/**
 * Custom error class for API errors
 * Usage: throw new ApiError('Product not found', 404);
 */
class ApiError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors automatically
 * Usage: asyncHandler(async (req, res) => { ... })
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = errorHandler;
module.exports.ApiError = ApiError;
module.exports.asyncHandler = asyncHandler;