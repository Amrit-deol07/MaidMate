import express from "express";
import { protect, allowRoles } from "../middleware/auth.js";

const router = express.Router();

const validAddress = a => a && a.addressLine && a.area && a.city && a.state && a.pincode;

router.get("/me", protect, async (req,res)=>{
  res.json({ id:req.user._id, name:req.user.name, email:req.user.email, phone:req.user.phone, role:req.user.role, address:req.user.address || {} });
});

router.patch("/me", protect, allowRoles("customer"), async (req,res)=>{
  try {
    const { name, phone, addressLine, area, city, state, pincode, latitude, longitude } = req.body;
    if(!name || !phone || !validAddress({addressLine,area,city,state,pincode})) return res.status(400).json({message:"Name, phone and complete address are required."});
    req.user.name=name.trim(); req.user.phone=phone.trim();
    req.user.address={addressLine:addressLine.trim(),area:area.trim(),city:city.trim(),state:state.trim(),pincode:pincode.trim(),latitude:latitude===""||latitude===undefined?null:Number(latitude),longitude:longitude===""||longitude===undefined?null:Number(longitude)};
    await req.user.save();
    res.json({id:req.user._id,name:req.user.name,email:req.user.email,phone:req.user.phone,role:req.user.role,address:req.user.address});
  } catch(e){res.status(500).json({message:e.message});}
});

export default router;
