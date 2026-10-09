import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import Withdraw from '@/models/Withdraw';
import User from '@/models/User';
import { verifyAuth } from '@/utils/authCheck';

export async function POST(request) {
  try {
    await clientPromise;

    // ১. সেন্ট্রালাইজড হাই-সিকিউরিটি অ্যাডমিন অথেন্টিকেশন চেক
    const auth = await verifyAuth('admin');
    if (!auth.success) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }

    const adminUser = auth.user;

    const { withdrawId, action } = await request.json(); // action: 'approve' অথবা 'reject'

    if (!withdrawId || !action) {
      return NextResponse.json({ success: false, message: 'প্রয়োজনীয় তথ্য পাওয়া যায়নি।' }, { status: 400 });
    }

    const withdraw = await Withdraw.findById(withdrawId);
    if (!withdraw) {
      return NextResponse.json({ success: false, message: 'উইথড্র রিকোয়েস্ট খুঁজে পাওয়া যায়নি।' }, { status: 404 });
    }

    if (withdraw.status !== 'pending') {
      return NextResponse.json({ success: false, message: 'এই রিকোয়েস্টটি ইতিমধ্যে প্রসেস করা হয়েছে।' }, { status: 400 });
    }

    // ৩. যদি অ্যাডমিন অ্যাপ্রুভ করেন
    if (action === 'approve') {
      withdraw.status = 'approved';
      await withdraw.save();
      return NextResponse.json({ success: true, message: 'উইথড্র রিকোয়েস্ট সফলভাবে অ্যাপ্রুভ করা হয়েছে।' }, { status: 200 });
    } 
    
    // ৪. যদি অ্যাডমিন রিজেক্ট করেন (রিফান্ড লজিক)
    else if (action === 'reject') {
      withdraw.status = 'rejected';
      await withdraw.save();

      // যদি ওয়ালেট টাইপ রেফারেল হয়, তবে রেফারেল ব্যালেন্স রিফান্ড হবে
      if (withdraw.walletType === 'referral') {
        await User.findOneAndUpdate(
          { uid: withdraw.uid },
          { $inc: { referralBalance: withdraw.amount } }
        );
      } else {
        // সাধারণ ওয়ালেট উইথড্র হলে মেইন ব্যালেন্স রিফান্ড হবে
        await User.findOneAndUpdate(
          { uid: withdraw.uid },
          { $inc: { balance: withdraw.amount } }
        );
      }

      return NextResponse.json({ success: true, message: 'উইথড্র রিকোয়েস্ট রিজেক্ট করা হয়েছে এবং ব্যালেন্স রিফান্ড করা হয়েছে।' }, { status: 200 });
    }

    return NextResponse.json({ success: false, message: 'সঠিক অ্যাকশন নির্বাচন করা হয়নি।' }, { status: 400 });
  } catch (error) {
    console.error('Admin Withdraw Action Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}