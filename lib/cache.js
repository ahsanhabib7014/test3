import { redis } from './redis';

/**
 * Cache wrapper — DB call-এর আগে cache check করে
 */
export async function getCached(key, ttl = 300, fetchFn) {
  try {
    const cached = await redis.get(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }

    const data = await fetchFn();

    if (data !== null && data !== undefined) {
      await redis.set(key, data, { ex: ttl });
    }

    return data;
  } catch (err) {
    console.error('Redis cache error:', err);
    return await fetchFn(); // fallback
  }
}

export async function invalidateCache(...keys) {
  if (keys.length === 0) return;
  try {
    await redis.del(...keys);
  } catch (err) {
    console.error('Cache invalidate error:', err);
  }
}

export async function invalidatePattern(pattern) {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    console.error('Cache pattern delete error:', err);
  }
}