import mongoose from 'mongoose';

const WithdrawSchema = new mongoose.Schema({
  uid: { type: String, required: true },
  amount: { type: Number, required: true },
  accountNumber: { type: String, required: true },
  method: { type: String, required: true },
  
  // 👉 নতুন ফিল্ড: ওয়ালেট টাইপ ('main' অথবা 'referral')
  walletType: { type: String, default: 'main' }, 
  
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminNote: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.Withdraw || mongoose.model('Withdraw', WithdrawSchema);