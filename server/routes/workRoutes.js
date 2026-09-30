import express from "express";
import WorkSession from "../models/WorkSession.js";
import WalletTransaction from "../models/WalletTransaction.js";
import Booking from "../models/Booking.js";
import Maid from "../models/Maid.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = express.Router();

const dateOnly = d => new Date(`${d}T00:00:00`);
const isoDate = d => d.toISOString().slice(0,10);
const isSunday = d => dateOnly(d).getDay() === 0;
const daysInMonth = (year, month) => new Date(year, month, 0).getDate();
const workingDaysInMonth = (year, month) => {
  let count = 0; for (let day=1; day<=daysInMonth(year,month); day++) if(new Date(year,month-1,day).getDay()!==0) count++;
  return count;
};
const dailyRate = (monthlyPrice, year, month) => monthlyPrice / workingDaysInMonth(year, month);

async function getBookingForMaid(req, id) {
  const maid = await Maid.findOne({ user: req.user._id });
  if (!maid) return { maid: null, booking: null };
  const booking = await Booking.findOne({ _id:id, maid:maid._id, status:"confirmed", paymentStatus:"paid" }).populate("customer", "name email phone").populate("maid", "name monthlyPrice timeSlots");
  return { maid, booking };
}

router.get("/today", protect, allowRoles("maid"), async (req,res)=>{
  try {
    const maid = await Maid.findOne({ user:req.user._id });
    const date = req.query.date || isoDate(new Date());
    const bookings = await Booking.find({ maid: maid._id, status:{ $in:["confirmed","completed"] }, startDate:{ $lte:date } }).populate("customer","name email phone");
    const sessions = await WorkSession.find({ maid:maid._id, date }).populate("customer","name email").populate("booking","startDate timeSlot monthlyPrice");
    res.json({ date, isSunday:isSunday(date), bookings, sessions });
  } catch(e){ res.status(500).json({message:e.message}); }
});

router.post("/start-request", protect, allowRoles("maid"), async (req,res)=>{
  try {
    const { bookingId, faceDetected=false, faceMatched=false, faceSimilarity=0, faceDistance=null, faceSnapshot="" } = req.body;
    const { maid, booking } = await getBookingForMaid(req, bookingId);
    if(!booking) return res.status(404).json({message:"Booking not found"});
    const today = isoDate(new Date());
    if(booking.startDate > today) return res.status(400).json({message:`Your work starts on ${booking.startDate}.`});
    if(isSunday(today)) return res.status(400).json({message:"Sunday is a weekly holiday. You do not need to start the timer today."});
    if(!faceDetected) return res.status(400).json({message:"No single face was detected. Please face the camera clearly and try again."});
    const existing = await WorkSession.findOne({ booking:booking._id, date:today });
    if(existing && ["pending_approval","working","completed"].includes(existing.status)) return res.status(400).json({message:`Today's work status is ${existing.status.replace("_"," ")}.`});
    const session = await WorkSession.findOneAndUpdate(
      { booking:booking._id, date:today },
      { booking:booking._id, maid:maid._id, customer:booking.customer._id, date:today, timeSlot:booking.timeSlot, status:"pending_approval", faceDetected:Boolean(faceDetected), faceMatched:Boolean(faceMatched), faceSimilarity:Number(faceSimilarity)||0, faceDistance:faceDistance===null?null:Number(faceDistance), faceSnapshot:String(faceSnapshot||"").slice(0, 120000), faceCheckAt:new Date(), rejectionReason:"" },
      { upsert:true, new:true, setDefaultsOnInsert:true }
    );
    res.status(201).json(session);
  } catch(e){ res.status(500).json({message:e.message}); }
});

router.get("/maid-sessions", protect, allowRoles("maid"), async(req,res)=>{
  try { const maid=await Maid.findOne({user:req.user._id}); res.json(await WorkSession.find({maid:maid._id}).populate("customer","name email").populate("booking","startDate monthlyPrice").sort({date:-1}).limit(60)); }
  catch(e){res.status(500).json({message:e.message});}
});

router.post("/stop", protect, allowRoles("maid"), async(req,res)=>{
  try {
    const maid=await Maid.findOne({user:req.user._id});
    const session=await WorkSession.findOne({ _id:req.body.sessionId, maid:maid._id });
    if(!session) return res.status(404).json({message:"Work session not found"});
    if(session.status!=="working") return res.status(400).json({message:"This work session is not active."});
    session.endTime=new Date(); session.durationMinutes=Math.max(0,Math.round((session.endTime-session.startTime)/60000)); session.status="completed"; await session.save();
    res.json(session);
  } catch(e){res.status(500).json({message:e.message});}
});

router.get("/wallet", protect, allowRoles("maid"), async(req,res)=>{
  try {
    const maid=await Maid.findOne({user:req.user._id});
    const tx=await WalletTransaction.find({maid:maid._id}).populate("customer","name").populate("booking","startDate").sort({date:-1});
    const balance=tx.reduce((sum,x)=>sum+(x.type==="earning"?x.amount:x.type==="deduction"?-x.amount:-x.amount),0);
    res.json({balance, transactions:tx});
  } catch(e){res.status(500).json({message:e.message});}
});

router.get("/customer-requests", protect, allowRoles("customer"), async(req,res)=>{
  try { const rows=await WorkSession.find({customer:req.user._id,status:"pending_approval"}).populate("maid","name photo monthlyPrice").populate("booking","startDate timeSlot").sort({createdAt:-1}); res.json(rows); }
  catch(e){res.status(500).json({message:e.message});}
});

router.get("/customer-live", protect, allowRoles("customer"), async(req,res)=>{
  try {
    const rows=await WorkSession.find({customer:req.user._id,status:"working"}).populate("maid","name photo").populate("booking","startDate timeSlot monthlyPrice").sort({startTime:-1});
    res.json(rows);
  } catch(e){res.status(500).json({message:e.message});}
});

router.patch("/customer-requests/:id", protect, allowRoles("customer"), async(req,res)=>{
  try {
    const session=await WorkSession.findOne({_id:req.params.id,customer:req.user._id});
    if(!session) return res.status(404).json({message:"Verification request not found"});
    if(session.status!=="pending_approval") return res.status(400).json({message:"This request is no longer waiting for approval."});
    const approve=req.body.approve===true;
    session.customerDecisionAt=new Date();
    if(approve){ session.status="working"; session.startTime=new Date(); }
    else { session.status="rejected"; session.rejectionReason=req.body.reason||"Customer did not approve today's face verification."; }
    await session.save();
    res.json(session);
  } catch(e){res.status(500).json({message:e.message});}
});

router.get("/attendance/:bookingId", protect, async(req,res)=>{
  try {
    const booking=await Booking.findById(req.params.bookingId).populate("maid","name monthlyPrice");
    if(!booking) return res.status(404).json({message:"Booking not found"});
    const allowed=req.user.role==="maid" ? String(booking.maid._id)===String((await Maid.findOne({user:req.user._id}))?._id) : String(booking.customer)===String(req.user._id);
    if(!allowed) return res.status(403).json({message:"Not allowed"});
    const month=req.query.month || new Date().toISOString().slice(0,7);
    const [y,m]=month.split("-").map(Number);
    const endDay=Math.min(new Date(y,m,0).getDate(), new Date().getMonth()+1===m && new Date().getFullYear()===y ? new Date().getDate() : new Date(y,m,0).getDate());
    const sessions=await WorkSession.find({booking:booking._id,date:{$gte:`${month}-01`,$lte:`${month}-${String(endDay).padStart(2,"0")}`}}).sort({date:1});
    const map=new Map(sessions.map(s=>[s.date,s]));
    const rows=[]; let worked=0, absent=0, holiday=0;
    const start=new Date(`${booking.startDate}T00:00:00`);
    for(let day=1;day<=endDay;day++){
      const d=new Date(y,m-1,day); const ds=`${month}-${String(day).padStart(2,"0")}`;
      if(d<start) continue;
      if(d.getDay()===0){rows.push({date:ds,status:"holiday"});holiday++;continue;}
      const s=map.get(ds);
      if(s?.status==="working"||s?.status==="completed"){rows.push({date:ds,status:s.status,durationMinutes:s.durationMinutes});worked++;}
      else if(s?.status==="rejected"){rows.push({date:ds,status:"absent",reason:"Face verification was not approved."});absent++;}
      else if(d<new Date(new Date().toDateString())){rows.push({date:ds,status:"absent",reason:"No work session recorded."});absent++;}
      else rows.push({date:ds,status:"scheduled"});
    }
    const rate=dailyRate(booking.monthlyPrice,y,m); const earned=worked*rate; const deduction=absent*rate;
    res.json({month,monthlyPrice:booking.monthlyPrice,workingDays:workingDaysInMonth(y,m),dailyRate:rate,worked,absent,holiday,earned,deduction,net:Math.max(0,earned),rows});
  } catch(e){res.status(500).json({message:e.message});}
});

router.post("/settle", protect, allowRoles("customer"), async(req,res)=>{
  try {
    const booking=await Booking.findOne({_id:req.body.bookingId,customer:req.user._id}).populate("maid");
    if(!booking) return res.status(404).json({message:"Booking not found"});
    const month=req.body.month || new Date().toISOString().slice(0,7);
    const [y,m]=month.split("-").map(Number);
    const existing=await WalletTransaction.findOne({booking:booking._id,month,type:"payout"});
    if(existing) return res.status(400).json({message:"This month has already been paid."});
    const sessions=await WorkSession.find({booking:booking._id,date:{$regex:`^${month}-`}});
    const worked=sessions.filter(s=>["working","completed"].includes(s.status)).length;
    const absent=sessions.filter(s=>s.status==="rejected").length;
    const net=Math.max(0,worked*dailyRate(booking.monthlyPrice,y,m));
    if(net<=0) return res.status(400).json({message:"No payable work recorded for this month yet."});
    const tx=await WalletTransaction.create({maid:booking.maid._id,customer:req.user._id,booking:booking._id,month,type:"payout",amount:net,description:`Monthly payment for ${month}`});
    res.json({message:"Monthly payment added to maid wallet.",amount:net,worked,absent,transaction:tx});
  } catch(e){res.status(500).json({message:e.message});}
});

export default router;
