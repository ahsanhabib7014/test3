import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    PUSHER_APP_ID: process.env.PUSHER_APP_ID || '❌ MISSING',
    PUSHER_KEY: process.env.PUSHER_KEY ? '✅ Set (length: ' + process.env.PUSHER_KEY.length + ')' : '❌ MISSING',
    PUSHER_SECRET: process.env.PUSHER_SECRET ? '✅ Set (length: ' + process.env.PUSHER_SECRET.length + ')' : '❌ MISSING',
    PUSHER_CLUSTER: process.env.PUSHER_CLUSTER || '❌ MISSING',
    NEXT_PUBLIC_PUSHER_KEY: process.env.NEXT_PUBLIC_PUSHER_KEY ? '✅ Set' : '❌ MISSING',
    NEXT_PUBLIC_PUSHER_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || '❌ MISSING',
    MONGODB_URI: process.env.MONGODB_URI ? '✅ Set' : '❌ MISSING',
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ? '✅ Set' : '❌ MISSING',
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN ? '✅ Set' : '❌ MISSING',
    NODE_ENV: process.env.NODE_ENV,
    CWD: process.cwd(),
  });
}