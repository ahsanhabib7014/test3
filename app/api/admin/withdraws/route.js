// import { NextResponse } from 'next/server';
// import mongoose from 'mongoose';
// import dbConnect from '@/lib/mongodb';
// import User from '@/models/User';
// import { verifyAuth } from '@/utils/authCheck';

// export async function GET(request) {
//   try {
//     await dbConnect();

//     // ১. সেন্ট্রালাইজড হাই-সিকিউরিটি অ্যাডমিন অথেন্টিকেশন চেক[cite: 12]
//     const auth = await verifyAuth('admin');
//     if (!auth.success) {
//       return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
//     }

//     const adminUser = auth.user;

//     const { searchParams } = new URL(request.url);
//     const walletType = searchParams.get('walletType');

//     let query = {};
//     if (walletType) {
//       query.walletType = walletType;
//     }

//     if (mongoose.models.Withdraw) {
//       delete mongoose.models.Withdraw;
//     }

//     const withdrawSchema = new mongoose.Schema({
//       adminNote: { type: String, default: '' },
//       status: { type: String, default: 'pending' }
//     }, { strict: false, timestamps: true });

//     const WithdrawModel = mongoose.model('Withdraw', withdrawSchema, 'withdraws');
//     let withdraws = await WithdrawModel.find(query).lean();

//     // প্রতিটি উইথড্র রেকর্ডে ডেট নিশ্চিত করা[cite: 8, 12]
//     withdraws = withdraws.map(item => {
//       let itemDate = item.createdAt || item.date || item.timestamp;
      
//       if (!itemDate && item._id) {
//         try {
//           itemDate = new Date(parseInt(item._id.toString().substring(0, 8), 16) * 1000);
//         } catch (e) {
//           itemDate = new Date(0);
//         }
//       }

//       return {
//         ...item,
//         createdAt: itemDate
//       };
//     });

//     // নতুন রেকর্ড সবসময় উপরে (Descending Order) দেখানোর জন্য সর্টিং[cite: 8, 12]
//     withdraws.sort((a, b) => {
//       const timeA = new Date(a.createdAt || 0).getTime();
//       const timeB = new Date(b.createdAt || 0).getTime();
//       return timeB - timeA;
//     });
    
//     return NextResponse.json({ success: true, withdraws }, { status: 200 });
//   } catch (error) {
//     return NextResponse.json({ success: false, withdraws: [], error: error.message }, { status: 500 });
//   }
// }

// export async function PATCH(request) {
//   try {
//     await dbConnect();

//     // ১. সেন্ট্রালাইজড হাই-সিকিউরিটি অ্যাডমিন অথেন্টিকেশন চেক[cite: 12]
//     const auth = await verifyAuth('admin');
//     if (!auth.success) {
//       return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
//     }

//     const adminUser = auth.user;

//     const body = await request.json();
//     const { withdrawId, status, adminNote } = body;

//     if (!withdrawId || !status) {
//       return NextResponse.json({ success: false, message: 'Invalid data provided' }, { status: 400 });
//     }

//     if (mongoose.models.Withdraw) {
//       delete mongoose.models.Withdraw;
//     }
//     if (mongoose.models.User) {
//       delete mongoose.models.User;
//     }

//     const withdrawSchema = new mongoose.Schema({
//       adminNote: { type: String, default: '' },
//       status: { type: String, default: 'pending' }
//     }, { strict: false, timestamps: true });

//     const WithdrawModel = mongoose.model('Withdraw', withdrawSchema, 'withdraws');
//     const UserModel = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');

//     let queryCondition = {};
//     if (mongoose.Types.ObjectId.isValid(withdrawId)) {
//       queryCondition = { $or: [{ _id: withdrawId }, { _id: new mongoose.Types.ObjectId(withdrawId) }, { id: withdrawId }] };
//     } else {
//       queryCondition = { id: withdrawId };
//     }

//     const withdraw = await WithdrawModel.findOne(queryCondition);
//     if (!withdraw) {
//       return NextResponse.json({ success: false, message: 'উইথড্র রিকোয়েস্ট পাওয়া যায়নি' }, { status: 404 });
//     }

//     const isNowRejected = (String(status).toLowerCase() === 'rejected') && (String(withdraw.status).toLowerCase() !== 'rejected');

//     if (isNowRejected) {
//       const targetBalanceField = withdraw.walletType === 'referral' ? 'referralBalance' : 'balance';
//       const currentAmount = Number(withdraw.amount) || 0;
//       await UserModel.findOneAndUpdate(
//         { $or: [{ uid: withdraw.uid }, { phone: withdraw.phone }, { _id: withdraw.userId }] },
//         { $inc: { [targetBalanceField]: currentAmount } }
//       );
//     }

//     const updateData = { status };
//     if (adminNote !== undefined) {
//       updateData.adminNote = adminNote;
//       updateData.admin_note = adminNote;
//       updateData.note = adminNote;
//       updateData.reason = adminNote;
//     }

//     const updatedWithdraw = await WithdrawModel.findOneAndUpdate(
//       queryCondition, 
//       { $set: updateData }, 
//       { new: true, strict: false }
//     );

//     const userQueryConditions = [];
//     if (withdraw.uid) userQueryConditions.push({ uid: withdraw.uid });
//     if (withdraw.phone) userQueryConditions.push({ phone: withdraw.phone });
//     if (withdraw.userId) {
//       userQueryConditions.push({ _id: withdraw.userId });
//       if (mongoose.Types.ObjectId.isValid(withdraw.userId)) {
//         userQueryConditions.push({ _id: new mongoose.Types.ObjectId(withdraw.userId) });
//       }
//     }

//     if (userQueryConditions.length > 0) {
//       const targetWithdrawIdStr = String(withdraw._id);
//       await UserModel.updateMany(
//         { $or: userQueryConditions },
//         { 
//           $set: { 
//             "withdraws.$[elem].adminNote": adminNote,
//             "withdraws.$[elem].status": status 
//           } 
//         },
//         { 
//           arrayFilters: [
//             { 
//               $or: [
//                 { "elem._id": withdrawId },
//                 { "elem.id": withdrawId },
//                 { "elem._id": updatedWithdraw?._id },
//                 { "elem._id": targetWithdrawIdStr },
//                 ...(mongoose.Types.ObjectId.isValid(withdrawId) ? [{ "elem._id": new mongoose.Types.ObjectId(withdrawId) }] : [])
//               ] 
//             }
//           ],
//           strict: false 
//         }
//       ).catch(() => {});
//     }

//     const message = String(status).toLowerCase() === 'rejected' 
//       ? 'সফলভাবে বাতিল করা হয়েছে এবং ব্যালেন্স রিফান্ড করা হয়েছে' 
//       : 'সফলভাবে কনফার্ম করা হয়েছে';

//     return NextResponse.json({ success: true, message }, { status: 200 });
//   } catch (error) {
//     console.error('ADMIN WITHDRAW PATCH ERROR:', error);
//     return NextResponse.json({ success: false, error: error.message }, { status: 500 });
//   }
// }

// .............................................................................


import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import Withdraw from '@/models/Withdraw';
import User from '@/models/User';
import { verifyAuth } from '@/utils/authCheck';

// ==========================================
// ✅ GET: Withdraw List আনতে
// ==========================================
export async function GET(request) {
  try {
    await clientPromise;

    const auth = await verifyAuth('admin');
    if (!auth.success) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }

    let withdraws = await Withdraw.find({}).lean();

    withdraws = withdraws.map(item => {
      let itemDate = item.createdAt || item.date || item.timestamp;
      if (!itemDate && item._id) {
        try {
          itemDate = new Date(parseInt(item._id.toString().substring(0, 8), 16) * 1000);
        } catch (e) {
          itemDate = new Date(0);
        }
      }
      return { ...item, createdAt: itemDate };
    });

    withdraws.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });

    return NextResponse.json({ success: true, withdraws }, { status: 200 });
  } catch (error) {
    console.error('Withdraw GET Error:', error);
    return NextResponse.json({
      success: false,
      withdraws: [],
      error: error.message
    }, { status: 500 });
  }
}

// ==========================================
// ✅ PATCH: Status + AdminNote আপডেট
// ==========================================
export async function PATCH(request) {
  try {
    await clientPromise;

    const auth = await verifyAuth('admin');
    if (!auth.success) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ success: false, message: 'Invalid JSON' }, { status: 400 });
    }

    const { withdrawId, status, adminNote } = body || {};

    if (!withdrawId) {
      return NextResponse.json({ success: false, message: 'Withdraw ID প্রয়োজন!' }, { status: 400 });
    }

    const cleanNote = typeof adminNote === 'string'
      ? adminNote.trim().slice(0, 200).replace(/[<>]/g, '')
      : '';

    // কেস ১: শুধু নোট আপডেট (status নেই)
    if (!status) {
      const updated = await Withdraw.findByIdAndUpdate(
        withdrawId,
        { $set: { adminNote: cleanNote } },
        { new: true }
      );

      if (!updated) {
        return NextResponse.json({ success: false, message: 'Withdraw not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: '✅ নোট আপডেট হয়েছে!',
        withdraw: updated
      }, { status: 200 });
    }

    // কেস ২: status সহ
    const VALID_STATUSES = ['pending', 'approved', 'rejected'];
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({
        success: false,
        message: 'Status must be pending, approved, or rejected'
      }, { status: 400 });
    }

    const updateData = { status };
    if (cleanNote) updateData.adminNote = cleanNote;

    const updatedWithdraw = await Withdraw.findOneAndUpdate(
      { _id: withdrawId, status: 'pending' },
      { $set: updateData },
      { new: true }
    );

    if (!updatedWithdraw) {
      const existing = await Withdraw.findById(withdrawId);
      if (!existing) {
        return NextResponse.json({ success: false, message: 'Withdraw not found' }, { status: 404 });
      }
      return NextResponse.json({
        success: false,
        message: `এই উইথড্র ইতিমধ্যে ${existing.status} অবস্থায় আছে!`
      }, { status: 409 });
    }

    // Rejected হলে refund
    if (status === 'rejected') {
      const targetUserId = updatedWithdraw.uid || updatedWithdraw.userId;
      const withdrawAmount = Number(updatedWithdraw.amount) || 0;
      const walletType = updatedWithdraw.walletType || 'main';

      if (targetUserId && withdrawAmount > 0) {
        try {
          const balanceField = walletType === 'referral' ? 'referralBalance' : 'balance';
          await User.findOneAndUpdate(
            { uid: targetUserId },
            { $inc: { [balanceField]: withdrawAmount } }
          );
        } catch (refundErr) {
          console.error('Refund error:', refundErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: status === 'rejected'
        ? '✅ উইথড্র বাতিল হয়েছে এবং ব্যালেন্স ফেরত দেওয়া হয়েছে'
        : '✅ উইথড্র কনফার্ম হয়েছে',
      withdraw: updatedWithdraw
    }, { status: 200 });

  } catch (error) {
    console.error('Withdraw PATCH Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Server Error'
    }, { status: 500 });
  }
}

// ==========================================
// ✅ POST: পুরনো approve/reject লজিক
// ==========================================
export async function POST(request) {
  try {
    await clientPromise;

    const auth = await verifyAuth('admin');
    if (!auth.success) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }

    const { withdrawId, action } = await request.json();

    if (!withdrawId || !action) {
      return NextResponse.json({ success: false, message: 'প্রয়োজনীয় তথ্য পাওয়া যায়নি।' }, { status: 400 });
    }

    const withdraw = await Withdraw.findById(withdrawId);
    if (!withdraw) {
      return NextResponse.json({ success: false, message: 'উইথড্র রিকোয়েস্ট খুঁজে পাওয়া যায়নি।' }, { status: 404 });
    }

    if (withdraw.status !== 'pending') {
      return NextResponse.json({ success: false, message: 'এই রিকোয়েস্টটি ইতিমধ্যে প্রসেস করা হয়েছে।' }, { status: 400 });
    }

    if (action === 'approve') {
      withdraw.status = 'approved';
      await withdraw.save();
      return NextResponse.json({ success: true, message: 'উইথড্র রিকোয়েস্ট সফলভাবে অ্যাপ্রুভ করা হয়েছে।' }, { status: 200 });
    }

    if (action === 'reject') {
      withdraw.status = 'rejected';
      await withdraw.save();

      if (withdraw.walletType === 'referral') {
        await User.findOneAndUpdate(
          { uid: withdraw.uid },
          { $inc: { referralBalance: withdraw.amount } }
        );
      } else {
        await User.findOneAndUpdate(
          { uid: withdraw.uid },
          { $inc: { balance: withdraw.amount } }
        );
      }

      return NextResponse.json({ success: true, message: 'উইথড্র রিকোয়েস্ট রিজেক্ট করা হয়েছে এবং ব্যালেন্স রিফান্ড করা হয়েছে।' }, { status: 200 });
    }

    return NextResponse.json({ success: false, message: 'সঠিক অ্যাকশন নির্বাচন করা হয়নি।' }, { status: 400 });
  } catch (error) {
    console.error('Admin Withdraw Action Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}