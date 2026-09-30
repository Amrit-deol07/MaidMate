# MaidMate - MERN Maid Booking Website

A ready-to-run MERN-style maid booking project with:
- Customer registration/login (demo JWT auth)
- Maid listings, search/filter
- Maid profiles and ratings/reviews
- Monthly booking with time slots
- Monthly payment summary (demo payment flow)
- Customer dashboard and booking history
- Customer support chatbox/ticket-style messages
- Admin-ready backend structure

## Requirements
- Node.js 18+
- MongoDB running locally OR a MongoDB Atlas connection string

## 1. Backend
Open a terminal:
```bash
cd server
npm install
copy .env.example .env
npm run seed
npm run dev
```
On macOS/Linux use:
```bash
cp .env.example .env
```

Backend: http://localhost:5000

## 2. Frontend
Open another terminal:
```bash
cd client
npm install
npm run dev
```

Frontend: http://localhost:5173

## MongoDB
Default local database:
mongodb://127.0.0.1:27017/maidmate

If using Atlas, put your URI in `server/.env`.

## Demo accounts
After running seed:
Customer:
- Email: customer@example.com
- Password: password123

Admin:
- Email: admin@example.com
- Password: admin123

Maid accounts:
- priya@example.com / maid123
- neha@example.com / maid123
- simran@example.com / maid123

## Important
The payment page is a DEMO payment flow. It does not charge a real card/UPI account.
To accept real payments, connect the Razorpay backend SDK and configure Razorpay keys.


## Role-based dashboards
- Admin: `admin@example.com` / `admin123` — platform management panel
- Customer: `customer@example.com` / `password123` — booking and payment dashboard
- Maid: `priya@example.com` / `maid123` (also Neha/Simran) — maid partner portal

Admin and maid APIs are protected by server-side role checks. Customer booking/payment/review APIs are customer-only.

## Real Gmail OTP setup

New customer registration sends the email OTP through Gmail SMTP using Nodemailer. Phone OTP remains demo-only and is printed in the backend terminal.

1. In the Google account used for sending mail, enable 2-Step Verification.
2. Create a Google App Password for MaidMate. Do not use your normal Gmail password.
3. In `server`, copy `.env.example` to `.env`.
4. Set `EMAIL_USER` to the sender Gmail address and `EMAIL_PASS` to the 16-character Google App Password.
5. Run `npm install` and then `npm run dev` in `server`.
6. Register a new customer and check the Gmail inbox for the 6-digit OTP.

Never commit `server/.env` or any real App Password/API key to GitHub.


### Separate login pages
- Customer: `/customer-login`
- Maid: `/maid-login`
- Admin: `/admin-login`
- `/login` shows all three options.

## Maid features
- Separate maid login page with email + phone OTP on every maid login.
- Separate maid registration with profile details and profile image upload.
- Maid can edit profile details and replace profile image.
- Maid can add/remove her own available time slots from the Maid Portal.
- Customers can book the slots published by the maid.
- Phone OTP is shown in the server terminal for this demo; email OTP is sent through Gmail SMTP.

## Daily work verification, attendance and maid wallet

The app now includes a demo daily work-control flow:

1. The booking start date becomes the maid's work start date.
2. The maid follows the same saved time slot every working day.
3. Sunday is automatically a weekly holiday and is not deducted.
4. On a working day, the maid opens **Today's Work**, allows camera access and sends a live face-verification snapshot.
5. The customer sees the maid's profile photo and the live verification snapshot and must explicitly **Allow work** or **Reject** it.
6. The work timer starts only after customer approval.
7. The maid stops the timer when work is finished and the day is recorded as worked.
8. Missed non-Sunday days are treated as absences in the monthly calculation and reduce the payable amount proportionally.
9. The customer can see worked days, Sunday holidays, deductions and the current payable amount.
10. Monthly settlement adds the payable amount to the maid's in-app wallet.

### Face verification note

This local demo uses the browser camera and, where the browser supports the native `FaceDetector` API, checks that one face is visible. The customer then visually compares the live snapshot with the maid's profile photo and gives the final approval. This is **not a biometric identity-matching system**. For production identity verification, integrate a dedicated face-recognition/liveness service and follow applicable privacy/consent requirements.

### Demo work booking

`npm run seed` also creates two paid/confirmed demo bookings starting on the next calendar day so the daily work flow can be tested. The seed command clears demo users, maids, bookings, work sessions and wallet transactions before recreating them.

## Face recognition demo
The daily maid work-start flow now performs actual face comparison in the browser using face-api.js. It compares the live camera face against the maid's registered profile photo. A single clear face must be detected and the similarity must pass the matching threshold before a verification request can be sent to the customer. The customer still has to approve the request before the work timer starts.

The face-recognition library/model files are loaded from the jsDelivr CDN, so the browser needs internet access for the first model load. Camera permission is also required. This is a functional demo implementation; for production identity verification, use a vetted liveness/biometric provider and server-side verification rather than trusting browser-supplied match results.
