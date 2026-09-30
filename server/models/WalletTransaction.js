import mongoose from "mongoose";

const walletTransactionSchema = new mongoose.Schema({
  maid: { type: mongoose.Schema.Types.ObjectId, ref: "Maid", required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  month: { type: String, required: true },
  type: { type: String, enum: ["earning", "deduction", "payout"], required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("WalletTransaction", walletTransactionSchema);
