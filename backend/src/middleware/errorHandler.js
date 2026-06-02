const { sendError } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Error:', err);

  // Sequelize Unique Constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = err.errors.map(e => `${e.path} already exists.`).join(', ');
    return sendError(res, `Conflict: ${message}`, 409);
  }

  // Sequelize Validation error
  if (err.name === 'SequelizeValidationError') {
    const message = err.errors.map(e => e.message).join(', ');
    return sendError(res, `Validation error: ${message}`, 400);
  }

  // Rate limit error
  if (err.status === 429 || err.statusCode === 429) {
    return sendError(res, 'Too many requests from this IP, please try again after 15 minutes.', 429);
  }

  const message = err.message || 'An internal server error occurred';
  return sendError(res, message, err.statusCode || 500);
};

module.exports = errorHandler;
