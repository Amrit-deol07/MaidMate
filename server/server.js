import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import maidRoutes from "./routes/maidRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import maidDashboardRoutes from "./routes/maidDashboardRoutes.js";
import workRoutes from "./routes/workRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import path from "path";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.resolve("uploads")));

app.get("/", (_, res) => res.json({ message: "MaidMate API is running" }));
app.use("/api/auth", authRoutes);
app.use("/api/maids", maidRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/maid-dashboard", maidDashboardRoutes);
app.use("/api/work", workRoutes);
app.use("/api/users", userRoutes);

const port = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(port, () => console.log(`API running on http://localhost:${port}`)))
  .catch(err => { console.error("MongoDB connection failed:", err.message); process.exit(1); });
