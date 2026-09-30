import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomInt } from "crypto";
import multer from "multer";
import path from "path";
import fs from "fs";
import User from "../models/User.js";
import Maid from "../models/Maid.js";
import { sendOTPEmail } from "../utils/email.js";

const router = express.Router();
const uploadDir = path.resolve("uploads");
fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(file.originalname).toLowerCase()}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (_, file, cb) => {
  const ok = ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype);
  cb(ok ? null : new Error("Only JPG, PNG and WEBP images are allowed"), ok);
}});

const tokenFor = user => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
const makeOtp = () => String(randomInt(100000, 1000000));
const userData = user => ({
  id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone,
  emailVerified: user.emailVerified, phoneVerified: user.phoneVerified, address: user.address || {}
});

async function sendBothOtps(user) {
  const emailOtp = makeOtp();
  const phoneOtp = makeOtp();
  user.emailOtp = emailOtp;
  user.phoneOtp = phoneOtp;
  user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();
  await sendOTPEmail(user.email, emailOtp);
  console.log(`Phone OTP for ${user.phone}: ${phoneOtp}`);
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, role = "customer", addressLine, area, city, state, pincode, latitude, longitude } = req.body;
    if (!name || !email || !password || !phone || !addressLine || !area || !city || !state || !pincode) return res.status(400).json({ message: "Name, email, phone, password and complete address are required" });
    if (role !== "customer") return res.status(400).json({ message: "Use the Maid registration page for maid accounts" });
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({
      name, email: email.toLowerCase(), password: await bcrypt.hash(password, 10), phone, role: "customer",
      emailVerified: false, phoneVerified: false, emailOtp: makeOtp(), phoneOtp: makeOtp(),
      address: { addressLine, area, city, state, pincode, latitude: latitude === "" || latitude === undefined ? null : Number(latitude), longitude: longitude === "" || longitude === undefined ? null : Number(longitude) },
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });
    try {
      await sendOTPEmail(user.email, user.emailOtp);
    } catch (mailError) {
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({ message: `Could not send verification email: ${mailError.message}` });
    }
    console.log(`Phone OTP for ${user.phone}: ${user.phoneOtp}`);
    res.status(201).json({ message: "Verification email sent", email: user.email, phone: user.phone });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post("/register-maid", upload.single("photo"), async (req, res) => {
  try {
    const { name, email, password, phone, location, workLocations, experience, monthlyPrice, services, about, latitude, longitude } = req.body;
    if (!name || !email || !password || !phone || !location || !workLocations || !experience || !monthlyPrice || !about || !req.file) {
      return res.status(400).json({ message: "Please fill all maid details and upload a profile image" });
    }
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({
      name, email: email.toLowerCase(), password: await bcrypt.hash(password, 10), phone, role: "maid",
      emailVerified: false, phoneVerified: false, emailOtp: makeOtp(), phoneOtp: makeOtp(),
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });
    const serviceList = Array.isArray(services) ? services : String(services || "").split(",").map(s => s.trim()).filter(Boolean);
    const maid = await Maid.create({
      user: user._id, name, photo: `http://localhost:${process.env.PORT || 5000}/uploads/${req.file.filename}`, location,
      workLocations: String(workLocations).split(",").map(s=>s.trim()).filter(Boolean),
      latitude: latitude === "" || latitude === undefined ? null : Number(latitude),
      longitude: longitude === "" || longitude === undefined ? null : Number(longitude),
      experience: Number(experience), monthlyPrice: Number(monthlyPrice), services: serviceList,
      about, timeSlots: []
    });
    try {
      await sendOTPEmail(user.email, user.emailOtp);
    } catch (mailError) {
      await Maid.findByIdAndDelete(maid._id);
      await User.findByIdAndDelete(user._id);
      try { fs.unlinkSync(req.file.path); } catch {}
      return res.status(500).json({ message: `Could not send verification email: ${mailError.message}` });
    }
    console.log(`Phone OTP for ${user.phone}: ${user.phoneOtp}`);
    res.status(201).json({ message: "Maid account created. Verify email and phone.", email: user.email });
  } catch (e) {
    if (req.file?.path) { try { fs.unlinkSync(req.file.path); } catch {} }
    res.status(500).json({ message: e.message });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, emailOtp, phoneOtp, purpose = "registration" } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) return res.status(404).json({ message: "Account not found" });
    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) return res.status(400).json({ message: "OTP expired. Please resend OTP" });
    if (user.emailOtp !== emailOtp) return res.status(400).json({ message: "Invalid email OTP" });
    if (user.phoneOtp !== phoneOtp) return res.status(400).json({ message: "Invalid phone OTP" });

    if (purpose === "registration") {
      user.emailVerified = true;
      user.phoneVerified = true;
    }
    user.emailOtp = "";
    user.phoneOtp = "";
    user.otpExpiresAt = null;
    await user.save();
    res.json({ message: purpose === "login" ? "Login OTP verified successfully" : "Email and phone verified successfully", token: tokenFor(user), user: userData(user) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) return res.status(404).json({ message: "Account not found" });
    if (user.emailVerified && user.phoneVerified && user.role !== "maid") return res.status(400).json({ message: "Account already verified" });
    try {
      await sendBothOtps(user);
    } catch (mailError) {
      return res.status(500).json({ message: `Could not send verification email: ${mailError.message}` });
    }
    res.json({ message: "New verification email sent. Phone OTP is available in the server terminal for demo testing." });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password, role = "customer" } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: "Invalid email or password" });
    if (!["customer", "maid", "admin"].includes(role)) return res.status(400).json({ message: "Invalid login role" });
    if (user.role !== role) return res.status(403).json({ message: `This account is registered as a ${user.role}. Please use the ${user.role} login page.` });

    if (user.role === "customer" && (!user.emailVerified || !user.phoneVerified)) {
      return res.status(403).json({ message: "Please verify your email and phone number before login" });
    }
    if (user.role === "maid") {
      if (!user.emailVerified || !user.phoneVerified) return res.status(403).json({ message: "Please complete maid registration verification before login" });
      return res.json({ token: tokenFor(user), user: userData(user) });
    }
    res.json({ token: tokenFor(user), user: userData(user) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

export default router;
