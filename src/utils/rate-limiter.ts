/**
 * Simple rate limiter implementation
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private windowMs: number;

  constructor(windowMs: number = 60 * 1000) {
    // 1 minute default
    this.windowMs = windowMs;
  }

  check(
    key: string,
    maxRequests: number
  ): { allowed: boolean; resetTime: number; remaining: number } {
    const now = Date.now();
    const record = this.store[key];

    if (!record || now > record.resetTime) {
      // New window or expired window
      this.store[key] = {
        count: 1,
        resetTime: now + this.windowMs,
      };
      return {
        allowed: true,
        resetTime: now + this.windowMs,
        remaining: maxRequests - 1,
      };
    }

    // Check if limit exceeded
    if (record.count >= maxRequests) {
      return {
        allowed: false,
        resetTime: record.resetTime,
        remaining: 0,
      };
    }

    // Increment count
    this.store[key]!.count++; // Non-null assertion: we know key exists in store
    return {
      allowed: true,
      resetTime: record.resetTime,
      remaining: maxRequests - this.store[key]!.count,
    };
  }

  reset(key: string): void {
    delete this.store[key];
  }
}

// Default rate limiter instance
export const defaultLimiter = new RateLimiter(60 * 1000); // 1-minute window

// Specific limiters for different endpoints
export const apiLimiter = new RateLimiter(60 * 1000); // 1 minute
export const rankingLimiter = new RateLimiter(60 * 1000); // 1 minute for rankings
