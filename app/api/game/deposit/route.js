import { NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import Deposit from '@/models/Deposit';
import { verifyAuth } from '@/utils/authCheck';

// ============ DEPOSIT RATE LIMIT ============
const depositRateMap = new Map();

// প্রতি IP থেকে সর্বোচ্চ ১০টি ডিপোজিট / ঘন্টা
const DEPOSIT_WINDOW_MS = 60 * 60 * 1000; // ১ ঘন্টা
const DEPOSIT_MAX = 10;

function getClientIp(req) {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') || '127.0.0.1';
}

function cleanupDepositMap() {
  const now = Date.now();
  for (const [ip, data] of depositRateMap.entries()) {
    if (now > data.resetTime) depositRateMap.delete(ip);
  }
}
// =============================================

export async function POST(req) {
  try {
    await dbConnect();

    // ============ RATE LIMIT CHECK ============
    const clientIp = getClientIp(req);
    const now = Date.now();

    if (depositRateMap.size > 500) cleanupDepositMap();

    const limitData = depositRateMap.get(clientIp);

    if (!limitData || now > limitData.resetTime) {
      depositRateMap.set(clientIp, { count: 1, resetTime: now + DEPOSIT_WINDOW_MS });
    } else {
      if (limitData.count >= DEPOSIT_MAX) {
        const remainingMin = Math.ceil((limitData.resetTime - now) / 60000);
        return NextResponse.json(
          { 
            success: false, 
            message: `একটি IP থেকে অনেকবার ডিপোজিট রিকোয়েস্ট করা হয়েছে! ${remainingMin} মিনিট পর আবার চেষ্টা করুন।` 
          }, 
          { status: 429 }
        );
      }
      limitData.count++;
    }
    // ==========================================

    // ১. সেন্ট্রালাইজড HttpOnly কুকি ও ডাটাবেজ ভেরিফিকেশন
    const auth = await verifyAuth('user');
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.message }, 
        { 
          status: auth.status,
          headers: {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY'
          }
        }
      );
    }

    const user = auth.user;

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ success: false, message: 'অবৈধ বা খালি ডেটা পাঠানো হয়েছে!' }, { status: 400 });
    }

    // accountNumber অথবা senderNumber যেকোনো একটি পেলেই তা গ্রহণ করবে
    let { amount, method, senderNumber, accountNumber, transactionId } = body || {};
    const finalSenderNumber = senderNumber || accountNumber;

    // ২. সব প্রয়োজনীয় ফিল্ডের উপস্থিতি নিশ্চিত করা
    if (!amount || !method || !finalSenderNumber || !transactionId) {
      return NextResponse.json({ success: false, message: 'অসম্পূর্ণ বা অবৈধ ডেটা রিকোয়েস্ট!' }, { status: 400 });
    }

    // ৩. অ্যামাউন্ট স্যানিটাইজেশন ও ভ্যালিডেশন
    const cleanAmount = Number(amount);
    if (isNaN(cleanAmount) || cleanAmount <= 0 || !Number.isInteger(cleanAmount)) {
      return NextResponse.json({ success: false, message: 'অবৈধ টাকার পরিমাণ প্রদান করা হয়েছে!' }, { status: 400 });
    }

    if (cleanAmount < 500) { 
      return NextResponse.json({ success: false, message: 'সর্বনিম্ন ডিপোজিট ৫০০ টাকা হতে হবে!' }, { status: 400 });
    }

    // ৪. সেন্ডার নম্বর স্যানিটাইজেশন (১১ সংখ্যার ডিজিট চেক)
    const cleanSenderNumber = String(finalSenderNumber).trim();
    if (!/^\d{11}$/.test(cleanSenderNumber)) {
      return NextResponse.json({ success: false, message: 'প্রদানকৃত নম্বরটি সঠিক ১১ সংখ্যার হতে হবে!' }, { status: 400 });
    }

    // ৫. ট্রানজেকশন আইডি স্যানিটাইজেশন
    const cleanTrxId = String(transactionId).trim().toUpperCase();
    if (!/^[A-Z0-9]{5,30}$/.test(cleanTrxId)) {
      return NextResponse.json({ success: false, message: 'ট্রানজেকশন আইডি ফরম্যাট সঠিক নয়!' }, { status: 400 });
    }

    // ৬. ডুপ্লিকেট ট্রানজেকশন আইডি চেক
    const existingDeposit = await Deposit.findOne({ transactionId: cleanTrxId });
    if (existingDeposit) {
      return NextResponse.json({ success: false, message: 'এই ট্রানজেকশন আইডি ইতিপূর্বেই ব্যবহার করা হয়েছে!' }, { status: 400 });
    }

    // ৭. ডাটাবেজে সুরক্ষিতভাবে ডিপোজিট রিকোয়েস্ট সেভ করা
    await Deposit.create({
      uid: user.uid,
      amount: cleanAmount,
      method: String(method).trim(),
      senderNumber: cleanSenderNumber,
      transactionId: cleanTrxId,
      status: 'pending'
    });

    return NextResponse.json(
      { success: true, message: 'ডিপোজিট রিকোয়েস্ট সফলভাবে জমা হয়েছে!' },
      {
        status: 200,
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        }
      }
    );

  } catch (error) {
    console.error('Secure Deposit API Error:', error);
    return NextResponse.json({ success: false, message: 'সার্ভারে অভ্যন্তরীণ ত্রুটি ঘটেছে!' }, { status: 500 });
  }
}