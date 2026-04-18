'use strict';

const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
    // Log the error details for debugging
    logger.error(err);

    // Send a user-friendly error message
    const statusCode = err.status || 500;
    const errorMessage = statusCode === 500 ? 'An unexpected error occurred. Please try again later.' : err.message;

    res.status(statusCode).json({
        success: false,
        message: errorMessage,
    });
};
