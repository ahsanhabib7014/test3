import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { redis } from '@/lib/redis';
import { pusherServer } from '@/lib/pusher';

export async function POST(request) {
  try {
    const { docId } = await request.json();

    if (!docId) {
      return NextResponse.json({ success: false, error: 'Document ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('your_database_name');
    const collection = db.collection('your_collection_name');

    // 1. MongoDB Atomic Increment ($inc)
    const result = await collection.findOneAndUpdate(
      { _id: docId },
      { $inc: { views: 1 } },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
    }

    const updatedViews = result.views;
    const cacheKey = `doc:${docId}:views`;

    // 2. Upstash Redis ক্যাশ তাৎক্ষণিকভাবে আপডেট করুন
    await redis.set(cacheKey, updatedViews, { ex: 3600 });

    // 3. Pusher দিয়ে বাকি ক্লায়েন্টদের লাইভ আপডেট ব্রডকাস্ট করুন
    await pusherServer.trigger('live-channel', 'view-update', {
      docId,
      views: updatedViews,
    });

    return NextResponse.json({ success: true, views: updatedViews });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}