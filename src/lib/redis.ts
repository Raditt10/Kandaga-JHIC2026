import Redis from "ioredis";

// Global cache fallback in memory (LRU / TTL) when Redis instance is unreachable
interface CacheEntry<T> {
  value: T;
  expiresAt: number | null;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();

// Periodic cleanup of expired memory cache entries every 60 seconds
if (typeof setInterval !== "undefined") {
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memoryCache.entries()) {
      if (entry.expiresAt && entry.expiresAt <= now) {
        memoryCache.delete(key);
      }
    }
  }, 60000);
  if (cleanupTimer.unref) cleanupTimer.unref();
}

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

let redisInstance: Redis | null = null;
let isRedisAvailable = false;
let hasLoggedRedisError = false;

function getRedisClient(): Redis | null {
  if (typeof window !== "undefined") {
    // Client-side execution should never use direct Redis connections
    return null;
  }

  if (redisInstance) {
    return redisInstance;
  }

  try {
    const client = new Redis(REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      enableOfflineQueue: false,
      retryStrategy(times) {
        // Continuous exponential backoff capped at 3s so Redis can reconnect when started
        return Math.min(times * 200, 3000);
      },
    });

    client.on("connect", () => {
      isRedisAvailable = true;
      hasLoggedRedisError = false;
      console.log(`[Redis] Connected successfully to ${REDIS_URL.replace(/:[^:@]*@/, ":***@")}`);
    });

    client.on("ready", () => {
      isRedisAvailable = true;
    });

    client.on("error", (err) => {
      isRedisAvailable = false;
      if (!hasLoggedRedisError) {
        console.warn(`[Redis] Connection warning (${REDIS_URL}): ${err.message}. Using in-memory fallback cache.`);
        hasLoggedRedisError = true;
      }
    });

    client.on("close", () => {
      isRedisAvailable = false;
    });

    // Attempt initial connect asynchronously
    client.connect().catch(() => {
      isRedisAvailable = false;
      if (!hasLoggedRedisError) {
        console.warn(`[Redis] Server not reachable at ${REDIS_URL}. Using in-memory fallback cache.`);
        hasLoggedRedisError = true;
      }
    });

    redisInstance = client;
    return redisInstance;
  } catch (err) {
    if (!hasLoggedRedisError) {
      console.warn(`[Redis] Initialization failed: ${(err as Error)?.message}. Using in-memory fallback cache.`);
      hasLoggedRedisError = true;
    }
    return null;
  }
}

export const redis = getRedisClient();

export function isRedisConnected(): boolean {
  return isRedisAvailable && redisInstance?.status === "ready";
}

/**
 * Get cached JSON/data from Redis with in-memory fallback.
 */
export async function getCache<T>(key: string): Promise<T | null> {
  const client = getRedisClient();

  if (client && isRedisAvailable) {
    try {
      const data = await client.get(key);
      if (data) {
        return JSON.parse(data) as T;
      }
      return null;
    } catch {
      // Fall through to memoryCache on Redis query error
    }
  }

  // Memory fallback
  const entry = memoryCache.get(key);
  if (entry) {
    if (entry.expiresAt && entry.expiresAt <= Date.now()) {
      memoryCache.delete(key);
      return null;
    }
    return entry.value as T;
  }

  return null;
}

/**
 * Set cached JSON/data to Redis with in-memory fallback.
 * @param key Cache key
 * @param value Data to cache
 * @param ttlSeconds TTL in seconds (default: 300)
 */
export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds = 300
): Promise<void> {
  const client = getRedisClient();

  // Always update memory fallback for immediate local consistency
  memoryCache.set(key, {
    value,
    expiresAt: ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null,
  });

  if (client && isRedisAvailable) {
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds > 0) {
        await client.set(key, serialized, "EX", ttlSeconds);
      } else {
        await client.set(key, serialized);
      }
    } catch {
      // Memory cache is already updated
    }
  }
}

/**
 * Delete a specific key from Redis and memory cache.
 */
export async function deleteCache(key: string): Promise<void> {
  memoryCache.delete(key);

  const client = getRedisClient();
  if (client && isRedisAvailable) {
    try {
      await client.del(key);
    } catch {
      // Ignore
    }
  }
}

/**
 * Invalidate multiple keys by pattern (e.g. "gallery:*" or "student:*").
 */
export async function invalidateByPattern(pattern: string): Promise<void> {
  // Clear memory cache matching pattern
  const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
  for (const k of Array.from(memoryCache.keys())) {
    if (regex.test(k)) {
      memoryCache.delete(k);
    }
  }

  const client = getRedisClient();
  if (client && isRedisAvailable) {
    try {
      const keysToDelete: string[] = [];
      const stream = client.scanStream({
        match: pattern,
        count: 100,
      });

      await new Promise<void>((resolve, reject) => {
        stream.on("data", (resultKeys: string[]) => {
          for (const k of resultKeys) {
            keysToDelete.push(k);
          }
        });
        stream.on("end", () => resolve());
        stream.on("error", (err) => reject(err));
      });

      if (keysToDelete.length > 0) {
        for (let i = 0; i < keysToDelete.length; i += 500) {
          await client.del(...keysToDelete.slice(i, i + 500));
        }
      }
    } catch {
      // Ignore
    }
  }
}

/**
 * Invalidate all gallery and student profile caches.
 * Call this when a project is created, approved, edited, or deleted.
 */
export async function invalidateGalleryCache(): Promise<void> {
  await Promise.all([
    invalidateByPattern("gallery:*"),
    invalidateByPattern("student:*"),
    invalidateByPattern("cache:media:*"),
  ]);
}

/**
 * Binary buffer caching in Redis (for images and media files).
 * Stored as base64 string or raw string with content-type metadata.
 */
interface CachedFileRecord {
  data: string; // base64 encoded
  contentType: string;
}

export async function getFileCache(
  key: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const cached = await getCache<CachedFileRecord>(key);
  if (!cached || !cached.data) return null;
  try {
    return {
      buffer: Buffer.from(cached.data, "base64"),
      contentType: cached.contentType || "application/octet-stream",
    };
  } catch {
    return null;
  }
}

export async function setFileCache(
  key: string,
  buffer: Buffer,
  contentType: string,
  ttlSeconds = 86400 // Default 24 hours
): Promise<void> {
  const record: CachedFileRecord = {
    data: buffer.toString("base64"),
    contentType,
  };
  await setCache(key, record, ttlSeconds);
}
