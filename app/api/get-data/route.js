import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { redis } from '@/lib/redis';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const docId = searchParams.get('docId');

    if (!docId) {
      return NextResponse.json({ success: false, error: 'Document ID is required' }, { status: 400 });
    }

    const cacheKey = `doc:${docId}:views`;

    // 1. প্রথমে Upstash Redis ক্যাশ চেক করুন
    const cachedViews = await redis.get(cacheKey);

    if (cachedViews !== null) {
      // Cache Hit: ক্যাশ থেকে ইনস্ট্যান্ট ডেটা রিটার্ন
      return NextResponse.json({ 
        success: true, 
        views: Number(cachedViews), 
        source: 'cache (Upstash)' 
      });
    }

    // 2. Cache Miss: ক্যাশে না থাকলে MongoDB থেকে ডাটা আনুন
    const client = await clientPromise;
    const db = client.db('your_database_name');
    const collection = db.collection('your_collection_name');

    const document = await collection.findOne({ _id: docId });

    if (!document) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
    }

    const currentViews = document.views || 0;

    // 3. ভবিষ্যতের জন্য Upstash Redis-এ ক্যাশ সেভ করে রাখুন (যেমন: ১ ঘণ্টা বা ৬০ সেকেন্ডের TTL দিতে পারেন)
    await redis.set(cacheKey, currentViews, { ex: 3600 }); // ৩৬০০ সেকেন্ড = ১ ঘণ্টা

    return NextResponse.json({ 
      success: true, 
      views: currentViews, 
      source: 'database (MongoDB)' 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}