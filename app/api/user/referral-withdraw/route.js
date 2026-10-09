// // // import { NextResponse } from 'next/server';
// // // import clientPromise from '@/lib/mongodb';
// // // import User from '@/models/User';
// // // import Withdraw from '@/models/Withdraw';
// // // import PaymentSetting from '@/models/PaymentSetting';
// // // import bcrypt from 'bcryptjs';
// // // import { verifyAuth } from '@/utils/authCheck';

// // // export async function POST(request) {
// // //   try {
// // //     await clientPromise;

// // //     // ১. HttpOnly কুকি ও ডাটাবেজ ভেরিফিকেশন
// // //     const auth = await verifyAuth('user');
// // //     if (!auth.success) {
// // //       return NextResponse.json(
// // //         { success: false, message: auth.message }, 
// // //         { 
// // //           status: auth.status,
// // //           headers: {
// // //             'X-Content-Type-Options': 'nosniff',
// // //             'X-Frame-Options': 'DENY'
// // //           }
// // //         }
// // //       );
// // //     }

// // //     let body;
// // //     try {
// // //       body = await request.json();
// // //     } catch (e) {
// // //       return NextResponse.json({ success: false, message: 'অবৈধ বা খালি ডেটা পাঠানো হয়েছে!' }, { status: 400 });
// // //     }

// // //     // ✅ FIX: method-এর original case রাখা হচ্ছে (Rocket, TRX, Binance Pay)
// // //     const method = typeof body.method === 'string' ? body.method.trim() : '';
// // //     const accountNumber = typeof body.accountNumber === 'string' ? body.accountNumber.replace(/\D/g, '') : '';
// // //     const parsedAmount = Number(body.amount);
// // //     const pin = typeof body.pin === 'string' ? body.pin.trim() : (typeof body.pin === 'number' ? String(body.pin) : '');

// // //     // বেসিক ফিল্ড ভ্যালিডেশন
// // //     if (!body.amount || !method || !accountNumber || !pin) {
// // //       return NextResponse.json({ success: false, message: 'সব তথ্য এবং সিকিউরিটি পিন সঠিকভাবে প্রদান করুন।' }, { status: 400 });
// // //     }

// // //     // পিন ফরম্যাট চেক
// // //     if (!/^\d{4}$/.test(pin)) {
// // //       return NextResponse.json({ success: false, message: 'পিন অবশ্যই সঠিক ৪ সংখ্যার হতে হবে।' }, { status: 400 });
// // //     }

// // //     // অ্যামাউন্ট ভ্যালিডেশন
// // //     if (isNaN(parsedAmount) || parsedAmount < 500) {
// // //       return NextResponse.json({ success: false, message: 'সর্বনিম্ন উইথড্র অ্যামাউন্ট ৫০০ টাকা হতে হবে।' }, { status: 400 });
// // //     }

// // //     // অ্যাকাউন্ট নম্বর ভ্যালিডেশন
// // //     if (accountNumber.length < 11) {
// // //       return NextResponse.json({ success: false, message: 'সঠিক ১১ ডিজিটের অ্যাকাউন্ট নম্বর প্রদান করুন।' }, { status: 400 });
// // //     }

// // //     // ✅ FIX: PaymentSetting collection থেকে dynamically validate (hardcoded list সরানো হয়েছে)
// // //     const paymentMethodDoc = await PaymentSetting.findOne({ methodName: method });

// // //     if (!paymentMethodDoc) {
// // //       return NextResponse.json({ success: false, message: 'এই পেমেন্ট মেথডটি সিস্টেমে নেই।' }, { status: 400 });
// // //     }

// // //     if (!paymentMethodDoc.isActive) {
// // //       return NextResponse.json({ success: false, message: 'এই পেমেন্ট মেথডটি বর্তমানে বন্ধ রয়েছে।' }, { status: 400 });
// // //     }

// // //     // ইউজার ফেচ
// // //     const user = await User.findById(auth.user._id || auth.user.userId);

// // //     if (!user) {
// // //       return NextResponse.json({ success: false, message: 'ইউজার পাওয়া যায়নি।' }, { status: 404 });
// // //     }

// // //     if (user.isBlocked) {
// // //       return NextResponse.json({ success: false, message: 'আপনার অ্যাকাউন্টটি ব্লক করা রয়েছে।' }, { status: 403 });
// // //     }

// // //     // পিন যাচাই
// // //     if (user.pin) {
// // //       const isPinMatch = await bcrypt.compare(pin, user.pin);
// // //       if (!isPinMatch) {
// // //         return NextResponse.json({ success: false, message: 'আপনার সিকিউরিটি পিন সঠিক নয়।' }, { status: 400 });
// // //       }
// // //     } else {
// // //       return NextResponse.json({ success: false, message: 'আপনার কোনো সিকিউরিটি পিন সেট করা নেই।' }, { status: 400 });
// // //     }

// // //     // রেজিস্টার্ড নম্বর ভ্যালিডেশন
// // //     const registeredPhone = user.phone || user.uid;
// // //     if (accountNumber !== registeredPhone) {
// // //       return NextResponse.json({ success: false, message: 'শুধুমাত্র আপনার রেজিস্টার্ড নম্বরেই উইথড্র করা সম্ভব।' }, { status: 400 });
// // //     }

// // //     // ব্যালেন্স চেক
// // //     const currentReferralBalance = Number(user.referralBalance || 0);
// // //     if (currentReferralBalance < parsedAmount) {
// // //       return NextResponse.json({ success: false, message: 'আপনার পর্যাপ্ত রেফারেল বোনাস ব্যালেন্স নেই।' }, { status: 400 });
// // //     }

// // //     // ব্যালেন্স কাটা
// // //     await User.findOneAndUpdate(
// // //       { _id: user._id },
// // //       { $inc: { referralBalance: -parsedAmount } }
// // //     );

// // //     // Withdraw record
// // //     await Withdraw.create({
// // //       uid: user.uid,
// // //       amount: parsedAmount,
// // //       method,
// // //       accountNumber: registeredPhone,
// // //       walletType: 'referral',
// // //       status: 'pending'
// // //     });

// // //     return NextResponse.json({ 
// // //       success: true, 
// // //       message: 'রেফারেল উইথড্র রিকোয়েস্ট সফলভাবে জমা হয়েছে!',
// // //       newReferralBalance: currentReferralBalance - parsedAmount 
// // //     }, {
// // //       status: 200,
// // //       headers: {
// // //         'X-Content-Type-Options': 'nosniff',
// // //         'X-Frame-Options': 'DENY',
// // //         'Cache-Control': 'no-store, no-cache, must-revalidate'
// // //       }
// // //     });

// // //   } catch (error) {
// // //     console.error('Referral Withdraw API Error:', error);
// // //     return NextResponse.json({ success: false, error: error.message || 'সার্ভারে অভ্যন্তরীণ ত্রুটি ঘটেছে!' }, { status: 500 });
// // //   }
// // // }

// // // // ...........................................................................
// // import { NextResponse } from 'next/server';
// // import clientPromise from '@/lib/mongodb';
// // import User from '@/models/User';
// // import Withdraw from '@/models/Withdraw';
// // import PaymentMethod from '@/models/PaymentMethod'; // ✅ FIX: PaymentSetting → PaymentMethod
// // import bcrypt from 'bcryptjs';
// // import { verifyAuth } from '@/utils/authCheck';

// // export async function POST(request) {
// //   try {
// //     await clientPromise;

// //     // ১. HttpOnly কুকি ও ডাটাবেজ ভেরিফিকেশন
// //     const auth = await verifyAuth('user');
// //     if (!auth.success) {
// //       return NextResponse.json(
// //         { success: false, message: auth.message },
// //         {
// //           status: auth.status,
// //           headers: {
// //             'X-Content-Type-Options': 'nosniff',
// //             'X-Frame-Options': 'DENY'
// //           }
// //         }
// //       );
// //     }

// //     let body;
// //     try {
// //       body = await request.json();
// //     } catch (e) {
// //       return NextResponse.json({ success: false, message: 'অবৈধ বা খালি ডেটা পাঠানো হয়েছে!' }, { status: 400 });
// //     }

// //     // ✅ FIX: method-এর original case রাখা হচ্ছে (Rocket, TRX, Binance Pay)
// //     const method = typeof body.method === 'string' ? body.method.trim() : '';
// //     const accountNumber = typeof body.accountNumber === 'string' ? body.accountNumber.replace(/\D/g, '') : '';
// //     const parsedAmount = Number(body.amount);
// //     const pin = typeof body.pin === 'string' ? body.pin.trim() : (typeof body.pin === 'number' ? String(body.pin) : '');

// //     // বেসিক ফিল্ড ভ্যালিডেশন
// //     if (!body.amount || !method || !accountNumber || !pin) {
// //       return NextResponse.json({ success: false, message: 'সব তথ্য এবং সিকিউরিটি পিন সঠিকভাবে প্রদান করুন।' }, { status: 400 });
// //     }

// //     // পিন ফরম্যাট চেক
// //     if (!/^\d{4}$/.test(pin)) {
// //       return NextResponse.json({ success: false, message: 'পিন অবশ্যই সঠিক ৪ সংখ্যার হতে হবে।' }, { status: 400 });
// //     }

// //     // অ্যামাউন্ট ভ্যালিডেশন
// //     if (isNaN(parsedAmount) || parsedAmount < 500) {
// //       return NextResponse.json({ success: false, message: 'সর্বনিম্ন উইথড্র অ্যামাউন্ট ৫০০ টাকা হতে হবে।' }, { status: 400 });
// //     }

// //     // অ্যাকাউন্ট নম্বর ভ্যালিডেশন
// //     if (accountNumber.length < 11) {
// //       return NextResponse.json({ success: false, message: 'সঠিক ১১ ডিজিটের অ্যাকাউন্ট নম্বর প্রদান করুন।' }, { status: 400 });
// //     }

// //     // ✅ FIX: PaymentMethod collection থেকে dynamically validate (case-insensitive)
// //     const escapedMethod = method.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// //     const paymentMethodDoc = await PaymentMethod.findOne({
// //       methodName: { $regex: `^${escapedMethod}$`, $options: 'i' }
// //     });

// //     if (!paymentMethodDoc) {
// //       return NextResponse.json({ success: false, message: 'এই পেমেন্ট মেথডটি সিস্টেমে নেই।' }, { status: 400 });
// //     }

// //     if (!paymentMethodDoc.isActive) {
// //       return NextResponse.json({ success: false, message: 'এই পেমেন্ট মেথডটি বর্তমানে বন্ধ রয়েছে।' }, { status: 400 });
// //     }

// //     // ইউজার ফেচ
// //     const user = await User.findById(auth.user._id || auth.user.userId);

// //     if (!user) {
// //       return NextResponse.json({ success: false, message: 'ইউজার পাওয়া যায়নি।' }, { status: 404 });
// //     }

// //     if (user.isBlocked) {
// //       return NextResponse.json({ success: false, message: 'আপনার অ্যাকাউন্টটি ব্লক করা রয়েছে।' }, { status: 403 });
// //     }

// //     // পিন যাচাই
// //     if (user.pin) {
// //       const isPinMatch = await bcrypt.compare(pin, user.pin);
// //       if (!isPinMatch) {
// //         return NextResponse.json({ success: false, message: 'আপনার সিকিউরিটি পিন সঠিক নয়।' }, { status: 400 });
// //       }
// //     } else {
// //       return NextResponse.json({ success: false, message: 'আপনার কোনো সিকিউরিটি পিন সেট করা নেই।' }, { status: 400 });
// //     }

// //     // রেজিস্টার্ড নম্বর ভ্যালিডেশন
// //     const registeredPhone = user.phone || user.uid;
// //     if (accountNumber !== registeredPhone) {
// //       return NextResponse.json({ success: false, message: 'শুধুমাত্র আপনার রেজিস্টার্ড নম্বরেই উইথড্র করা সম্ভব।' }, { status: 400 });
// //     }

// //     // ব্যালেন্স চেক
// //     const currentReferralBalance = Number(user.referralBalance || 0);
// //     if (currentReferralBalance < parsedAmount) {
// //       return NextResponse.json({ success: false, message: 'আপনার পর্যাপ্ত রেফারেল বোনাস ব্যালেন্স নেই।' }, { status: 400 });
// //     }

// //     // ব্যালেন্স কাটা
// //     await User.findOneAndUpdate(
// //       { _id: user._id },
// //       { $inc: { referralBalance: -parsedAmount } }
// //     );

// //     // Withdraw record
// //     await Withdraw.create({
// //       uid: user.uid,
// //       amount: parsedAmount,
// //       method,
// //       accountNumber: registeredPhone,
// //       walletType: 'referral',
// //       status: 'pending'
// //     });

// //     return NextResponse.json({
// //       success: true,
// //       message: 'রেফারেল উইথড্র রিকোয়েস্ট সফলভাবে জমা হয়েছে!',
// //       newReferralBalance: currentReferralBalance - parsedAmount
// //     }, {
// //       status: 200,
// //       headers: {
// //         'X-Content-Type-Options': 'nosniff',
// //         'X-Frame-Options': 'DENY',
// //         'Cache-Control': 'no-store, no-cache, must-revalidate'
// //       }
// //     });

// //   } catch (error) {
// //     console.error('Referral Withdraw API Error:', error);
// //     return NextResponse.json({ success: false, error: error.message || 'সার্ভারে অভ্যন্তরীণ ত্রুটি ঘটেছে!' }, { status: 500 });
// //   }
// // }

// // ....................................................

// import { NextResponse } from 'next/server';
// import connectDB from '@/lib/mongodb';
// import User from '@/models/User';
// import Withdraw from '@/models/Withdraw';
// import PaymentMethod from '@/models/PaymentMethod';
// import bcrypt from 'bcryptjs';
// import { verifyAuth } from '@/utils/authCheck';
// import { getCached, invalidateCache } from '@/lib/cache';
// import { CACHE_KEYS, CACHE_TTL } from '@/lib/cacheKeys';
// import { emitToUser, emitToAdmin } from '@/lib/pusher';
// import { redis } from '@/lib/redis';

// export async function POST(request) {
//   try {
//     await connectDB();

//     // ১. HttpOnly কুকি ও ডাটাবেজ ভেরিফিকেশন
//     const auth = await verifyAuth('user');
//     if (!auth.success) {
//       return NextResponse.json(
//         { success: false, message: auth.message },
//         {
//           status: auth.status,
//           headers: {
//             'X-Content-Type-Options': 'nosniff',
//             'X-Frame-Options': 'DENY'
//           }
//         }
//       );
//     }

//     const userId = auth.user._id || auth.user.userId;

//     // 🔒 Rate Limit (Redis) — ১ মিনিটে সর্বোচ্চ ৩ বার
//     try {
//       const rateKey = `rl:withdraw:${userId}`;
//       const attempts = await redis.incr(rateKey);
//       if (attempts === 1) await redis.expire(rateKey, 60);
//       if (attempts > 3) {
//         return NextResponse.json(
//           { success: false, message: 'অনেক বেশি request! ১ মিনিট পর চেষ্টা করুন।' },
//           { status: 429 }
//         );
//       }
//     } catch (rlErr) {
//       console.error('Rate limit error (ignored):', rlErr);
//     }

//     let body;
//     try {
//       body = await request.json();
//     } catch (e) {
//       return NextResponse.json({ success: false, message: 'অবৈধ বা খালি ডেটা পাঠানো হয়েছে!' }, { status: 400 });
//     }

//     // method-এর original case রাখা হচ্ছে
//     const method = typeof body.method === 'string' ? body.method.trim() : '';
//     const accountNumber = typeof body.accountNumber === 'string' ? body.accountNumber.replace(/\D/g, '') : '';
//     const parsedAmount = Number(body.amount);
//     const pin = typeof body.pin === 'string' ? body.pin.trim() : (typeof body.pin === 'number' ? String(body.pin) : '');

//     // বেসিক ফিল্ড ভ্যালিডেশন
//     if (!body.amount || !method || !accountNumber || !pin) {
//       return NextResponse.json({ success: false, message: 'সব তথ্য এবং সিকিউরিটি পিন সঠিকভাবে প্রদান করুন।' }, { status: 400 });
//     }

//     // পিন ফরম্যাট চেক
//     if (!/^\d{4}$/.test(pin)) {
//       return NextResponse.json({ success: false, message: 'পিন অবশ্যই সঠিক ৪ সংখ্যার হতে হবে।' }, { status: 400 });
//     }

//     // অ্যামাউন্ট ভ্যালিডেশন
//     if (isNaN(parsedAmount) || parsedAmount < 500) {
//       return NextResponse.json({ success: false, message: 'সর্বনিম্ন উইথড্র অ্যামাউন্ট ৫০০ টাকা হতে হবে।' }, { status: 400 });
//     }

//     // অ্যাকাউন্ট নম্বর ভ্যালিডেশন
//     if (accountNumber.length < 11) {
//       return NextResponse.json({ success: false, message: 'সঠিক ১১ ডিজিটের অ্যাকাউন্ট নম্বর প্রদান করুন।' }, { status: 400 });
//     }

//     // ✅ Redis Cache থেকে Payment Method আনো (case-insensitive)
//     const paymentMethodDoc = await getCached(
//       CACHE_KEYS.paymentMethodByName(method),
//       CACHE_TTL.paymentMethods,
//       async () => {
//         const escapedMethod = method.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
//         return await PaymentMethod.findOne({
//           methodName: { $regex: `^${escapedMethod}$`, $options: 'i' }
//         }).lean();
//       }
//     );

//     if (!paymentMethodDoc) {
//       return NextResponse.json({ success: false, message: 'এই পেমেন্ট মেথডটি সিস্টেমে নেই।' }, { status: 400 });
//     }

//     if (!paymentMethodDoc.isActive) {
//       return NextResponse.json({ success: false, message: 'এই পেমেন্ট মেথডটি বর্তমানে বন্ধ রয়েছে।' }, { status: 400 });
//     }

//     // ইউজার ফেচ
//     const user = await User.findById(userId);

//     if (!user) {
//       return NextResponse.json({ success: false, message: 'ইউজার পাওয়া যায়নি।' }, { status: 404 });
//     }

//     if (user.isBlocked) {
//       return NextResponse.json({ success: false, message: 'আপনার অ্যাকাউন্টটি ব্লক করা রয়েছে।' }, { status: 403 });
//     }

//     // পিন যাচাই
//     if (user.pin) {
//       const isPinMatch = await bcrypt.compare(pin, user.pin);
//       if (!isPinMatch) {
//         return NextResponse.json({ success: false, message: 'আপনার সিকিউরিটি পিন সঠিক নয়।' }, { status: 400 });
//       }
//     } else {
//       return NextResponse.json({ success: false, message: 'আপনার কোনো সিকিউরিটি পিন সেট করা নেই।' }, { status: 400 });
//     }

//     // রেজিস্টার্ড নম্বর ভ্যালিডেশন
//     const registeredPhone = user.phone || user.uid;
//     if (accountNumber !== registeredPhone) {
//       return NextResponse.json({ success: false, message: 'শুধুমাত্র আপনার রেজিস্টার্ড নম্বরেই উইথড্র করা সম্ভব।' }, { status: 400 });
//     }

//     // ✅ ATOMIC balance deduct (race condition-safe)
//     const updatedUser = await User.findOneAndUpdate(
//       {
//         _id: user._id,
//         referralBalance: { $gte: parsedAmount }
//       },
//       { $inc: { referralBalance: -parsedAmount } },
//       {
//         new: true,
//         select: 'referralBalance uid'
//       }
//     ).lean();

//     if (!updatedUser) {
//       return NextResponse.json({ success: false, message: 'আপনার পর্যাপ্ত রেফারেল বোনাস ব্যালেন্স নেই।' }, { status: 400 });
//     }

//     // Withdraw record
//     const withdraw = await Withdraw.create({
//       uid: user.uid,
//       amount: parsedAmount,
//       method: paymentMethodDoc.methodName, // DB-র exact name
//       accountNumber: registeredPhone,
//       walletType: 'referral',
//       status: 'pending'
//     });

//     // 🧹 Cache invalidate
//     await invalidateCache(CACHE_KEYS.userProfile(userId));

//     // 🚀 Pusher-এ real-time push (parallel)
//     await Promise.all([
//       emitToUser(userId, 'balance-update', {
//         newBalance: updatedUser.referralBalance,
//         type: 'referral_withdraw',
//         amount: parsedAmount,
//         timestamp: Date.now(),
//       }),
//       emitToUser(userId, 'withdraw-created', {
//         withdrawId: withdraw._id.toString(),
//         amount: parsedAmount,
//         status: 'pending',
//       }),
//       emitToAdmin('new-withdraw', {
//         userId,
//         uid: user.uid,
//         amount: parsedAmount,
//         method: paymentMethodDoc.methodName,
//         withdrawId: withdraw._id.toString(),
//       }),
//     ]);

//     return NextResponse.json({
//       success: true,
//       message: 'রেফারেল উইথড্র রিকোয়েস্ট সফলভাবে জমা হয়েছে!',
//       newBalance: updatedUser.referralBalance
//     }, {
//       status: 200,
//       headers: {
//         'X-Content-Type-Options': 'nosniff',
//         'X-Frame-Options': 'DENY',
//         'Cache-Control': 'no-store, no-cache, must-revalidate'
//       }
//     });

//   } catch (error) {
//     console.error('Referral Withdraw API Error:', error);
//     return NextResponse.json(
//       { success: false, error: error.message || 'সার্ভারে অভ্যন্তরীণ ত্রুটি ঘটেছে!' },
//       { status: 500 }
//     );
//   }
// }

// ..........................................................

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Withdraw from '@/models/Withdraw';
import PaymentMethod from '@/models/PaymentMethod';
import bcrypt from 'bcryptjs';
import { verifyAuth } from '@/utils/authCheck';
import { getCached, invalidateCache } from '@/lib/cache';
import { CACHE_KEYS, CACHE_TTL } from '@/lib/cacheKeys';
import { emitToUser, emitToAdmin } from '@/lib/pusher';
import { redis } from '@/lib/redis';

export async function POST(request) {
  try {
    await connectDB();

    // ১. Auth verify
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

    const userId = auth.user._id || auth.user.userId;

    // 🔒 Rate Limit (Redis) — ১ মিনিটে ৩ বার
    try {
      const rateKey = `rl:withdraw:${userId}`;
      const attempts = await redis.incr(rateKey);
      if (attempts === 1) await redis.expire(rateKey, 60);
      if (attempts > 3) {
        return NextResponse.json(
          { success: false, message: 'অনেক বেশি request! ১ মিনিট পর চেষ্টা করুন।' },
          { status: 429 }
        );
      }
    } catch (rlErr) {
      console.error('Rate limit error (ignored):', rlErr);
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ success: false, message: 'অবৈধ বা খালি ডেটা!' }, { status: 400 });
    }

    const method = typeof body.method === 'string' ? body.method.trim() : '';
    const accountNumber = typeof body.accountNumber === 'string' ? body.accountNumber.replace(/\D/g, '') : '';
    const parsedAmount = Number(body.amount);
    const pin = typeof body.pin === 'string' ? body.pin.trim() : (typeof body.pin === 'number' ? String(body.pin) : '');

    // Validation
    if (!body.amount || !method || !accountNumber || !pin) {
      return NextResponse.json({ success: false, message: 'সব তথ্য এবং পিন দিন।' }, { status: 400 });
    }
    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json({ success: false, message: 'পিন ৪ সংখ্যার হতে হবে।' }, { status: 400 });
    }
    if (isNaN(parsedAmount) || parsedAmount < 500) {
      return NextResponse.json({ success: false, message: 'সর্বনিম্ন ৫০০ টাকা।' }, { status: 400 });
    }
    if (accountNumber.length < 11) {
      return NextResponse.json({ success: false, message: 'সঠিক ১১ ডিজিট নম্বর দিন।' }, { status: 400 });
    }

    // ✅ Redis Cache থেকে Payment Method
    const paymentMethodDoc = await getCached(
      CACHE_KEYS.paymentMethodByName(method),
      CACHE_TTL.paymentMethods,
      async () => {
        const escapedMethod = method.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return await PaymentMethod.findOne({
          methodName: { $regex: `^${escapedMethod}$`, $options: 'i' }
        }).lean();
      }
    );

    if (!paymentMethodDoc) {
      return NextResponse.json({ success: false, message: 'এই পেমেন্ট মেথডটি নেই।' }, { status: 400 });
    }
    if (!paymentMethodDoc.isActive) {
      return NextResponse.json({ success: false, message: 'এই মেথড বন্ধ।' }, { status: 400 });
    }

    // User fetch
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'ইউজার নেই।' }, { status: 404 });
    }
    if (user.isBlocked) {
      return NextResponse.json({ success: false, message: 'অ্যাকাউন্ট ব্লকড।' }, { status: 403 });
    }

    // PIN verify
    if (user.pin) {
      const isPinMatch = await bcrypt.compare(pin, user.pin);
      if (!isPinMatch) {
        return NextResponse.json({ success: false, message: 'পিন ভুল।' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ success: false, message: 'পিন সেট নেই।' }, { status: 400 });
    }

    // Phone verify
    const registeredPhone = user.phone || user.uid;
    if (accountNumber !== registeredPhone) {
      return NextResponse.json({ success: false, message: 'শুধু রেজিস্টার্ড নম্বরে।' }, { status: 400 });
    }

    // ✅ ATOMIC balance deduct (race-safe)
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: user._id,
        referralBalance: { $gte: parsedAmount }
      },
      { $inc: { referralBalance: -parsedAmount } },
      { new: true, select: 'referralBalance uid' }
    ).lean();

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: 'ব্যালেন্স নেই।' }, { status: 400 });
    }

    // Withdraw record
    const withdraw = await Withdraw.create({
      uid: user.uid,
      amount: parsedAmount,
      method: paymentMethodDoc.methodName,
      accountNumber: registeredPhone,
      walletType: 'referral',
      status: 'pending'
    });

    // 🧹 Cache invalidate
    await invalidateCache(CACHE_KEYS.userProfile(userId));

    // 🚀 Pusher real-time push (parallel)
    await Promise.all([
      emitToUser(userId, 'balance-update', {
        newBalance: updatedUser.referralBalance,
        type: 'referral_withdraw',
        amount: parsedAmount,
        timestamp: Date.now(),
      }),
      emitToUser(userId, 'withdraw-created', {
        withdrawId: withdraw._id.toString(),
        amount: parsedAmount,
        status: 'pending',
      }),
      emitToAdmin('new-withdraw', {
        userId,
        uid: user.uid,
        amount: parsedAmount,
        method: paymentMethodDoc.methodName,
        withdrawId: withdraw._id.toString(),
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'রেফারেল উইথড্র সফল!',
      newBalance: updatedUser.referralBalance
    }, {
      status: 200,
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });

  } catch (error) {
    console.error('Referral Withdraw API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'সার্ভার ত্রুটি!' },
      { status: 500 }
    );
  }
}