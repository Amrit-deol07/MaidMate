import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Maid from "../models/Maid.js";
import Booking from "../models/Booking.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = express.Router();
router.use(protect, allowRoles("maid"));
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

router.get("/profile", async (req, res) => {
  const maid = await Maid.findOne({ user: req.user._id }).populate("user", "name email phone");
  if (!maid) return res.status(404).json({ message: "Maid profile not found" });
  res.json(maid);
});

router.patch("/profile", upload.single("photo"), async (req, res) => {
  try {
    const maid = await Maid.findOne({ user: req.user._id });
    if (!maid) return res.status(404).json({ message: "Maid profile not found" });
    const { name, phone, location, workLocations, experience, monthlyPrice, services, about, latitude, longitude } = req.body;
    if (name) { maid.name = name; req.user.name = name; }
    if (phone) req.user.phone = phone;
    if (location) maid.location = location;
    if (workLocations !== undefined) maid.workLocations = String(workLocations).split(",").map(s=>s.trim()).filter(Boolean);
    if (latitude !== undefined) maid.latitude = latitude === "" ? null : Number(latitude);
    if (longitude !== undefined) maid.longitude = longitude === "" ? null : Number(longitude);
    if (experience !== undefined) maid.experience = Number(experience);
    if (monthlyPrice !== undefined) maid.monthlyPrice = Number(monthlyPrice);
    if (services !== undefined) maid.services = String(services).split(",").map(s=>s.trim()).filter(Boolean);
    if (about !== undefined) maid.about = about;
    if (req.file) maid.photo = `http://localhost:${process.env.PORT || 5000}/uploads/${req.file.filename}`;
    await req.user.save();
    await maid.save();
    res.json(maid);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get("/bookings", async (req, res) => {
  const maid = await Maid.findOne({ user: req.user._id });
  if (!maid) return res.status(404).json({ message: "Maid profile not found" });
  res.json(await Booking.find({ maid: maid._id }).populate("customer", "name email phone").populate("maid", "name").sort({ createdAt: -1 }));
});

router.patch("/bookings/:id/status", async (req, res) => {
  const maid = await Maid.findOne({ user: req.user._id });
  if (!maid) return res.status(404).json({ message: "Maid profile not found" });
  if (!["confirmed", "completed", "cancelled"].includes(req.body.status)) return res.status(400).json({ message: "Invalid status" });
  const booking = await Booking.findOneAndUpdate({ _id: req.params.id, maid: maid._id }, { status: req.body.status }, { new: true }).populate("customer", "name email phone").populate("maid", "name");
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  res.json(booking);
});

router.patch("/profile/availability", async (req, res) => {
  const { timeSlots } = req.body;
  if (!Array.isArray(timeSlots)) return res.status(400).json({ message: "timeSlots must be an array" });
  const maid = await Maid.findOneAndUpdate({ user: req.user._id }, { timeSlots }, { new: true });
  if (!maid) return res.status(404).json({ message: "Maid profile not found" });
  res.json(maid);
});

export default router;
