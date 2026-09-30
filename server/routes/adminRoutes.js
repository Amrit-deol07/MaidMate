import express from "express";
import User from "../models/User.js";
import Maid from "../models/Maid.js";
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";
import SupportMessage from "../models/SupportMessage.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = express.Router();
router.use(protect, allowRoles("admin"));

router.get("/stats", async (_, res) => {
  const [customers, maids, bookings, paidAgg, pendingBookings] = await Promise.all([
    User.countDocuments({ role: "customer" }),
    User.countDocuments({ role: "maid" }),
    Booking.countDocuments(),
    Booking.aggregate([{ $match: { paymentStatus: "paid" } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
    Booking.countDocuments({ status: "pending" })
  ]);
  res.json({ customers, maids, bookings, paidRevenue: paidAgg[0]?.total || 0, pendingBookings });
});

router.get("/customers", async (_, res) => {
  res.json(await User.find({ role: "customer" }).select("-password").sort({ createdAt: -1 }));
});

router.get("/maids", async (_, res) => {
  res.json(await Maid.find().populate("user", "name email phone").sort({ createdAt: -1 }));
});

router.get("/bookings", async (_, res) => {
  res.json(await Booking.find()
    .populate("customer", "name email phone")
    .populate("maid", "name location monthlyPrice")
    .sort({ createdAt: -1 }));
});

router.get("/reviews", async (_, res) => {
  res.json(await Review.find()
    .populate("customer", "name email")
    .populate("maid", "name")
    .sort({ createdAt: -1 }));
});

router.get("/support", async (_, res) => {
  res.json(await SupportMessage.find()
    .populate("user", "name email role")
    .sort({ createdAt: -1 }));
});

router.patch("/bookings/:id/status", async (req, res) => {
  const allowed = ["pending", "confirmed", "completed", "cancelled"];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ message: "Invalid booking status" });
  const booking = await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })
    .populate("customer", "name email").populate("maid", "name");
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  res.json(booking);
});

router.delete("/maids/:id", async (req, res) => {
  const maid = await Maid.findById(req.params.id);
  if (!maid) return res.status(404).json({ message: "Maid not found" });
  await User.findByIdAndDelete(maid.user);
  await Maid.findByIdAndDelete(maid._id);
  res.json({ message: "Maid removed" });
});

export default router;
