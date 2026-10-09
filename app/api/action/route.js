import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { redis } from '@/lib/redis';
import { pusherServer } from '@/lib/pusher';

export async function POST(request) {
  try {
    const { docId } = await request.json();

    // 1. MongoDB Atomic Increment ($inc)
    const client = await clientPromise;
    const db = client.db('your_database_name');
    const collection = db.collection('your_collection_name');

    const result = await collection.findOneAndUpdate(
      { _id: docId },
      { $inc: { views: 1 } },
      { returnDocument: 'after' }
    );

    const updatedCount = result.views;

    // 2. Upstash Redis Cache Update
    await redis.set(`doc:${docId}:views`, updatedCount);

    // 3. Pusher Live UI Broadcast
    await pusherServer.trigger('live-channel', 'view-update', {
      docId,
      views: updatedCount,
    });

    return NextResponse.json({ success: true, views: updatedCount });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}