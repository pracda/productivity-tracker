'use strict';

module.exports = (app) => {
    // Security-related response headers
    app.use((req, res, next) => {
        res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data: https:; connect-src 'self' https:;");
        res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-XSS-Protection', '0');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('Referrer-Policy', 'no-referrer');
        res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        next();
    });
};
