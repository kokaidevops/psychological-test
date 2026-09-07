const logger = require('../utils/logger');

function notFound(req, res, _next) {
  return res.status(404).json({ success: false, message: 'Route not found' });
}

function errorHandler(err, req, res, _next) {
  logger.error('Unhandled error:', err.message);
  if (process.env.NODE_ENV === 'development') logger.error(err.stack);
  return res.status(500).json({ success: false, message: 'Internal Server Error' });
}

module.exports = { notFound, errorHandler };