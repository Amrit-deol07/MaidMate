import express from "express";
import SupportMessage from "../models/SupportMessage.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  res.json(await SupportMessage.find({ user: req.user._id }).sort({ createdAt: 1 }));
});

router.post("/", protect, async (req, res) => {
  const customer = await SupportMessage.create({ user: req.user._id, sender: "customer", message: req.body.message });
  const auto = await SupportMessage.create({
    user: req.user._id,
    sender: "support",
    message: "Thanks for contacting MaidMate support. Our team will get back to you shortly. For urgent help, call +91 1800-123-4567."
  });
  res.status(201).json([customer, auto]);
});

export default router;
