import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  maid: { type: mongoose.Schema.Types.ObjectId, ref: "Maid", required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, default: "" }
}, { timestamps: true });

export default mongoose.model("Review", reviewSchema);
