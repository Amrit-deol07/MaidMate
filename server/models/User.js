import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["customer", "maid", "admin"], default: "customer" },
  phone: { type: String, default: "" },
  address: {
    addressLine: { type: String, default: "" },
    area: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    pincode: { type: String, default: "" },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null }
  },
  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  emailOtp: { type: String, default: "" },
  phoneOtp: { type: String, default: "" },
  otpExpiresAt: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
