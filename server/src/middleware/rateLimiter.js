/**
 * Tekmira AI — Lightweight Enterprise Rate Limiter Middleware (Day 20)
 * 
 * Protects authentication endpoints from credential-stuffing/brute-force attacks
 * and protects Gemini AI endpoints from quota exhaustion.
 * 
 * Implements sliding-window counter algorithm with zero external dependencies.
 */

import { AppError } from '../utils/AppError.js';

export const createRateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000; // Default: 15 minutes
  const max = options.max || 100; // Default: 100 requests per window
  const message = options.message || 'Too many requests from this IP address. Please try again later.';
  
  // In-memory store: Map<ip, { count: number, resetTime: number }>
  const hits = new Map();

  // Periodic cleanup every 5 minutes to avoid memory leaks
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of hits.entries()) {
      if (now > record.resetTime) {
        hits.delete(ip);
      }
    }
  }, 5 * 60 * 1000);

  // Unref cleanup interval so it does not prevent process exit
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req, res, next) => {
    // In test environment, skip rate limiting unless specifically requested via test header
    if (process.env.NODE_ENV === 'test' && !req.headers['x-test-rate-limit']) {
      return next();
    }

    // Determine client IP
    const clientIp = 
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
      req.socket?.remoteAddress || 
      req.ip || 
      '127.0.0.1';

    const now = Date.now();
    const record = hits.get(clientIp);

    if (!record || now > record.resetTime) {
      hits.set(clientIp, {
        count: 1,
        resetTime: now + windowMs
      });
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', max - 1);
      return next();
    }

    record.count += 1;
    const remaining = Math.max(0, max - record.count);
    const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', remaining);

    if (record.count > max) {
      res.setHeader('Retry-After', retryAfterSeconds);
      const error = new AppError(message, 429);
      error.retryAfter = retryAfterSeconds;
      return next(error);
    }

    next();
  };
};

// Standard presets
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 15, // 15 attempts per 15 min per IP
  message: 'Too many authentication attempts. Please wait 15 minutes before trying again.'
});

export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 120, // 120 requests per minute per IP
  message: 'API rate limit exceeded. Please throttle your requests.'
});

export default {
  createRateLimiter,
  authRateLimiter,
  apiRateLimiter
};
