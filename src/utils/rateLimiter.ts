/**
 * Client-Side Rate Limiter
 * 
 * Prevents abuse by limiting action frequency.
 * Note: This is NOT a replacement for server-side rate limiting,
 * but provides immediate UX feedback and reduces server load.
 */

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
}

interface AttemptRecord {
  count: number;
  firstAttempt: number;
  blockedUntil?: number;
}

class RateLimiter {
  private storage: Map<string, AttemptRecord> = new Map();

  /**
   * Check if action is allowed
   * @param key - Unique identifier for the action (e.g., 'login', 'booking')
   * @param config - Rate limit configuration
   * @returns true if allowed, false if rate limited
   */
  check(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const record = this.storage.get(key);

    // Check if currently blocked
    if (record?.blockedUntil && now < record.blockedUntil) {
      return false;
    }

    // No previous attempts or window expired
    if (!record || now - record.firstAttempt > config.windowMs) {
      this.storage.set(key, {
        count: 1,
        firstAttempt: now,
      });
      return true;
    }

    // Within window, check count
    if (record.count < config.maxAttempts) {
      record.count++;
      return true;
    }

    // Rate limit exceeded
    if (config.blockDurationMs) {
      record.blockedUntil = now + config.blockDurationMs;
    }
    return false;
  }

  /**
   * Get remaining time until unblocked (in seconds)
   */
  getBlockedTimeRemaining(key: string): number {
    const record = this.storage.get(key);
    if (!record?.blockedUntil) return 0;
    
    const remaining = Math.max(0, record.blockedUntil - Date.now());
    return Math.ceil(remaining / 1000);
  }

  /**
   * Reset rate limit for a key (e.g., after successful action)
   */
  reset(key: string): void {
    this.storage.delete(key);
  }

  /**
   * Clear all rate limits (for testing)
   */
  clearAll(): void {
    this.storage.clear();
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

// Predefined configurations
export const RATE_LIMITS = {
  LOGIN: {
    maxAttempts: 5,
    windowMs: 5 * 60 * 1000, // 5 minutes
    blockDurationMs: 15 * 60 * 1000, // 15 minutes
  },
  BOOKING: {
    maxAttempts: 3,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 5 * 60 * 1000, // 5 minutes
  },
  SERVICE_CREATION: {
    maxAttempts: 10,
    windowMs: 60 * 1000, // 1 minute
  },
} as const;

/**
 * Usage Example:
 * 
 * const handleLogin = async () => {
 *   if (!rateLimiter.check('login', RATE_LIMITS.LOGIN)) {
 *     const remaining = rateLimiter.getBlockedTimeRemaining('login');
 *     alert(`Too many attempts. Try again in ${remaining} seconds.`);
 *     return;
 *   }
 *   
 *   const result = await supabase.auth.signIn(...);
 *   
 *   if (result.error) {
 *     // Failed login, rate limit still applies
 *   } else {
 *     // Success! Reset rate limit
 *     rateLimiter.reset('login');
 *   }
 * };
 */
