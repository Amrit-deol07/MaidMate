import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";
import Maid from "./models/Maid.js";
import Booking from "./models/Booking.js";
import WorkSession from "./models/WorkSession.js";
import WalletTransaction from "./models/WalletTransaction.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

// Demo seed: clears existing demo database records and recreates sample accounts.
await User.deleteMany({});
await Maid.deleteMany({});
await Booking.deleteMany({});
await WorkSession.deleteMany({});
await WalletTransaction.deleteMany({});

const customerPass = await bcrypt.hash("password123", 10);
const customerPass2 = await bcrypt.hash("user123", 10);
const adminPass = await bcrypt.hash("admin123", 10);
const maidPass = await bcrypt.hash("maid123", 10);

await User.create({ name: "Demo Customer", email: "customer@example.com", password: customerPass, role: "customer", phone: "9876543210", address:{addressLine:"Demo Street 1",area:"Alpha 1",city:"Greater Noida",state:"Uttar Pradesh",pincode:"201310",latitude:28.4744,longitude:77.5040}, emailVerified: true, phoneVerified: true });
await User.create({ name: "Rahul Kumar", email: "rahul@example.com", password: customerPass2, role: "customer", phone: "9876543211", address:{addressLine:"Demo Street 2",area:"Sector 62",city:"Noida",state:"Uttar Pradesh",pincode:"201309",latitude:28.6271,longitude:77.3733}, emailVerified: true, phoneVerified: true });
await User.create({ name: "MaidMate Admin", email: "admin@example.com", password: adminPass, role: "admin", phone: "9876543200", emailVerified: true, phoneVerified: true });

const maidUsers = await User.insertMany([
  { name: "Priya Sharma", email: "priya@example.com", password: maidPass, role: "maid", phone: "9876500001", emailVerified: true, phoneVerified: true },
  { name: "Neha Verma", email: "neha@example.com", password: maidPass, role: "maid", phone: "9876500002", emailVerified: true, phoneVerified: true },
  { name: "Simran Kaur", email: "simran@example.com", password: maidPass, role: "maid", phone: "9876500003", emailVerified: true, phoneVerified: true },
  { name: "Anjali Singh", email: "anjali@example.com", password: maidPass, role: "maid", phone: "9876500004", emailVerified: true, phoneVerified: true }
]);

const maids = await Maid.insertMany([
  { user: maidUsers[0]._id, name: "Priya Sharma", photo: "https://i.pravatar.cc/500?img=47", location: "Greater Noida", experience: 5, monthlyPrice: 12000, workLocations:["Greater Noida","Alpha 1","Beta 1"], latitude:28.4744, longitude:77.5040, services: ["Cleaning", "Cooking", "Laundry"], rating: 4.8, reviewCount: 124, about: "Experienced and verified household professional with 5 years of experience.", timeSlots: ["7:00 AM - 10:00 AM", "10:00 AM - 1:00 PM"] },
  { user: maidUsers[1]._id, name: "Neha Verma", photo: "https://i.pravatar.cc/500?img=44", location: "Noida", experience: 3, monthlyPrice: 9500, workLocations:["Noida","Sector 62","Sector 61"], latitude:28.6271, longitude:77.3733, services: ["Cleaning", "Laundry", "Baby Care"], rating: 4.6, reviewCount: 87, about: "Reliable professional for daily home cleaning and laundry.", timeSlots: ["8:00 AM - 11:00 AM", "5:00 PM - 8:00 PM"] },
  { user: maidUsers[2]._id, name: "Simran Kaur", photo: "https://i.pravatar.cc/500?img=49", location: "Greater Noida", experience: 7, monthlyPrice: 15000, workLocations:["Greater Noida","Knowledge Park","Alpha 2"], latitude:28.4595, longitude:77.5028, services: ["Cooking", "Cleaning", "Elder Care"], rating: 4.9, reviewCount: 201, about: "Highly rated professional specializing in cooking and complete household support.", timeSlots: ["6:30 AM - 9:30 AM", "4:00 PM - 7:00 PM"] },
  { user: maidUsers[3]._id, name: "Anjali Singh", photo: "https://i.pravatar.cc/500?img=32", location: "Noida", experience: 4, monthlyPrice: 11000, workLocations:["Noida","Sector 18","Sector 15"], latitude:28.5706, longitude:77.3219, services: ["Cleaning", "Cooking", "Baby Care"], rating: 4.7, reviewCount: 96, about: "Friendly and dependable professional with experience in household cleaning and cooking.", timeSlots: ["9:00 AM - 12:00 PM", "2:00 PM - 5:00 PM"] }
]);

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const startDate = tomorrow.toISOString().slice(0, 10);
const customer1 = await User.findOne({ email: "customer@example.com" });
const customer2 = await User.findOne({ email: "rahul@example.com" });
await Booking.create([
  { customer: customer1._id, maid: maids[0]._id, startDate, timeSlot: "7:00 AM - 10:00 AM", services: ["Cleaning", "Cooking"], monthlyPrice: 12000, platformFee: 499, totalAmount: 12499, status: "confirmed", paymentStatus: "paid" },
  { customer: customer2._id, maid: maids[1]._id, startDate, timeSlot: "8:00 AM - 11:00 AM", services: ["Cleaning", "Laundry"], monthlyPrice: 9500, platformFee: 499, totalAmount: 9999, status: "confirmed", paymentStatus: "paid" }
]);
console.log(`Demo bookings created with start date ${startDate}.`);

console.log("Seed complete.");
console.log("Customer 1: customer@example.com / password123");
console.log("Customer 2: rahul@example.com / user123");
console.log("Admin: admin@example.com / admin123");
console.log("Maids: priya@example.com, neha@example.com, simran@example.com, anjali@example.com / maid123");
console.log("Maid login does NOT require OTP after registration verification.");
await mongoose.disconnect();
