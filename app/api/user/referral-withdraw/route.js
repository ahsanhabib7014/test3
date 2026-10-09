// import { NextResponse } from 'next/server';
// import clientPromise from '@/lib/mongodb';
// import User from '@/models/User';
// import Withdraw from '@/models/Withdraw';
// import PaymentSetting from '@/models/PaymentSetting';
// import bcrypt from 'bcryptjs';
// import { verifyAuth } from '@/utils/authCheck';

// export async function POST(request) {
//   try {
//     await clientPromise;

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

//     let body;
//     try {
//       body = await request.json();
//     } catch (e) {
//       return NextResponse.json({ success: false, message: 'অবৈধ বা খালি ডেটা পাঠানো হয়েছে!' }, { status: 400 });
//     }

//     // ✅ FIX: method-এর original case রাখা হচ্ছে (Rocket, TRX, Binance Pay)
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

//     // ✅ FIX: PaymentSetting collection থেকে dynamically validate (hardcoded list সরানো হয়েছে)
//     const paymentMethodDoc = await PaymentSetting.findOne({ methodName: method });

//     if (!paymentMethodDoc) {
//       return NextResponse.json({ success: false, message: 'এই পেমেন্ট মেথডটি সিস্টেমে নেই।' }, { status: 400 });
//     }

//     if (!paymentMethodDoc.isActive) {
//       return NextResponse.json({ success: false, message: 'এই পেমেন্ট মেথডটি বর্তমানে বন্ধ রয়েছে।' }, { status: 400 });
//     }

//     // ইউজার ফেচ
//     const user = await User.findById(auth.user._id || auth.user.userId);

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

//     // ব্যালেন্স চেক
//     const currentReferralBalance = Number(user.referralBalance || 0);
//     if (currentReferralBalance < parsedAmount) {
//       return NextResponse.json({ success: false, message: 'আপনার পর্যাপ্ত রেফারেল বোনাস ব্যালেন্স নেই।' }, { status: 400 });
//     }

//     // ব্যালেন্স কাটা
//     await User.findOneAndUpdate(
//       { _id: user._id },
//       { $inc: { referralBalance: -parsedAmount } }
//     );

//     // Withdraw record
//     await Withdraw.create({
//       uid: user.uid,
//       amount: parsedAmount,
//       method,
//       accountNumber: registeredPhone,
//       walletType: 'referral',
//       status: 'pending'
//     });

//     return NextResponse.json({ 
//       success: true, 
//       message: 'রেফারেল উইথড্র রিকোয়েস্ট সফলভাবে জমা হয়েছে!',
//       newReferralBalance: currentReferralBalance - parsedAmount 
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
//     return NextResponse.json({ success: false, error: error.message || 'সার্ভারে অভ্যন্তরীণ ত্রুটি ঘটেছে!' }, { status: 500 });
//   }
// }

// // ...........................................................................
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import User from '@/models/User';
import Withdraw from '@/models/Withdraw';
import PaymentMethod from '@/models/PaymentMethod'; // ✅ FIX: PaymentSetting → PaymentMethod
import bcrypt from 'bcryptjs';
import { verifyAuth } from '@/utils/authCheck';

export async function POST(request) {
  try {
    await clientPromise;

    // ১. HttpOnly কুকি ও ডাটাবেজ ভেরিফিকেশন
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
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ success: false, message: 'অবৈধ বা খালি ডেটা পাঠানো হয়েছে!' }, { status: 400 });
    }

    // ✅ FIX: method-এর original case রাখা হচ্ছে (Rocket, TRX, Binance Pay)
    const method = typeof body.method === 'string' ? body.method.trim() : '';
    const accountNumber = typeof body.accountNumber === 'string' ? body.accountNumber.replace(/\D/g, '') : '';
    const parsedAmount = Number(body.amount);
    const pin = typeof body.pin === 'string' ? body.pin.trim() : (typeof body.pin === 'number' ? String(body.pin) : '');

    // বেসিক ফিল্ড ভ্যালিডেশন
    if (!body.amount || !method || !accountNumber || !pin) {
      return NextResponse.json({ success: false, message: 'সব তথ্য এবং সিকিউরিটি পিন সঠিকভাবে প্রদান করুন।' }, { status: 400 });
    }

    // পিন ফরম্যাট চেক
    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json({ success: false, message: 'পিন অবশ্যই সঠিক ৪ সংখ্যার হতে হবে।' }, { status: 400 });
    }

    // অ্যামাউন্ট ভ্যালিডেশন
    if (isNaN(parsedAmount) || parsedAmount < 500) {
      return NextResponse.json({ success: false, message: 'সর্বনিম্ন উইথড্র অ্যামাউন্ট ৫০০ টাকা হতে হবে।' }, { status: 400 });
    }

    // অ্যাকাউন্ট নম্বর ভ্যালিডেশন
    if (accountNumber.length < 11) {
      return NextResponse.json({ success: false, message: 'সঠিক ১১ ডিজিটের অ্যাকাউন্ট নম্বর প্রদান করুন।' }, { status: 400 });
    }

    // ✅ FIX: PaymentMethod collection থেকে dynamically validate (case-insensitive)
    const escapedMethod = method.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const paymentMethodDoc = await PaymentMethod.findOne({
      methodName: { $regex: `^${escapedMethod}$`, $options: 'i' }
    });

    if (!paymentMethodDoc) {
      return NextResponse.json({ success: false, message: 'এই পেমেন্ট মেথডটি সিস্টেমে নেই।' }, { status: 400 });
    }

    if (!paymentMethodDoc.isActive) {
      return NextResponse.json({ success: false, message: 'এই পেমেন্ট মেথডটি বর্তমানে বন্ধ রয়েছে।' }, { status: 400 });
    }

    // ইউজার ফেচ
    const user = await User.findById(auth.user._id || auth.user.userId);

    if (!user) {
      return NextResponse.json({ success: false, message: 'ইউজার পাওয়া যায়নি।' }, { status: 404 });
    }

    if (user.isBlocked) {
      return NextResponse.json({ success: false, message: 'আপনার অ্যাকাউন্টটি ব্লক করা রয়েছে।' }, { status: 403 });
    }

    // পিন যাচাই
    if (user.pin) {
      const isPinMatch = await bcrypt.compare(pin, user.pin);
      if (!isPinMatch) {
        return NextResponse.json({ success: false, message: 'আপনার সিকিউরিটি পিন সঠিক নয়।' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ success: false, message: 'আপনার কোনো সিকিউরিটি পিন সেট করা নেই।' }, { status: 400 });
    }

    // রেজিস্টার্ড নম্বর ভ্যালিডেশন
    const registeredPhone = user.phone || user.uid;
    if (accountNumber !== registeredPhone) {
      return NextResponse.json({ success: false, message: 'শুধুমাত্র আপনার রেজিস্টার্ড নম্বরেই উইথড্র করা সম্ভব।' }, { status: 400 });
    }

    // ব্যালেন্স চেক
    const currentReferralBalance = Number(user.referralBalance || 0);
    if (currentReferralBalance < parsedAmount) {
      return NextResponse.json({ success: false, message: 'আপনার পর্যাপ্ত রেফারেল বোনাস ব্যালেন্স নেই।' }, { status: 400 });
    }

    // ব্যালেন্স কাটা
    await User.findOneAndUpdate(
      { _id: user._id },
      { $inc: { referralBalance: -parsedAmount } }
    );

    // Withdraw record
    await Withdraw.create({
      uid: user.uid,
      amount: parsedAmount,
      method,
      accountNumber: registeredPhone,
      walletType: 'referral',
      status: 'pending'
    });

    return NextResponse.json({
      success: true,
      message: 'রেফারেল উইথড্র রিকোয়েস্ট সফলভাবে জমা হয়েছে!',
      newReferralBalance: currentReferralBalance - parsedAmount
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
    return NextResponse.json({ success: false, error: error.message || 'সার্ভারে অভ্যন্তরীণ ত্রুটি ঘটেছে!' }, { status: 500 });
  }
}