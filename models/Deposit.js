import mongoose from 'mongoose';

const DepositSchema = new mongoose.Schema({
  uid: { type: String, required: true },
  amount: { type: Number, required: true },
  method: { type: String, required: true },
  transactionId: { type: String, required: true, unique: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminNote: { type: String, default: '' }, // অ্যাডমিনের নোট
}, { timestamps: true });

export default mongoose.models.Deposit || mongoose.model('Deposit', DepositSchema);