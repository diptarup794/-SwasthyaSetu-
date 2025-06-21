const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    user: req.user?.id,
    timestamp: new Date().toISOString()
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // OpenAI API errors
  if (err.code === 'openai_api_error') {
    const message = 'AI service temporarily unavailable';
    error = { message, statusCode: 503 };
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field';
    error = { message, statusCode: 400 };
  }

  // Rate limiting errors
  if (err.status === 429) {
    const message = 'Too many requests, please try again later';
    error = { message, statusCode: 429 };
  }

  // Network errors
  if (err.code === 'ECONNREFUSED') {
    const message = 'Service temporarily unavailable';
    error = { message, statusCode: 503 };
  }

  // Default error
  const statusCode = error.statusCode || err.statusCode || 500;
  const message = error.message || 'Server Error';

  // Health check endpoint should always return 200
  if (req.path === '/health') {
    return res.status(200).json({
      status: 'unhealthy',
      error: message,
      timestamp: new Date().toISOString()
    });
  }

  // API error response
  if (req.path.startsWith('/api/')) {
    return res.status(statusCode).json({
      success: false,
      error: message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Web page error response
  return res.status(statusCode).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  });
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Not found handler
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Validation error handler
const validationError = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }
  next(err);
};

// Security error handler
const securityError = (err, req, res, next) => {
  if (err.code === 'SECURITY_VIOLATION') {
    return res.status(403).json({
      success: false,
      error: 'Security violation detected',
      timestamp: new Date().toISOString()
    });
  }
  next(err);
};

// Database error handler
const databaseError = (err, req, res, next) => {
  if (err.name === 'MongoError' || err.name === 'MongooseError') {
    console.error('Database error:', err);
    
    return res.status(503).json({
      success: false,
      error: 'Database service temporarily unavailable',
      timestamp: new Date().toISOString()
    });
  }
  next(err);
};

// AI service error handler
const aiServiceError = (err, req, res, next) => {
  if (err.code === 'AI_SERVICE_ERROR' || err.message?.includes('OpenAI')) {
    console.error('AI service error:', err);
    
    return res.status(503).json({
      success: false,
      error: 'AI service temporarily unavailable',
      timestamp: new Date().toISOString()
    });
  }
  next(err);
};

// Health monitoring error handler
const healthError = (err, req, res, next) => {
  if (err.code === 'HEALTH_MONITORING_ERROR') {
    console.error('Health monitoring error:', err);
    
    return res.status(503).json({
      success: false,
      error: 'Health monitoring service unavailable',
      timestamp: new Date().toISOString()
    });
  }
  next(err);
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFound,
  validationError,
  securityError,
  databaseError,
  aiServiceError,
  healthError
}; 