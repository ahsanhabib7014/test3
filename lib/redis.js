import { Redis } from '@upstash/redis';

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('❌ Upstash Redis env variables missing!');
}

export const redis = Redis.fromEnv();