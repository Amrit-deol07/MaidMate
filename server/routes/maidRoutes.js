import express from "express";
import Maid from "../models/Maid.js";
import Review from "../models/Review.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { search = "", service = "", lat = "", lng = "", radius = "15" } = req.query;
    let query = {};
    if (service) query.services = service;
    if (search) query.$or = [
      { name: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
      { workLocations: { $regex: search, $options: "i" } }
    ];
    let maids = await Maid.find(query).populate("user", "email phone");
    const hasCoords = lat !== "" && lng !== "" && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng));
    if(hasCoords){
      const R=6371, userLat=Number(lat), userLng=Number(lng), maxKm=Math.max(1,Number(radius)||15);
      const distanceKm=(a,b)=>{const dLat=(a-userLat)*Math.PI/180,dLng=(b-userLng)*Math.PI/180;const x=Math.sin(dLat/2)**2+Math.cos(userLat*Math.PI/180)*Math.cos(a*Math.PI/180)*Math.sin(dLng/2)**2;return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));};
      maids=maids.map(m=>{const d=m.latitude!=null&&m.longitude!=null?distanceKm(m.latitude,m.longitude):null;return {...m.toObject(),distanceKm:d===null?null:Number(d.toFixed(1))};}).filter(m=>m.distanceKm!==null && m.distanceKm<=maxKm).sort((a,b)=>a.distanceKm-b.distanceKm);
    }
    res.json(maids);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get("/:id", async (req, res) => {
  try {
    const maid = await Maid.findById(req.params.id).populate("user", "email phone");
    if (!maid) return res.status(404).json({ message: "Maid not found" });
    const reviews = await Review.find({ maid: maid._id }).populate("customer", "name").sort({ createdAt: -1 });
    res.json({ maid, reviews });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

export default router;
