import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

export async function sendOTPEmail(email, otp) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Gmail is not configured. Add EMAIL_USER and EMAIL_PASS to server/.env");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"MaidMate" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "MaidMate - Email Verification OTP",
    text: `Your MaidMate email verification OTP is ${otp}. It is valid for 10 minutes.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;border:1px solid #eee;border-radius:12px">
        <h2 style="margin-top:0">MaidMate Email Verification</h2>
        <p>Use the OTP below to verify your email address:</p>
        <div style="font-size:32px;font-weight:700;letter-spacing:8px;padding:18px 0">${otp}</div>
        <p>This OTP is valid for <b>10 minutes</b>.</p>
        <p style="color:#666">If you did not create a MaidMate account, you can safely ignore this email.</p>
      </div>
    `
  });
}
