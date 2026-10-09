// import { NextResponse } from 'next/server';
// import dbConnect from '@/utils/db';
// import Withdraw from '@/models/Withdraw';
// import User from '@/models/User';
// import bcrypt from 'bcryptjs';
// import { verifyAuth } from '@/utils/authCheck';

// export async function POST(req) {
//   try {
//     await dbConnect();

//     // ১. সেন্ট্রালাইজড HttpOnly কুকি ও ডাটাবেজ ভেরিফিকেশন[cite: 10]
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

//     let body;
//     try {
//       body = await req.json();
//     } catch (e) {
//       return NextResponse.json({ success: false, message: 'অবৈধ বা খালি ডেটা পাঠানো হয়েছে!' }, { status: 400 });
//     }

//     const { amount, method, pin } = body || {};

//     // ২. সব ফিল্ডের উপস্থিতি এবং ডেটা টাইপ ভ্যালিডেশন[cite: 10]
//     if (!amount || !method || !pin) {
//       return NextResponse.json({ success: false, message: 'অসম্পূর্ণ বা অবৈধ ডেটা রিকোয়েস্ট!' }, { status: 400 });
//     }

//     // ৩. উইথড্র অ্যামাউন্ট স্যানিটাইজেশন[cite: 10]
//     const cleanAmount = Number(amount);
//     if (isNaN(cleanAmount) || cleanAmount <= 0 || !Number.isInteger(cleanAmount)) {
//       return NextResponse.json({ success: false, message: 'অবৈধ উইথড্রর পরিমাণ প্রদান করা হয়েছে!' }, { status: 400 });
//     }

//     if (cleanAmount < 500) {
//       return NextResponse.json({ success: false, message: 'সর্বনিম্ন উইথড্র ৫০০ টাকা হতে হবে!' }, { status: 400 });
//     }

//     // ৪. পেমেন্ট মেথড স্যানিটাইজেশন[cite: 10]
//     const cleanMethod = String(method).trim().toLowerCase();
//     const allowedMethods = ['bkash', 'nagad', 'rocket'];
//     if (!allowedMethods.includes(cleanMethod)) {
//       return NextResponse.json({ success: false, message: 'সঠিক পেমেন্ট পদ্ধতি নির্বাচন করুন!' }, { status: 400 });
//     }

//     // ৫. পিন স্যানিটাইজেশন[cite: 10]
//     const cleanPin = String(pin).trim();
//     if (!/^\d{4}$/.test(cleanPin)) {
//       return NextResponse.json({ success: false, message: 'পিন অবশ্যই সঠিক ৪ সংখ্যার হতে হবে!' }, { status: 400 });
//     }

//     // ৬. ডাটাবেজ থেকে সম্পূর্ণ ইউজার অবজেক্ট নিশ্চিত করা (ব্যালেন্স আপডেট করার জন্য)[cite: 10]
//     const user = await User.findById(auth.user._id || auth.user.userId);

//     if (!user) {
//       return NextResponse.json({ success: false, message: 'ইউজার পাওয়া যায়নি!' }, { status: 404 });
//     }

//     if (user.isBlocked) {
//       return NextResponse.json({ success: false, message: 'আপনার অ্যাকাউন্টটি ব্লক করা রয়েছে!' }, { status: 403 });
//     }

//     // ৭. হ্যাশ করা পিন চেক[cite: 10]
//     if (!user.pin) {
//       return NextResponse.json({ success: false, message: 'আপনার অ্যাকাউন্টে কোনো সিকিউরিটি পিন সেট করা নেই!' }, { status: 400 });
//     }

//     const isPinMatch = await bcrypt.compare(cleanPin, user.pin);
//     if (!isPinMatch) {
//       return NextResponse.json({ success: false, message: 'আপনার সিকিউরিটি পিন সঠিক নয়!' }, { status: 400 });
//     }

//     // ৮. টার্নওভার চেক[cite: 10]
//     if (user.turnover && user.turnover > 0) {
//       return NextResponse.json({ 
//         success: false, 
//         message: `টার্নওভার বাকি থাকা অবস্থায় উইথড্র করা সম্ভব নয়। আপনার টার্নওভার: ৳${user.turnover}` 
//       }, { status: 400 });
//     }

//     // ৯. পর্যাপ্ত ব্যালেন্স চেক[cite: 10]
//     if (user.balance < cleanAmount) {
//       return NextResponse.json({ success: false, message: 'আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই!' }, { status: 400 });
//     }

//     // ১০. রেজিস্টার্ড নম্বর ভ্যালিডেশন[cite: 10]
//     const registeredAccountNumber = user.phone;
//     if (!registeredAccountNumber || !/^\d{11}$/.test(registeredAccountNumber)) {
//       return NextResponse.json({ success: false, message: 'আপনার অ্যাকাউন্টে সঠিক ১১ ডিজিটের রেজিস্টার্ড ফোন নম্বর পাওয়া যায়নি!' }, { status: 400 });
//     }

//     // ১১. ব্যালেন্স কাটা[cite: 10]
//     user.balance -= cleanAmount;
//     await user.save();

//     // ১২. Withdraw record তৈরি[cite: 10]
//     await Withdraw.create({
//       uid: user.uid,
//       amount: cleanAmount,
//       method: cleanMethod,
//       accountNumber: registeredAccountNumber,
//       status: 'pending'
//     });

//     // ১৩. success ও নতুন ব্যালেন্স রিটার্ন করা[cite: 10]
//     return NextResponse.json({ 
//       success: true, 
//       message: 'উইথড্র রিকোয়েস্ট সফলভাবে জমা হয়েছে!',
//       newBalance: Number(user.balance)
//     }, {
//       status: 200,
//       headers: {
//         'X-Content-Type-Options': 'nosniff',
//         'X-Frame-Options': 'DENY',
//         'Cache-Control': 'no-store, no-cache, must-revalidate'
//       }
//     });

//   } catch (error) {
//     console.error('Secure Withdraw API Error:', error);
//     return NextResponse.json({ success: false, message: 'সার্ভারে অভ্যন্তরীণ ত্রুটি ঘটেছে!' }, { status: 500 });
//   }
// }

// ...............................................................................................


import { NextResponse } from 'next/server';
import dbConnect from '@/utils/db';
import Withdraw from '@/models/Withdraw';
import User from '@/models/User';
import PaymentMethod from '@/models/PaymentMethod';
import bcrypt from 'bcryptjs';
import { verifyAuth } from '@/utils/authCheck';

export async function POST(req) {
  try {
    await dbConnect();

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

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ success: false, message: 'অবৈধ বা খালি ডেটা পাঠানো হয়েছে!' }, { status: 400 });
    }

    const { amount, method, pin } = body || {};

    // ২. সব ফিল্ডের উপস্থিতি এবং ডেটা টাইপ ভ্যালিডেশন
    if (!amount || !method || !pin) {
      return NextResponse.json({ success: false, message: 'অসম্পূর্ণ বা অবৈধ ডেটা রিকোয়েস্ট!' }, { status: 400 });
    }

    // ৩. উইথড্র অ্যামাউন্ট স্যানিটাইজেশন
    const cleanAmount = Number(amount);
    if (isNaN(cleanAmount) || cleanAmount <= 0 || !Number.isInteger(cleanAmount)) {
      return NextResponse.json({ success: false, message: 'অবৈধ উইথড্রর পরিমাণ প্রদান করা হয়েছে!' }, { status: 400 });
    }

    if (cleanAmount < 500) {
      return NextResponse.json({ success: false, message: 'সর্বনিম্ন উইথড্র ৫০০ টাকা হতে হবে!' }, { status: 400 });
    }

    // ৪. পেমেন্ট মেথড স্যানিটাইজেশন — ✅ ডেটাবেজ থেকে ডাইনামিক চেক
    const cleanMethod = String(method).trim();
    
    // ডেটাবেজে এই নামের মেথডটি Active আছে কিনা চেক
    const paymentMethodDoc = await PaymentMethod.findOne({
      methodName: { $regex: new RegExp(`^${cleanMethod}$`, 'i') },
      isActive: true
    });

    if (!paymentMethodDoc) {
      return NextResponse.json({ 
        success: false, 
        message: 'এই পেমেন্ট মেথডটি বর্তমানে সচল নেই অথবা বিদ্যমান নেই!' 
      }, { status: 400 });
    }

    // ডেটাবেজের আসল নামটি ব্যবহার করুন (case-sensitive consistency-র জন্য)
    const verifiedMethodName = paymentMethodDoc.methodName;

    // ৫. পিন স্যানিটাইজেশন
    const cleanPin = String(pin).trim();
    if (!/^\d{4}$/.test(cleanPin)) {
      return NextResponse.json({ success: false, message: 'পিন অবশ্যই সঠিক ৪ সংখ্যার হতে হবে!' }, { status: 400 });
    }

    // ৬. ডাটাবেজ থেকে সম্পূর্ণ ইউজার অবজেক্ট নিশ্চিত করা
    const user = await User.findById(auth.user._id || auth.user.userId);

    if (!user) {
      return NextResponse.json({ success: false, message: 'ইউজার পাওয়া যায়নি!' }, { status: 404 });
    }

    if (user.isBlocked) {
      return NextResponse.json({ success: false, message: 'আপনার অ্যাকাউন্টটি ব্লক করা রয়েছে!' }, { status: 403 });
    }

    // ৭. হ্যাশ করা পিন চেক
    if (!user.pin) {
      return NextResponse.json({ success: false, message: 'আপনার অ্যাকাউন্টে কোনো সিকিউরিটি পিন সেট করা নেই!' }, { status: 400 });
    }

    const isPinMatch = await bcrypt.compare(cleanPin, user.pin);
    if (!isPinMatch) {
      return NextResponse.json({ success: false, message: 'আপনার সিকিউরিটি পিন সঠিক নয়!' }, { status: 400 });
    }

    // ৮. টার্নওভার চেক
    if (user.turnover && user.turnover > 0) {
      return NextResponse.json({ 
        success: false, 
        message: `টার্নওভার বাকি থাকা অবস্থায় উইথড্র করা সম্ভব নয়। আপনার টার্নওভার: ৳${user.turnover}` 
      }, { status: 400 });
    }

    // ৯. পর্যাপ্ত ব্যালেন্স চেক
    if (user.balance < cleanAmount) {
      return NextResponse.json({ success: false, message: 'আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই!' }, { status: 400 });
    }

    // ১০. রেজিস্টার্ড নম্বর ভ্যালিডেশন
    const registeredAccountNumber = user.phone;
    if (!registeredAccountNumber || !/^\d{11}$/.test(registeredAccountNumber)) {
      return NextResponse.json({ success: false, message: 'আপনার অ্যাকাউন্টে সঠিক ১১ ডিজিটের রেজিস্টার্ড ফোন নম্বর পাওয়া যায়নি!' }, { status: 400 });
    }

    // ১১. ব্যালেন্স কাটা
    user.balance -= cleanAmount;
    await user.save();

    // ১২. Withdraw record তৈরি (ডেটাবেজের আসল মেথড নাম ব্যবহার)
    await Withdraw.create({
      uid: user.uid,
      amount: cleanAmount,
      method: verifiedMethodName,
      accountNumber: registeredAccountNumber,
      status: 'pending'
    });

    // ১৩. success ও নতুন ব্যালেন্স রিটার্ন করা
    return NextResponse.json({ 
      success: true, 
      message: 'উইথড্র রিকোয়েস্ট সফলভাবে জমা হয়েছে!',
      newBalance: Number(user.balance)
    }, {
      status: 200,
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });

  } catch (error) {
    console.error('Secure Withdraw API Error:', error);
    return NextResponse.json({ success: false, message: 'সার্ভারে অভ্যন্তরীণ ত্রুটি ঘটেছে!' }, { status: 500 });
  }
}