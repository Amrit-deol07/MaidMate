import mongoose from "mongoose";

const workSessionSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  maid: { type: mongoose.Schema.Types.ObjectId, ref: "Maid", required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true },
  timeSlot: { type: String, required: true },
  status: { type: String, enum: ["pending_approval", "working", "completed", "rejected"], default: "pending_approval" },
  faceDetected: { type: Boolean, default: false },
  faceMatched: { type: Boolean, default: false },
  faceSimilarity: { type: Number, default: 0 },
  faceDistance: { type: Number, default: null },
  faceSnapshot: { type: String, default: "" },
  faceCheckAt: { type: Date, default: Date.now },
  customerDecisionAt: { type: Date, default: null },
  startTime: { type: Date, default: null },
  endTime: { type: Date, default: null },
  durationMinutes: { type: Number, default: 0 },
  rejectionReason: { type: String, default: "" }
}, { timestamps: true });

workSessionSchema.index({ booking: 1, date: 1 }, { unique: true });
export default mongoose.model("WorkSession", workSessionSchema);
