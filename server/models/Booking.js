import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  maid: { type: mongoose.Schema.Types.ObjectId, ref: "Maid", required: true },
  startDate: { type: String, required: true },
  timeSlot: { type: String, required: true },
  services: [{ type: String }],
  monthlyPrice: { type: Number, required: true },
  platformFee: { type: Number, default: 499 },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ["pending", "confirmed", "completed", "cancelled"], default: "pending" },
  paymentStatus: { type: String, enum: ["unpaid", "paid"], default: "unpaid" }
}, { timestamps: true });

export default mongoose.model("Booking", bookingSchema);
