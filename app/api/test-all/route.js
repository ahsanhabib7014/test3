import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { redis } from '@/lib/redis';
import { pusher } from '@/lib/pusher';

export async function GET() {
  const result = {
    mongodb: '❌',
    redis: '❌',
    pusher: '❌',
  };

  // Test MongoDB
  try {
    await connectDB();
    result.mongodb = '✅ Connected';
  } catch (err) {
    result.mongodb = `❌ ${err.message}`;
  }

  // Test Redis
  try {
    await redis.set('test', 'hello');
    const val = await redis.get('test');
    result.redis = val === 'hello' ? '✅ Working' : '❌ Failed';
  } catch (err) {
    result.redis = `❌ ${err.message}`;
  }

  // Test Pusher
  try {
    await pusher.trigger('test-channel', 'test-event', { message: 'test' });
    result.pusher = '✅ Working';
  } catch (err) {
    result.pusher = `❌ ${err.message}`;
  }

  return NextResponse.json(result);
}