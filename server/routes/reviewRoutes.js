import express from "express";
import Review from "../models/Review.js";
import Maid from "../models/Maid.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, allowRoles("customer"), async (req, res) => {
  try {
    const { maidId, rating, comment } = req.body;
    const review = await Review.create({ customer: req.user._id, maid: maidId, rating, comment });
    const reviews = await Review.find({ maid: maidId });
    const avg = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;
    await Maid.findByIdAndUpdate(maidId, { rating: Math.round(avg * 10) / 10, reviewCount: reviews.length });
    res.status(201).json(review);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

export default router;
