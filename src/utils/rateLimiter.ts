// Chroni przed spamem logowaniem/rezerwacjami
// Uwaga: to tylko frontend, zawsze potrzeba limitu na serwerze!

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

  // Sprawdź czy akcja jest dozwolona
  check(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const record = this.storage.get(key);

    if (record?.blockedUntil && now < record.blockedUntil) {
      return false;
    }

    if (!record || now - record.firstAttempt > config.windowMs) {
      this.storage.set(key, {
        count: 1,
        firstAttempt: now,
      });
      return true;
    }

    if (record.count < config.maxAttempts) {
      record.count++;
      return true;
    }
    if (config.blockDurationMs) {
      record.blockedUntil = now + config.blockDurationMs;
    }
    return false;
  }

  // Ile sekund do odblokowania
  getBlockedTimeRemaining(key: string): number {
    const record = this.storage.get(key);
    if (!record?.blockedUntil) return 0;
    
    const remaining = Math.max(0, record.blockedUntil - Date.now());
    return Math.ceil(remaining / 1000);
  }

  // Resetuj limit (np. po udanym logowaniu)
  reset(key: string): void {
    this.storage.delete(key);
  }

  // Wyczyść wszystko (do testów)
  clearAll(): void {
    this.storage.clear();
  }
}

export const rateLimiter = new RateLimiter();

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
