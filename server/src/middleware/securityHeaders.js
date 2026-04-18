'use strict';

const helmet = require('helmet');

module.exports = (app) => {
    // Set security headers
    app.use(helmet()); // Default Helmet configuration

    // Additional custom security headers
    app.use((req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('Referrer-Policy', 'no-referrer');
        next();
    });
};
