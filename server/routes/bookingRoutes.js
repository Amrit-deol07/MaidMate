import express from "express";
import Booking from "../models/Booking.js";
import Maid from "../models/Maid.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, allowRoles("customer"), async (req, res) => {
  try {
    const { maidId, startDate, timeSlot, services = [] } = req.body;
    const maid = await Maid.findById(maidId);
    if (!maid) return res.status(404).json({ message: "Maid not found" });
    const platformFee = 499;
    const totalAmount = maid.monthlyPrice + platformFee;
    const booking = await Booking.create({
      customer: req.user._id, maid: maid._id, startDate, timeSlot, services,
      monthlyPrice: maid.monthlyPrice, platformFee, totalAmount
    });
    res.status(201).json(await booking.populate("maid"));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get("/my", protect, allowRoles("customer"), async (req, res) => {
  try {
    res.json(await Booking.find({ customer: req.user._id }).populate("maid").sort({ createdAt: -1 }));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.patch("/:id/pay", protect, allowRoles("customer"), async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, customer: req.user._id });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    booking.paymentStatus = "paid";
    booking.status = "confirmed";
    await booking.save();
    res.json(booking);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.patch("/:id/cancel", protect, allowRoles("customer"), async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, customer: req.user._id });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    booking.status = "cancelled";
    await booking.save();
    res.json(booking);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

export default router;
