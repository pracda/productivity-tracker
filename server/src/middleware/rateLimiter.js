'use strict';

const createMemoryRateLimiter = ({
  windowMs = 15 * 60 * 1000,
  max = 20,
  message = 'Too many requests from this IP, please try again after 15 minutes',
} = {}) => {
  const ipHits = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const now = Date.now();
    const existing = ipHits.get(ip);

    if (!existing || now > existing.resetAt) {
      ipHits.set(ip, {
        count: 1,
        resetAt: now + windowMs,
      });
      return next();
    }

    if (existing.count >= max) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((existing.resetAt - now) / 1000)
      );

      res.setHeader('Retry-After', retryAfterSeconds.toString());
      return res.status(429).json({ message });
    }

    existing.count += 1;
    return next();
  };
};

const authLimiter = createMemoryRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
});

module.exports = authLimiter;
