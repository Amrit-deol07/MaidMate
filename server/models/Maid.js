import mongoose from "mongoose";

const maidSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  photo: { type: String, default: "https://i.pravatar.cc/300?img=47" },
  location: { type: String, default: "Greater Noida" },
  workLocations: [{ type: String }],
  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null },
  experience: { type: Number, default: 1 },
  monthlyPrice: { type: Number, required: true },
  services: [{ type: String }],
  rating: { type: Number, default: 5 },
  reviewCount: { type: Number, default: 0 },
  about: { type: String, default: "" },
  timeSlots: [{ type: String }],
  verified: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("Maid", maidSchema);
