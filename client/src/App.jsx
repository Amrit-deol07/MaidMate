import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { Search, Star, CalendarDays, ShieldCheck, MessageCircle, Phone, Menu, X, LogOut, ArrowRight, CheckCircle2, CreditCard, Users, UserCog, ClipboardList, IndianRupee, Check, Ban, Camera, Timer, Wallet, CircleDollarSign, MapPin, LocateFixed } from "lucide-react";
import api from "./api";

const services = ["Cleaning", "Cooking", "Laundry", "Baby Care", "Elder Care"];

function Navbar({ user, setUser }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const logout = () => { localStorage.clear(); setUser(null); navigate("/"); };
  return <nav className="nav">
    <Link className="brand" to="/">Maid<span>Mate</span></Link>
    <div className={`navlinks ${open ? "show" : ""}`}>
      {(!user || user.role==="customer") && <Link to="/maids" onClick={() => setOpen(false)}>Find Maids</Link>}
      {user && <Link to="/dashboard" onClick={() => setOpen(false)}>{user.role==="admin" ? "Admin Panel" : user.role==="maid" ? "Maid Portal" : "Dashboard"}</Link>}{user?.role==="customer" && <Link to="/profile" onClick={() => setOpen(false)}>My Profile</Link>}
      <Link to="/support" onClick={() => setOpen(false)}>Support</Link>
      {user ? <button className="navbtn" onClick={logout}><LogOut size={16}/> Logout</button> :
        <Link className="navbtn" to="/login" onClick={() => setOpen(false)}>Login</Link>}
    </div>
    <button className="mobile" onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
  </nav>
}

function Home() {
  const [search, setSearch] = useState("");
  return <div>
    <section className="hero">
      <div className="heroText">
        <div className="eyebrow">✓ Verified household professionals</div>
        <h1>Trusted help for a <span>happier home.</span></h1>
        <p>Find verified maids, choose a convenient time slot, see transparent monthly pricing and book with confidence.</p>
        <div className="searchbox">
          <Search size={20}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or location"/>
          <Link to={`/maids?search=${encodeURIComponent(search)}`} className="primary">Search</Link>
        </div>
        <div className="trust"><span>⭐ 4.8 average rating</span><span>🛡️ Verified profiles</span><span>💳 Transparent pricing</span></div>
      </div>
      <div className="heroCard">
        <div className="miniTop">BOOK IN MINUTES</div>
        <div className="step"><b>01</b><div><strong>Choose a maid</strong><small>Compare ratings & services</small></div></div>
        <div className="step"><b>02</b><div><strong>Pick your time</strong><small>Morning, afternoon or evening</small></div></div>
        <div className="step"><b>03</b><div><strong>Confirm monthly plan</strong><small>Clear price before payment</small></div></div>
        <Link className="primary full" to="/maids">Explore maids <ArrowRight size={18}/></Link>
      </div>
    </section>
    <section className="section">
      <div className="sectionTitle"><div><div className="eyebrow">WHY MAIDMATE</div><h2>Simple, safe & transparent</h2></div></div>
      <div className="features">
        <Feature icon={<ShieldCheck/>} title="Verified professionals" text="Profiles are reviewed so you can book with confidence."/>
        <Feature icon={<CalendarDays/>} title="Flexible time slots" text="Choose the schedule that works best for your home."/>
        <Feature icon={<CreditCard/>} title="Monthly pricing" text="See salary, platform fee and total before confirming."/>
        <Feature icon={<MessageCircle/>} title="Customer support" text="Get help through our support chat and helpline."/>
      </div>
    </section>
    <section className="cta"><div><h2>Need help choosing?</h2><p>Our support team can help you find the right service.</p></div><Link to="/support" className="lightBtn">Contact support</Link></section>
  </div>
}

function Feature({icon,title,text}) { return <div className="feature"><div className="icon">{icon}</div><h3>{title}</h3><p>{text}</p></div> }

function Maids() {
  const [maids,setMaids]=useState([]);
  const [search,setSearch]=useState(new URLSearchParams(window.location.search).get("search")||"");
  const [service,setService]=useState("");
  const [nearby,setNearby]=useState(false);
  const [msg,setMsg]=useState("");
  const [location,setLocation]=useState(null);
  const load=async()=>{try{const params={search,service};if(nearby&&location){params.lat=location.lat;params.lng=location.lng;params.radius=20;}const r=await api.get("/maids",{params});setMaids(r.data);if(nearby&&!location)setMsg("Allow location access to see nearby maids.");else setMsg("");}catch(e){setMsg(e.response?.data?.message||"Could not load maids");}};
  useEffect(()=>{load()},[search,service,nearby,location]);
  const useLocation=()=>{if(!navigator.geolocation)return setMsg("Geolocation is not supported by this browser.");navigator.geolocation.getCurrentPosition(p=>{setLocation({lat:p.coords.latitude,lng:p.coords.longitude});setNearby(true);},()=>setMsg("Location permission was not granted. You can still search by area/city."),{enableHighAccuracy:true,timeout:10000});};
  return <div className="page">
    <div className="pageHead"><div><div className="eyebrow">FIND YOUR MATCH</div><h1>{nearby?"Nearby maids":"Available maids"}</h1><p>{nearby?"Showing maids within about 20 km of your current location.":"Compare experience, ratings, services and monthly pricing."}</p></div><button className="secondaryBtn" onClick={useLocation}><LocateFixed size={17}/> Use my location</button></div>
    <div className="filters"><div className="filterSearch"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, area or city"/></div><select value={service} onChange={e=>setService(e.target.value)}><option value="">All services</option>{services.map(x=><option key={x}>{x}</option>)}</select><button className={nearby?"primary":"secondaryBtn"} onClick={()=>nearby?setNearby(false):useLocation()}><MapPin size={17}/>{nearby?"Show all maids":"Nearby me"}</button></div>
    {msg&&<div className="warningBox">{msg}</div>}
    <div className="maidGrid">{maids.map(m=><MaidCard key={m._id} maid={m}/>)}</div>
    {!maids.length&&<div className="empty">No maids found. Try another area or turn off nearby mode.</div>}
  </div>
}

function MaidCard({maid}) {
  return <div className="maidCard">
    <img src={maid.photo} alt={maid.name}/>
    <div className="maidBody">
      <div className="verified">✓ VERIFIED</div><h3>{maid.name}</h3><p className="muted">{maid.location} · {maid.experience} yrs experience{maid.distanceKm!=null?` · ${maid.distanceKm} km away`:""}</p>
      <div className="rating"><Star size={16} fill="currentColor"/> <b>{maid.rating}</b> <span>({maid.reviewCount} reviews)</span></div>
      <div className="tags">{maid.services.map(s=><span key={s}>{s}</span>)}</div>
      <div className="priceRow"><div><small>Monthly from</small><strong>₹{maid.monthlyPrice.toLocaleString("en-IN")}</strong></div><Link to={`/maid/${maid._id}`} className="primary small">View profile</Link></div>
    </div>
  </div>
}

function MaidDetails({user}) {
  const {id} = useParams();
  const [data,setData]=useState(null);
  const navigate=useNavigate();
  useEffect(()=>{api.get(`/maids/${id}`).then(r=>setData(r.data));},[id]);
  if(!data) return <div className="page"><div className="loading">Loading profile...</div></div>;
  const {maid,reviews}=data;
  return <div className="page">
    <div className="detailGrid">
      <div><img className="detailPhoto" src={maid.photo}/><div className="reviewBox"><h3>Customer reviews</h3>{reviews.length ? reviews.slice(0,5).map(r=><div className="review" key={r._id}><b>{r.customer?.name || "Customer"}</b><span> {"★".repeat(r.rating)}</span><p>{r.comment || "Great service!"}</p></div>) : <p className="muted">No reviews yet.</p>}</div></div>
      <div className="detailInfo"><div className="verified">✓ VERIFIED PROFESSIONAL</div><h1>{maid.name}</h1><p className="muted">{maid.location} · {maid.experience} years experience</p><div className="bigRating"><Star fill="currentColor"/><b>{maid.rating}</b><span>({maid.reviewCount} reviews)</span></div><p>{maid.about}</p><h3>Services</h3><div className="tags big">{maid.services.map(s=><span key={s}>{s}</span>)}</div><div className="monthly"><small>Monthly plan</small><strong>₹{maid.monthlyPrice.toLocaleString("en-IN")} <em>/ month</em></strong><p>+ ₹499 platform & support fee</p></div><button className="primary full" onClick={()=>user?.role==="customer"?navigate(`/book/${maid._id}`):!user?navigate("/login"):null}>{user?.role==="customer" ? "Book this maid" : !user ? "Login to book" : "Customer booking only"} <ArrowRight size={18}/></button></div>
    </div>
  </div>
}

function Booking({user}) {
  const {id}=useParams(); const [maid,setMaid]=useState(null); const [date,setDate]=useState(""); const [slot,setSlot]=useState(""); const [selected,setSelected]=useState([]); const [msg,setMsg]=useState("");
  const navigate=useNavigate();
  useEffect(()=>{api.get(`/maids/${id}`).then(r=>setMaid(r.data.maid));},[id]);
  if(!maid) return <div className="page">Loading...</div>;
  const toggle=s=>setSelected(x=>x.includes(s)?x.filter(a=>a!==s):[...x,s]);
  const submit=async e=>{e.preventDefault(); if(!date||!slot) return setMsg("Please select date and time slot."); try{const r=await api.post("/bookings",{maidId:id,startDate:date,timeSlot:slot,services:selected}); navigate(`/payment/${r.data._id}`);}catch(e){setMsg(e.response?.data?.message||"Booking failed");}};
  return <div className="page narrow"><div className="pageHead"><div><div className="eyebrow">STEP 1 OF 2</div><h1>Book {maid.name}</h1><p>Select your start date, preferred time and services.</p></div></div>
    <form className="panel form" onSubmit={submit}><label>Start date<input type="date" value={date} onChange={e=>setDate(e.target.value)} required/></label><label>Time slot</label><div className="slots">{maid.timeSlots.map(s=><button type="button" className={slot===s?"slot active":"slot"} onClick={()=>setSlot(s)} key={s}>{s}</button>)}</div><label>Services</label><div className="checkgrid">{maid.services.map(s=><button type="button" className={selected.includes(s)?"check active":"check"} onClick={()=>toggle(s)} key={s}>{selected.includes(s)?"✓ ":""}{s}</button>)}</div><div className="summary"><span>Monthly maid fee</span><b>₹{maid.monthlyPrice.toLocaleString("en-IN")}</b><span>Platform & support fee</span><b>₹499</b><hr/><span>Total payable</span><strong>₹{(maid.monthlyPrice+499).toLocaleString("en-IN")}/month</strong></div>{msg&&<div className="error">{msg}</div>}<button className="primary full">Continue to payment <ArrowRight size={18}/></button></form>
  </div>
}

function Payment({user}) {
  const {id}=useParams(); const [booking,setBooking]=useState(null); const [done,setDone]=useState(false); const navigate=useNavigate();
  useEffect(()=>{api.get("/bookings/my").then(r=>setBooking(r.data.find(x=>x._id===id)));},[id]);
  if(!booking) return <div className="page">Loading payment...</div>;
  const pay=async()=>{await api.patch(`/bookings/${id}/pay`);setDone(true);};
  if(done) return <div className="page narrow"><div className="success"><CheckCircle2 size={64}/><h1>Booking confirmed!</h1><p>Your monthly maid booking with <b>{booking.maid.name}</b> is confirmed.</p><button className="primary" onClick={()=>navigate("/dashboard")}>Go to dashboard</button></div></div>;
  return <div className="page narrow"><div className="pageHead"><div><div className="eyebrow">STEP 2 OF 2</div><h1>Monthly payment</h1><p>Review your amount before confirming.</p></div></div><div className="panel payment"><div className="payMaid"><img src={booking.maid.photo}/><div><b>{booking.maid.name}</b><span>{booking.startDate} · {booking.timeSlot}</span></div></div><div className="summary"><span>Monthly maid fee</span><b>₹{booking.monthlyPrice.toLocaleString("en-IN")}</b><span>Platform & support</span><b>₹{booking.platformFee}</b><hr/><span>Total</span><strong>₹{booking.totalAmount.toLocaleString("en-IN")}</strong></div><div className="demoPay"><CreditCard/><div><b>Demo payment</b><p>No real money will be charged in this starter project.</p></div></div><button className="primary full" onClick={pay}>Pay ₹{booking.totalAmount.toLocaleString("en-IN")} & confirm</button></div></div>
}

function LoginHub() {
  return <div className="loginHub authWrap"><div className="loginHubInner">
    <div className="brand centered">Maid<span>Mate</span></div>
    <h1>Welcome to MaidMate</h1>
    <p className="loginHubSub">Choose your account type to continue</p>
    <div className="loginCards">
      <Link to="/customer-login" className="loginCard customerCard"><div className="loginCardIcon">👤</div><div><h2>Customer</h2><p>Find and book verified maids</p></div><ArrowRight/></Link>
      <Link to="/maid-login" className="loginCard maidCard"><div className="loginCardIcon">🧹</div><div><h2>Maid</h2><p>Manage bookings and your schedule</p></div><ArrowRight/></Link>
      <Link to="/admin-login" className="loginCard adminCard"><div className="loginCardIcon">🛡️</div><div><h2>Admin</h2><p>Manage the MaidMate platform</p></div><ArrowRight/></Link>
    </div>
  </div></div>
}

function RoleLogin({setUser, role}) {
  const config = {
    customer: { title: "Customer Login", eyebrow: "CUSTOMER PORTAL", icon: "👤", subtitle: "Book trusted maids for your home.", button: "Login as Customer", alternate: "/maid-login", alternateLabel: "Login as Maid", accent: "customerLogin" },
    maid: { title: "Maid Login", eyebrow: "MAID PARTNER PORTAL", icon: "🧹", subtitle: "Login to manage bookings, your profile and schedule.", button: "Login as Maid", alternate: "/customer-login", alternateLabel: "Login as Customer", accent: "maidLogin" },
    admin: { title: "Admin Login", eyebrow: "ADMIN CONTROL CENTER", icon: "🛡️", subtitle: "Secure access to platform management.", button: "Login as Admin", alternate: "/customer-login", alternateLabel: "Login as Customer", accent: "adminLogin" }
  }[role];
  const [form,setForm]=useState({email:"",password:""});
  const [err,setErr]=useState("");
  const navigate=useNavigate();
  const submit=async e=>{e.preventDefault();setErr("");try{const r=await api.post("/auth/login",{...form,role});localStorage.setItem("token",r.data.token);localStorage.setItem("user",JSON.stringify(r.data.user));setUser(r.data.user);navigate("/dashboard");}catch(e){setErr(e.response?.data?.message||"Login failed");}};
  return <div className={`authWrap ${config.accent}`}><form className="panel auth roleAuth" onSubmit={submit}>
    <div className="loginIcon">{config.icon}</div><div className="eyebrow centered">{config.eyebrow}</div><h1>{config.title}</h1><p className="loginSubtitle">{config.subtitle}</p>
    <label>Email<input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder={role==="admin"?"admin@example.com":role==="maid"?"maid@example.com":"you@example.com"}/></label>
    <label>Password<input type="password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label>
    {err&&<div className="error">{err}</div>}
    <button className="primary full loginSubmit">{config.button}</button>
    <div className="loginLinks"><Link to={config.alternate}>{config.alternateLabel}</Link><Link to="/login">All login options</Link></div>
    {role==="maid"&&<p className="switch">New maid? <Link to="/maid-register">Create maid profile</Link></p>}
    {role==="customer"&&<p className="switch">New to MaidMate? <Link to="/register">Create customer account</Link></p>}
  </form></div>
}

function Login({setUser}) { return <LoginHub/>; }

function Register({setUser}) {
  const [form,setForm]=useState({name:"",email:"",password:"",phone:"",addressLine:"",area:"",city:"",state:"Uttar Pradesh",pincode:"",latitude:"",longitude:""}); const [err,setErr]=useState(""); const [locMsg,setLocMsg]=useState(""); const navigate=useNavigate();
  const set=(k,v)=>setForm({...form,[k]:v});
  const useLocation=()=>{if(!navigator.geolocation)return setLocMsg("Geolocation is not supported.");setLocMsg("Getting your location...");navigator.geolocation.getCurrentPosition(p=>{setForm(x=>({...x,latitude:p.coords.latitude,longitude:p.coords.longitude}));setLocMsg("Location captured. Your address is still required.");},()=>setLocMsg("Could not access location. Please enter the address manually."),{enableHighAccuracy:true,timeout:10000});};
  const submit=async e=>{e.preventDefault();setErr("");try{const r=await api.post("/auth/register",form);navigate("/verify",{state:{email:r.data.email,phone:r.data.phone}});}catch(e){setErr(e.response?.data?.message||"Registration failed");}};
  return <div className="authWrap"><form className="panel auth wideAuth" onSubmit={submit}><div className="brand centered">Maid<span>Mate</span></div><h1>Create your account</h1><p className="loginSubtitle">Your address is required so we can show relevant nearby maids.</p><div className="formGrid2"><label>Full name<input required value={form.name} onChange={e=>set("name",e.target.value)}/></label><label>Phone<input required value={form.phone} onChange={e=>set("phone",e.target.value)}/></label><label>Email<input type="email" required value={form.email} onChange={e=>set("email",e.target.value)}/></label><label>Password<input type="password" minLength="6" required value={form.password} onChange={e=>set("password",e.target.value)}/></label><label>House / Street address<input required value={form.addressLine} onChange={e=>set("addressLine",e.target.value)} placeholder="House no., street, society"/></label><label>Area / Sector<input required value={form.area} onChange={e=>set("area",e.target.value)} placeholder="Alpha 1 / Sector 62"/></label><label>City<input required value={form.city} onChange={e=>set("city",e.target.value)}/></label><label>State<input required value={form.state} onChange={e=>set("state",e.target.value)}/></label><label>PIN code<input required pattern="[0-9]{6}" value={form.pincode} onChange={e=>set("pincode",e.target.value.replace(/\D/g,"").slice(0,6))}/></label></div><div className="locationCapture"><button type="button" className="secondaryBtn" onClick={useLocation}><LocateFixed size={16}/> Use current location</button><span>{locMsg||"Optional: capture GPS so nearby matching can use distance."}</span></div>{err&&<div className="error">{err}</div>}<button className="primary full">Create account</button><p className="switch">Already have an account? <Link to="/customer-login">Login</Link></p></form></div>
}

function MaidRegister() {
  const [form,setForm]=useState({name:"",email:"",phone:"",password:"",location:"",workLocations:"",experience:"",monthlyPrice:"",services:"",about:"",latitude:"",longitude:""}); const [photo,setPhoto]=useState(null); const [err,setErr]=useState(""); const [loading,setLoading]=useState(false); const [locMsg,setLocMsg]=useState(""); const navigate=useNavigate();
  const set=(key,val)=>setForm({...form,[key]:val});
  const useLocation=()=>{if(!navigator.geolocation)return setLocMsg("Geolocation is not supported.");setLocMsg("Getting your location...");navigator.geolocation.getCurrentPosition(p=>{setForm(x=>({...x,latitude:p.coords.latitude,longitude:p.coords.longitude}));setLocMsg("Base GPS location captured. Add the areas where you want to work.");},()=>setLocMsg("Could not access location. Enter work areas manually."),{enableHighAccuracy:true,timeout:10000});};
  const submit=async e=>{e.preventDefault();setErr("");if(!photo)return setErr("Please upload a profile image");setLoading(true);try{const fd=new FormData();Object.entries(form).forEach(([k,v])=>fd.append(k,v));fd.append("photo",photo);const r=await api.post("/auth/register-maid",fd,{headers:{"Content-Type":"multipart/form-data"}});navigate("/maid-verify",{state:{email:r.data.email}});}catch(e){setErr(e.response?.data?.message||"Maid registration failed");}finally{setLoading(false)}};
  return <div className="authWrap"><form className="panel auth maidRegister wideAuth" onSubmit={submit}><div className="loginIcon">🧹</div><div className="eyebrow centered">MAID PARTNER REGISTRATION</div><h1>Create maid profile</h1><p className="loginSubtitle">Add your details, photo, services and the areas where you want to accept work.</p><div className="formGrid2"><label>Full name<input required value={form.name} onChange={e=>set("name",e.target.value)}/></label><label>Phone<input required value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="10-digit phone"/></label><label>Email<input type="email" required value={form.email} onChange={e=>set("email",e.target.value)}/></label><label>Password<input type="password" required minLength="6" value={form.password} onChange={e=>set("password",e.target.value)}/></label><label>Base location<input required value={form.location} onChange={e=>set("location",e.target.value)} placeholder="Greater Noida"/></label><label>Work locations / areas<input required value={form.workLocations} onChange={e=>set("workLocations",e.target.value)} placeholder="Alpha 1, Beta 1, Knowledge Park"/></label><label>Experience (years)<input type="number" min="0" required value={form.experience} onChange={e=>set("experience",e.target.value)}/></label><label>Monthly price (₹)<input type="number" min="0" required value={form.monthlyPrice} onChange={e=>set("monthlyPrice",e.target.value)}/></label><label>Services<input required value={form.services} onChange={e=>set("services",e.target.value)} placeholder="Cleaning, Cooking, Laundry"/></label></div><div className="locationCapture"><button type="button" className="secondaryBtn" onClick={useLocation}><LocateFixed size={16}/> Use current location</button><span>{locMsg||"GPS is used only for nearby matching; your work-area list is also shown to customers."}</span></div><label>About you<textarea required rows="4" value={form.about} onChange={e=>set("about",e.target.value)} placeholder="Tell customers about your experience and work style"/></label><label>Profile image<input type="file" accept="image/png,image/jpeg,image/webp" required onChange={e=>setPhoto(e.target.files?.[0]||null)}/><small className="muted">JPG, PNG or WEBP · maximum 5 MB</small></label>{err&&<div className="error">{err}</div>}<button className="primary full" disabled={loading}>{loading?"Creating profile...":"Create maid account"}</button><p className="switch">Already registered? <Link to="/maid-login">Login as Maid</Link></p></form></div>
}

function MaidOtp({setUser}) {
  const location=useLocation(); const [email,setEmail]=useState(location.state?.email||""); const [emailOtp,setEmailOtp]=useState(""); const [phoneOtp,setPhoneOtp]=useState(""); const [err,setErr]=useState(""); const [msg,setMsg]=useState(""); const [loading,setLoading]=useState(false); const navigate=useNavigate();
  const isLogin=location.pathname==="/maid-login-verify";
  const verify=async e=>{e.preventDefault();setErr("");setMsg("");setLoading(true);try{const r=await api.post("/auth/verify-otp",{email,emailOtp,phoneOtp,purpose:isLogin?"login":"registration"});localStorage.setItem("token",r.data.token);localStorage.setItem("user",JSON.stringify(r.data.user));setUser(r.data.user);navigate("/dashboard");}catch(e){setErr(e.response?.data?.message||"Verification failed");}finally{setLoading(false)}};
  const resend=async()=>{setErr("");setMsg("");try{const r=await api.post("/auth/resend-otp",{email});setMsg(r.data.message);}catch(e){setErr(e.response?.data?.message||"Could not resend OTP");}};
  return <div className="authWrap maidLogin"><form className="panel auth roleAuth" onSubmit={verify}><div className="loginIcon">🧹</div><div className="eyebrow centered">{isLogin?"MAID LOGIN VERIFICATION":"MAID REGISTRATION VERIFICATION"}</div><h1>{isLogin?"Verify maid login":"Verify your maid account"}</h1><p className="loginSubtitle">Enter the email OTP from Gmail and the phone OTP shown in the server terminal.</p><label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Email OTP<input inputMode="numeric" maxLength="6" required value={emailOtp} onChange={e=>setEmailOtp(e.target.value.replace(/\D/g,""))} placeholder="6-digit OTP"/></label><label>Phone OTP<input inputMode="numeric" maxLength="6" required value={phoneOtp} onChange={e=>setPhoneOtp(e.target.value.replace(/\D/g,""))} placeholder="6-digit OTP"/></label>{err&&<div className="error">{err}</div>}{msg&&<div className="successBar">{msg}</div>}<button className="primary full" disabled={loading}>{loading?"Verifying...":isLogin?"Verify & login":"Verify & create account"}</button><button type="button" className="full" onClick={resend}>Resend OTP</button><p className="switch"><Link to={isLogin?"/maid-login":"/maid-register"}>Back</Link></p></form></div>
}

function VerifyOtp({setUser}) {
  const location=useLocation();
  const [email,setEmail]=useState(location.state?.email||"");
  const [emailOtp,setEmailOtp]=useState("");const [phoneOtp,setPhoneOtp]=useState("");
  const [err,setErr]=useState("");const [msg,setMsg]=useState("");const [loading,setLoading]=useState(false);const navigate=useNavigate();
  const verify=async e=>{e.preventDefault();setErr("");setMsg("");setLoading(true);try{const r=await api.post("/auth/verify-otp",{email,emailOtp,phoneOtp});localStorage.setItem("token",r.data.token);localStorage.setItem("user",JSON.stringify(r.data.user));setUser(r.data.user);navigate("/dashboard");}catch(e){setErr(e.response?.data?.message||"Verification failed");}finally{setLoading(false);}};
  const resend=async()=>{setErr("");setMsg("");try{const r=await api.post("/auth/resend-otp",{email});setMsg(r.data.message+" Check your Gmail inbox for the email OTP.");}catch(e){setErr(e.response?.data?.message||"Could not resend OTP");}};
  return <div className="authWrap"><form className="panel auth" onSubmit={verify}><div className="brand centered">Maid<span>Mate</span></div><h1>Verify your account</h1><p>Enter the email OTP from your Gmail inbox. The phone OTP is shown in the backend terminal for now.</p><label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Email OTP<input inputMode="numeric" maxLength="6" required value={emailOtp} onChange={e=>setEmailOtp(e.target.value.replace(/\D/g,""))} placeholder="6-digit OTP"/></label><label>Phone OTP<input inputMode="numeric" maxLength="6" required value={phoneOtp} onChange={e=>setPhoneOtp(e.target.value.replace(/\D/g,""))} placeholder="6-digit OTP"/></label>{err&&<div className="error">{err}</div>}{msg&&<div className="success"><p>{msg}</p></div>}<button className="primary full" disabled={loading}>{loading?"Verifying...":"Verify & create account"}</button><button type="button" className="full" onClick={resend}>Resend OTP</button><p className="switch"><Link to="/register">Back to registration</Link></p></form></div>
}

function Auth({title,submit,form,setForm,error,button,register,login}) {
  return <div className="authWrap"><form className="panel auth" onSubmit={submit}><div className="brand centered">Maid<span>Mate</span></div><h1>{title}</h1>{login&&<div className="rolePicker"><p>Login as</p><div className="roleOptions"><button type="button" className={form.role==="customer"?"roleOption active":"roleOption"} onClick={()=>setForm({...form,role:"customer"})}>👤 Customer</button><button type="button" className={form.role==="maid"?"roleOption active":"roleOption"} onClick={()=>setForm({...form,role:"maid"})}>🧹 Maid</button></div></div>}{register&&<label>Full name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>}<label>Email<input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>{register&&<label>Phone<input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label>}<label>Password<input type="password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label>{error&&<div className="error">{error}</div>}<button className="primary full">{button}</button><p className="switch">{register?"Already have an account? ":"New to MaidMate? "}<Link to={register?"/login":"/register"}>{register?"Login":"Create account"}</Link></p></form></div>
}

function Dashboard({user}) {
  if (user.role === "admin") return <AdminDashboard user={user}/>;
  if (user.role === "maid") return <MaidDashboard user={user}/>;
  return <CustomerDashboard user={user}/>;
}

function StatCard({icon, label, value}) {
  return <div className="statCard"><div className="statIcon">{icon}</div><div><span>{label}</span><strong>{value}</strong></div></div>;
}

function AdminDashboard() {
  const [stats,setStats]=useState(null);
  const [customers,setCustomers]=useState([]);
  const [maids,setMaids]=useState([]);
  const [bookings,setBookings]=useState([]);
  const [reviews,setReviews]=useState([]);
  const [support,setSupport]=useState([]);
  const [tab,setTab]=useState("overview");
  const [msg,setMsg]=useState("");

  const load=async()=>{
    try {
      const [st,c,m,b,r,sp]=await Promise.all([
        api.get("/admin/stats"), api.get("/admin/customers"), api.get("/admin/maids"),
        api.get("/admin/bookings"), api.get("/admin/reviews"), api.get("/admin/support")
      ]);
      setStats(st.data);setCustomers(c.data);setMaids(m.data);setBookings(b.data);setReviews(r.data);setSupport(sp.data);
    } catch(e) { setMsg(e.response?.data?.message || "Could not load admin data"); }
  };
  useEffect(()=>{load()},[]);

  const updateStatus=async(id,status)=>{
    try { await api.patch(`/admin/bookings/${id}/status`,{status}); setMsg("Booking status updated."); load(); }
    catch(e){setMsg(e.response?.data?.message||"Update failed");}
  };
  const removeMaid=async(id)=>{
    if(!window.confirm("Remove this maid profile?")) return;
    try { await api.delete(`/admin/maids/${id}`); setMsg("Maid removed."); load(); }
    catch(e){setMsg(e.response?.data?.message||"Could not remove maid");}
  };

  return <div className="page adminPage">
    <div className="pageHead"><div><div className="eyebrow">ADMIN CONTROL CENTER</div><h1>Admin Dashboard 🛡️</h1><p>Manage customers, maids, bookings, payments and support from one place.</p></div></div>
    {msg&&<div className="successBar">{msg}</div>}
    {stats&&<div className="statsGrid">
      <StatCard icon={<Users/>} label="Customers" value={stats.customers}/>
      <StatCard icon={<UserCog/>} label="Maids" value={stats.maids}/>
      <StatCard icon={<ClipboardList/>} label="Bookings" value={stats.bookings}/>
      <StatCard icon={<IndianRupee/>} label="Paid revenue" value={`₹${stats.paidRevenue.toLocaleString("en-IN")}`}/>
    </div>}
    <div className="adminTabs">
      {[
        ["overview","Overview"],["customers","Customers"],["maids","Maids"],["bookings","Bookings"],["reviews","Reviews"],["support","Support"]
      ].map(([key,label])=><button key={key} className={tab===key?"adminTab active":"adminTab"} onClick={()=>setTab(key)}>{label}</button>)}
    </div>

    {tab==="overview"&&<div className="adminGrid">
      <div className="panel"><h2>Platform overview</h2><p className="muted">Current activity across MaidMate.</p>
        <div className="overviewRows">
          <div><span>Pending bookings</span><b>{stats?.pendingBookings||0}</b></div>
          <div><span>Total reviews</span><b>{reviews.length}</b></div>
          <div><span>Support messages</span><b>{support.length}</b></div>
        </div>
      </div>
      <div className="panel"><h2>Quick actions</h2><div className="quickActions">
        <button onClick={()=>setTab("customers")}><Users/> Manage customers</button>
        <button onClick={()=>setTab("maids")}><UserCog/> Manage maids</button>
        <button onClick={()=>setTab("bookings")}><ClipboardList/> Manage bookings</button>
        <button onClick={()=>setTab("support")}><MessageCircle/> Open support</button>
      </div></div>
    </div>}

    {tab==="customers"&&<div className="panel tablePanel"><h2>Customers</h2><div className="adminTable">{customers.map(c=><div className="tableRow" key={c._id}><div><b>{c.name}</b><span>{c.email}</span></div><span>{c.phone||"No phone"}</span><span>Joined {new Date(c.createdAt).toLocaleDateString()}</span></div>)}{!customers.length&&<div className="empty">No customers found.</div>}</div></div>}

    {tab==="maids"&&<div className="panel tablePanel"><h2>Maids</h2><div className="adminTable">{maids.map(m=><div className="tableRow" key={m._id}><div className="personCell"><img src={m.photo}/><div><b>{m.name}</b><span>{m.user?.email}</span></div></div><span>{m.location}</span><span>₹{m.monthlyPrice.toLocaleString("en-IN")}/month</span><button className="dangerBtn" onClick={()=>removeMaid(m._id)}><Ban size={15}/> Remove</button></div>)}{!maids.length&&<div className="empty">No maids found.</div>}</div></div>}

    {tab==="bookings"&&<div className="panel tablePanel"><h2>All bookings</h2><div className="adminTable">{bookings.map(b=><div className="tableRow bookingAdminRow" key={b._id}><div><b>{b.customer?.name||"Customer"}</b><span>{b.maid?.name||"Maid"} · {b.startDate} · {b.timeSlot}</span></div><span>₹{b.totalAmount.toLocaleString("en-IN")} · {b.paymentStatus}</span><span className={`status ${b.status}`}>{b.status}</span><select value={b.status} onChange={e=>updateStatus(b._id,e.target.value)}><option>pending</option><option>confirmed</option><option>completed</option><option>cancelled</option></select></div>)}{!bookings.length&&<div className="empty">No bookings yet.</div>}</div></div>}

    {tab==="reviews"&&<div className="panel tablePanel"><h2>Reviews</h2><div className="adminTable">{reviews.map(r=><div className="tableRow" key={r._id}><div><b>{r.customer?.name||"Customer"} → {r.maid?.name||"Maid"}</b><span>{r.comment||"No comment"}</span></div><strong className="reviewStars">{"★".repeat(r.rating)}</strong><span>{new Date(r.createdAt).toLocaleDateString()}</span></div>)}{!reviews.length&&<div className="empty">No reviews yet.</div>}</div></div>}

    {tab==="support"&&<div className="panel tablePanel"><h2>Support requests</h2><div className="adminTable">{support.map((m,i)=><div className="tableRow" key={m._id||i}><div><b>{m.user?.name||"User"} · {m.user?.role||""}</b><span>{m.user?.email||""}</span></div><span className={`supportSender ${m.sender}`}>{m.sender}</span><p>{m.message}</p></div>)}{!support.length&&<div className="empty">No support messages.</div>}</div></div>}
  </div>
}

function CustomerDashboard({user}) {
  const [bookings,setBookings]=useState([]); const [review,setReview]=useState({}); const [msg,setMsg]=useState(""); const [requests,setRequests]=useState([]); const [liveSessions,setLiveSessions]=useState([]); const [paying,setPaying]=useState(null); const [payrolls,setPayrolls]=useState({}); const [profile,setProfile]=useState(null); const [nearby,setNearby]=useState([]);
  const load=async()=>{try{const [b,r,l,p]=await Promise.all([api.get("/bookings/my"),api.get("/work/customer-requests"),api.get("/work/customer-live"),api.get("/users/me")]);setBookings(b.data);setRequests(r.data);setLiveSessions(l.data);setProfile(p.data);const month=new Date().toISOString().slice(0,7);const sums=await Promise.all(b.data.map(x=>api.get(`/work/attendance/${x._id}`,{params:{month}}).then(z=>[x._id,z.data]).catch(()=>[x._id,null])));setPayrolls(Object.fromEntries(sums));if(p.data?.address?.latitude!=null&&p.data?.address?.longitude!=null){const n=await api.get("/maids",{params:{lat:p.data.address.latitude,lng:p.data.address.longitude,radius:20}});setNearby(n.data.slice(0,4));}else{const n=await api.get("/maids",{params:{search:p.data?.address?.area||p.data?.address?.city||""}});setNearby(n.data.slice(0,4));}}catch(e){setMsg(e.response?.data?.message||"Could not load dashboard");}};
  useEffect(()=>{load();const t=setInterval(load,15000);return()=>clearInterval(t)},[]);
  const submitReview=async b=>{const x=review[b._id];if(!x)return;try{await api.post("/reviews",{maidId:b.maid._id,rating:Number(x.rating),comment:x.comment});setMsg("Review submitted successfully.");load();}catch(e){setMsg(e.response?.data?.message||"Review failed");}};
  const decide=async(id,approve)=>{try{await api.patch(`/work/customer-requests/${id}`,{approve,reason:approve?"":"Face verification not approved by customer."});setMsg(approve?"Face verification approved. The maid's timer has started.":"Work request rejected. The maid cannot start work.");load();}catch(e){setMsg(e.response?.data?.message||"Could not update verification");}};
  const settle=async b=>{setPaying(b._id);try{const r=await api.post("/work/settle",{bookingId:b._id,month:new Date().toISOString().slice(0,7)});setMsg(`₹${r.data.amount.toLocaleString("en-IN")} added to the maid's wallet.`);load();}catch(e){setMsg(e.response?.data?.message||"Could not process monthly payment");}finally{setPaying(null)}};
  return <div className="page"><div className="pageHead"><div><div className="eyebrow">CUSTOMER ACCOUNT</div><h1>Hello, {user.name} 👋</h1><p>Book trusted maids, manage monthly plans, verify daily attendance and payments.</p></div></div>{msg&&<div className="successBar">{msg}</div>}{profile&&(!profile.address?.addressLine||!profile.address?.area)&&<div className="warningBox">Please complete your address in <Link to="/profile">My Profile</Link> to improve nearby maid matching.</div>}<div className="nearbySection"><div className="sectionHead"><h2>Nearby maids</h2><Link to="/maids">View all</Link></div><div className="maidGrid compactGrid">{nearby.map(m=><MaidCard key={m._id} maid={m}/>)}</div>{!nearby.length&&<div className="empty">No nearby maid found yet. Update your address or browse all maids.</div>}</div>
    {requests.length>0&&<div className="panel verificationPanel"><div className="verificationHead"><div><div className="eyebrow">DAILY FACE VERIFICATION</div><h2>Work-start request</h2><p className="muted">The maid has requested permission to start today's work. Review the live face check before allowing the timer to start.</p></div><ShieldCheck/></div>{requests.map(r=><div className="verificationRequest" key={r._id}><div className="verificationImages"><img src={r.maid?.photo}/>{r.faceSnapshot&&<img src={r.faceSnapshot} alt="Live verification"/>}</div><div className="verificationRequestMain"><b>{r.maid?.name}</b><span>{r.date} · {r.timeSlot}</span><span className={r.faceMatched?"faceGood":"faceWarn"}>{r.faceMatched?`✓ Face matched · ${r.faceSimilarity||0}% similarity`:`⚠ Face match failed`}</span><small>The face result is only an advisory check. You decide whether to allow the maid to work, even if the face does not match.</small></div><div className="actionBtns"><button className="acceptBtn" onClick={()=>decide(r._id,true)}><Check size={15}/> Allow work</button><button className="dangerBtn" onClick={()=>decide(r._id,false)}><Ban size={15}/> Reject</button></div></div>)}</div>}
    <div className="customerCards"><Link to="/maids" className="customerAction"><Search/><div><b>Find a maid</b><span>Compare profiles, ratings and prices</span></div><ArrowRight/></Link><Link to="/support" className="customerAction"><MessageCircle/><div><b>Need help?</b><span>Chat with MaidMate support</span></div><ArrowRight/></Link></div><h2 className="sectionHead">My bookings</h2><div className="bookingList">{bookings.map(b=><div className="booking" key={b._id}><img src={b.maid.photo}/><div className="bookingMain"><div className="bookingTop"><div><h3>{b.maid.name}</h3><p>Starts {b.startDate} · {b.timeSlot}</p></div><span className={`status ${b.status}`}>{b.status}</span></div><div className="bookingInfo"><span>₹{b.monthlyPrice.toLocaleString("en-IN")}/month</span><span>{b.paymentStatus === "paid" ? "✓ Booking paid" : "Payment pending"}</span></div>{requests.some(r=>String(r.booking?._id||r.booking)===String(b._id))&&<div className="liveStatus pending">Waiting for today’s work approval</div>}{liveSessions.some(x=>String(x.booking?._id||x.booking)===String(b._id))&&<div className="liveStatus working"><span className="liveDot"></span> Maid is working now · timer running</div>}<div className="payrollBox"><div><b>Monthly maid payment</b><span>Worked: {payrolls[b._id]?.worked||0} days · Sunday holidays: {payrolls[b._id]?.holiday||0} · Deduction: ₹{Math.round(payrolls[b._id]?.deduction||0).toLocaleString("en-IN")}</span><strong>Payable now: ₹{Math.round(payrolls[b._id]?.net||0).toLocaleString("en-IN")}</strong></div><button className="acceptBtn" disabled={paying===b._id||!(payrolls[b._id]?.net>0)} onClick={()=>settle(b)}><Wallet size={15}/>{paying===b._id?"Processing...":"Pay maid for this month"}</button></div>{b.status!=="cancelled"&&<div className="reviewForm"><select value={review[b._id]?.rating||""} onChange={e=>setReview({...review,[b._id]:{...(review[b._id]||{}),rating:e.target.value}})}><option value="">Rate maid</option>{[1,2,3,4,5].map(x=><option key={x} value={x}>{x} ★</option>)}</select><input placeholder="Write a review" value={review[b._id]?.comment||""} onChange={e=>setReview({...review,[b._id]:{...(review[b._id]||{}),comment:e.target.value}})}/><button onClick={()=>submitReview(b)}>Submit</button></div>}</div></div>)}{!bookings.length&&<div className="empty">You have no bookings yet. <Link to="/maids">Find a maid</Link></div>}</div></div>
}

function MaidDashboard({user}) {
  const [profile,setProfile]=useState(null); const [bookings,setBookings]=useState([]); const [tab,setTab]=useState("overview"); const [msg,setMsg]=useState(""); const [today,setToday]=useState(null); const [sessions,setSessions]=useState([]); const [wallet,setWallet]=useState({balance:0,transactions:[]}); const [faceOpen,setFaceOpen]=useState(false); const [selectedBooking,setSelectedBooking]=useState(""); const [cameraError,setCameraError]=useState(""); const [cameraReady,setCameraReady]=useState(false);
  const load=async()=>{try{const [p,b,w,t,s]=await Promise.all([api.get("/maid-dashboard/profile"),api.get("/maid-dashboard/bookings"),api.get("/work/wallet"),api.get("/work/today"),api.get("/work/maid-sessions")]);setProfile(p.data);setBookings(b.data);setWallet(w.data);setToday(t.data);setSessions(s.data);}catch(e){setMsg(e.response?.data?.message||"Could not load maid dashboard");}};
  useEffect(()=>{load();const t=setInterval(load,10000);return()=>clearInterval(t)},[]);
  const update=async(id,status)=>{try{await api.patch(`/maid-dashboard/bookings/${id}/status`,{status});setMsg(`Booking ${status}.`);load();}catch(e){setMsg(e.response?.data?.message||"Update failed");}};
  const pending=bookings.filter(b=>b.status==="pending").length;
  const active=sessions.find(s=>s.date===today?.date && s.status==="working");
  const pendingRequest=sessions.find(s=>s.date===today?.date && s.status==="pending_approval");
  const earnings=wallet.balance;
  const startRequest=async()=>{if(!selectedBooking)return setCameraError("Select today's booking first.");setCameraError("");setCameraReady(false);setFaceOpen(true);};
  const submitFace=async()=>{
    if(!selectedBooking)return;
    try{
      setCameraError("Checking your face against the registered profile...");
      const video=document.getElementById("maidCamera");
      const face=await compareLiveFace(video,profile?.photo);
      const canvas=document.createElement("canvas");
      canvas.width=video?.videoWidth||640;
      canvas.height=video?.videoHeight||480;
      canvas.getContext("2d")?.drawImage(video,0,0,canvas.width,canvas.height);
      const faceSnapshot=canvas.toDataURL("image/jpeg",0.65);
      await api.post("/work/start-request",{bookingId:selectedBooking,faceDetected:true,faceMatched:face.matched,faceSimilarity:face.similarity,faceDistance:face.distance,faceSnapshot});
      setFaceOpen(false);
      setCameraError("");
      setMsg(face.matched?`Face matched (${face.similarity}%). The customer will decide whether to allow today's work.`:`Face not matched (${face.similarity}%). The customer will decide whether to allow today's work.`);
      load();
    }catch(e){setCameraError(e.response?.data?.message||e.message||"Could not complete face verification");}
  };
  const stopWork=async()=>{if(!active)return;try{await api.post("/work/stop",{sessionId:active._id});setMsg("Work timer stopped and today's attendance was recorded.");load();}catch(e){setMsg(e.response?.data?.message||"Could not stop timer");}};
  return <div className="page maidPage"><div className="pageHead"><div><div className="eyebrow">MAID PARTNER PORTAL</div><h1>Hello, {user.name} 👋</h1><p>Manage your schedule, daily face verification, attendance and earnings.</p></div></div>{msg&&<div className="successBar">{msg}</div>}
    <div className="statsGrid maidStats"><StatCard icon={<ClipboardList/>} label="My bookings" value={bookings.length}/><StatCard icon={<CalendarDays/>} label="Pending requests" value={pending}/><StatCard icon={<Wallet/>} label="Wallet balance" value={`₹${earnings.toLocaleString("en-IN")}`}/><StatCard icon={<Star/>} label="Rating" value={profile?.rating||0}/></div>
    <div className="adminTabs">{[["overview","Overview"],["work","Today's Work"],["bookings","My Bookings"],["schedule","My Schedule"],["wallet","My Wallet"],["profile","My Profile"]].map(([key,label])=><button key={key} className={tab===key?"adminTab active":"adminTab"} onClick={()=>setTab(key)}>{label}</button>)}</div>
    {tab==="overview"&&<div className="adminGrid"><div className="panel"><h2>Today's work</h2><p className="muted">Sunday is automatically treated as a weekly holiday. On other days, the maid must complete face verification and receive customer approval before the timer starts.</p>{today?.isSunday?<div className="holidayBanner">🌿 Sunday holiday — no timer or deduction.</div>:<div className="workStatusCard">{active?<><div className="workLive"><Timer/><div><b>Work timer is running</b><span>Customer approved today's face verification.</span></div></div><WorkTimer session={active} onStop={stopWork}/></>:pendingRequest?<div><b>Waiting for customer approval</b><p className="muted">Your face verification request was sent. You cannot start work until the customer approves it.</p></div>:<div><b>Ready for today's verification</b><p className="muted">Select a booking in Today's Work and complete the camera check.</p></div>}</div>}</div><div className="panel"><h2>Your wallet</h2><div className="walletBalance">₹{wallet.balance.toLocaleString("en-IN")}</div><p className="muted">Money paid by customers is shown here after monthly settlement.</p>{wallet.transactions.slice(0,3).map(t=><div className="walletRow" key={t._id}><div><b>{t.description}</b><span>{new Date(t.date).toLocaleDateString()}</span></div><strong>+₹{t.amount.toLocaleString("en-IN")}</strong></div>)}</div></div>}
    {tab==="work"&&<TodayWork today={today} bookings={bookings} sessions={sessions} selectedBooking={selectedBooking} setSelectedBooking={setSelectedBooking} startRequest={startRequest} active={active} pendingRequest={pendingRequest} stopWork={stopWork}/>} 
    {tab==="bookings"&&<div className="panel tablePanel"><h2>My bookings</h2><div className="adminTable">{bookings.map(b=><div className="tableRow bookingAdminRow" key={b._id}><div><b>{b.customer?.name||"Customer"}</b><span>{b.customer?.email} · {b.startDate} · {b.timeSlot}</span></div><span>{b.services?.join(", ")||"Household service"}</span><span className={`status ${b.status}`}>{b.status}</span>{b.status==="pending"&&<div className="actionBtns"><button className="acceptBtn" onClick={()=>update(b._id,"confirmed")}><Check size={15}/> Accept</button><button className="dangerBtn" onClick={()=>update(b._id,"cancelled")}><Ban size={15}/> Reject</button></div>}{b.status==="confirmed"&&<button className="acceptBtn" onClick={()=>update(b._id,"completed")}><Check size={15}/> Complete</button>}</div>)}{!bookings.length&&<div className="empty">No bookings yet.</div>}</div></div>}
    {tab==="schedule"&&<ScheduleEditor profile={profile} onSaved={load}/>} 
    {tab==="wallet"&&<WalletPanel wallet={wallet}/>} 
    {tab==="profile"&&<MaidProfileEditor profile={profile} onSaved={load}/>} 
    {faceOpen&&<FaceVerificationModal onClose={()=>setFaceOpen(false)} onSubmit={submitFace} error={cameraError} setReady={setCameraReady} cameraReady={cameraReady}/>} 
  </div>
}

function TodayWork({today,bookings,sessions,selectedBooking,setSelectedBooking,startRequest,active,pendingRequest,stopWork}) {
  const eligible=bookings.filter(b=>b.status==="confirmed"&&b.startDate<=today?.date);
  const sessionForSelected=sessions.find(s=>s.date===today?.date&&String(s.booking?._id||s.booking)===selectedBooking);
  if(today?.isSunday)return <div className="panel"><h2>Sunday holiday</h2><p className="muted">Sunday is a weekly holiday. No face verification, timer or salary deduction is required.</p></div>;
  return <div className="panel"><h2>Start today's work</h2><p className="muted">Every working day follows the same routine: camera face check → customer permission → timer → stop work → attendance.</p><div className="workStartGrid"><label>Choose booking<select value={selectedBooking} onChange={e=>setSelectedBooking(e.target.value)}><option value="">Select customer / booking</option>{eligible.map(b=><option value={b._id} key={b._id}>{b.customer?.name||"Customer"} · {b.timeSlot}</option>)}</select></label><div className="scheduleInfo"><b>Today's status</b><span>{active?"Timer running":pendingRequest?"Waiting for customer approval":sessionForSelected?.status==="rejected"?"Rejected — you may request again":"Not started"}</span></div></div>{active?<><WorkTimer session={active} onStop={stopWork}/></>:<button className="primary" disabled={!selectedBooking||pendingRequest} onClick={startRequest}><Camera size={17}/> Verify face & request permission</button>}{pendingRequest&&<div className="warningBox">Your verification request is waiting for the customer. Work cannot start until they approve it.</div>}{sessionForSelected?.status==="rejected"&&<div className="error">Customer rejected today's face verification. You can request verification again after selecting the booking.</div>}<h3 className="subhead">Recent attendance</h3><div className="attendanceList">{sessions.slice(0,10).map(s=><div className="attendanceRow" key={s._id}><span>{s.date}</span><span>{s.timeSlot}</span><b className={s.status}>{s.status.replace("_"," ")}</b></div>)}</div></div>
}

function WorkTimer({session,onStop}) { const [now,setNow]=useState(Date.now()); useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(t)},[]); const sec=Math.max(0,Math.floor((now-new Date(session.startTime).getTime())/1000)); return <div className="timerBox"><div><span>Elapsed work time</span><strong>{String(Math.floor(sec/3600)).padStart(2,"0")}:{String(Math.floor(sec%3600/60)).padStart(2,"0")}:{String(sec%60).padStart(2,"0")}</strong></div><button className="dangerBtn" onClick={onStop}>Stop work</button></div> }

function WalletPanel({wallet}) { return <div className="panel"><div className="walletHero"><div><div className="eyebrow">MAID WALLET</div><h2>₹{wallet.balance.toLocaleString("en-IN")}</h2><p>Available balance from customer monthly payments.</p></div><Wallet size={40}/></div><h3>Transactions</h3><div className="walletTransactions">{wallet.transactions.map(t=><div className="walletRow" key={t._id}><div><b>{t.description}</b><span>{t.month} · {new Date(t.date).toLocaleDateString()}</span></div><strong>+₹{t.amount.toLocaleString("en-IN")}</strong></div>)}{!wallet.transactions.length&&<div className="empty">No wallet transactions yet.</div>}</div></div> }

const FACE_MODEL_URL="https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model";
let faceModelsPromise=null;
async function loadFaceModels(){if(!window.faceapi)throw new Error("Face recognition library could not load. Check your internet connection and reload the page.");if(!faceModelsPromise){faceModelsPromise=Promise.all([window.faceapi.nets.tinyFaceDetector.loadFromUri(FACE_MODEL_URL),window.faceapi.nets.faceLandmark68Net.loadFromUri(FACE_MODEL_URL),window.faceapi.nets.faceRecognitionNet.loadFromUri(FACE_MODEL_URL)]);}await faceModelsPromise;}
async function compareLiveFace(video,photoUrl){await loadFaceModels();const opts=new window.faceapi.TinyFaceDetectorOptions({inputSize:320,scoreThreshold:0.5});const live=await window.faceapi.detectSingleFace(video,opts).withFaceLandmarks().withFaceDescriptor();if(!live)throw new Error("No clear face found in the camera. Look straight at the camera and try again.");const referenceImage=await window.faceapi.fetchImage(photoUrl);const reference=await window.faceapi.detectSingleFace(referenceImage,opts).withFaceLandmarks().withFaceDescriptor();if(!reference)throw new Error("The registered maid profile photo does not contain a clear face. Update the maid profile photo first.");const distance=window.faceapi.euclideanDistance(live.descriptor,reference.descriptor);const similarity=Math.max(0,Math.min(100,Math.round((1-distance/0.8)*100)));return {matched:distance<=0.55,distance:Number(distance.toFixed(4)),similarity};}

function FaceVerificationModal({onClose,onSubmit,error,setReady,cameraReady}) { const videoRef=React.useRef(null); const streamRef=React.useRef(null); const [loadingModels,setLoadingModels]=useState(true); useEffect(()=>{let mounted=true;(async()=>{try{await loadFaceModels();if(mounted)setLoadingModels(false);}catch{if(mounted)setLoadingModels(false);}})();navigator.mediaDevices?.getUserMedia({video:{facingMode:"user",width:{ideal:1280},height:{ideal:720}},audio:false}).then(stream=>{if(!mounted)return;streamRef.current=stream;if(videoRef.current){videoRef.current.srcObject=stream;videoRef.current.play();}setReady(true);}).catch(()=>setReady(false));return()=>{mounted=false;streamRef.current?.getTracks().forEach(t=>t.stop())}},[]); return <div className="modalOverlay"><div className="timePickerModal faceModal"><div className="modalHeader"><div><h3>Daily face verification</h3><p>We compare the live camera face with the maid's registered profile photo. The result is advisory only; the customer makes the final decision before the timer starts.</p></div><button className="modalClose" onClick={onClose}>×</button></div><video id="maidCamera" ref={videoRef} className="faceCamera" autoPlay muted playsInline/><div className="facePrivacy">🔐 Face matching runs in the browser for this demo. Only the verification snapshot is sent to the customer approval screen.</div>{loadingModels&&<div className="warningBox">Loading face-recognition models… Please wait.</div>}{error&&<div className="error">{error}</div>}<div className="modalActions"><button className="secondaryBtn" onClick={onClose}>Cancel</button><button className="primary" disabled={!cameraReady||loadingModels} onClick={onSubmit}><Camera size={16}/> Verify & request permission</button></div></div></div> }

function MaidProfileEditor({profile,onSaved}) {
  const [form,setForm]=useState({name:"",phone:"",location:"",workLocations:"",experience:"",monthlyPrice:"",services:"",about:"",latitude:"",longitude:""}); const [photo,setPhoto]=useState(null); const [msg,setMsg]=useState(""); const [err,setErr]=useState(""); const [saving,setSaving]=useState(false);
  useEffect(()=>{if(profile)setForm({name:profile.name||"",phone:profile.user?.phone||"",location:profile.location||"",workLocations:(profile.workLocations||[]).join(", "),experience:profile.experience||"",monthlyPrice:profile.monthlyPrice||"",services:(profile.services||[]).join(", "),about:profile.about||"",latitude:profile.latitude??"",longitude:profile.longitude??""})},[profile]);
  const save=async e=>{e.preventDefault();setSaving(true);setMsg("");setErr("");try{const fd=new FormData();Object.entries(form).forEach(([k,v])=>fd.append(k,v));if(photo)fd.append("photo",photo);await api.patch("/maid-dashboard/profile",fd,{headers:{"Content-Type":"multipart/form-data"}});setMsg("Profile updated successfully.");setPhoto(null);onSaved();}catch(e){setErr(e.response?.data?.message||"Could not update profile");}finally{setSaving(false)}};
  if(!profile)return <div className="panel">Loading profile...</div>;
  return <form className="panel profileEditor" onSubmit={save}><div className="profileEditorHead"><img className="profileLarge" src={profile.photo}/><div><h2>Edit my profile</h2><p className="muted">Keep your profile, services and photo up to date for customers.</p></div></div><div className="formGrid2"><label>Full name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Phone<input required value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label><label>Base location<input required value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/></label><label>Work locations / areas<input required value={form.workLocations} onChange={e=>setForm({...form,workLocations:e.target.value})}/></label><label>Experience (years)<input type="number" min="0" value={form.experience} onChange={e=>setForm({...form,experience:e.target.value})}/></label><label>Monthly price (₹)<input type="number" min="0" value={form.monthlyPrice} onChange={e=>setForm({...form,monthlyPrice:e.target.value})}/></label><label>Services<input value={form.services} onChange={e=>setForm({...form,services:e.target.value})}/></label></div><label>About<textarea rows="4" value={form.about} onChange={e=>setForm({...form,about:e.target.value})}/></label><label>Change profile image<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>setPhoto(e.target.files?.[0]||null)}/></label>{err&&<div className="error">{err}</div>}{msg&&<div className="successBar">{msg}</div>}<button className="primary" disabled={saving}>{saving?"Saving...":"Save profile"}</button></form>
}

function ScheduleEditor({profile,onSaved}) {
  const [slots,setSlots]=useState(profile?.timeSlots||[]);
  const [showPicker,setShowPicker]=useState(false);
  const [startTime,setStartTime]=useState("");
  const [endTime,setEndTime]=useState("");
  const [saving,setSaving]=useState(false);
  const [msg,setMsg]=useState("");
  const [pickerError,setPickerError]=useState("");
  useEffect(()=>{setSlots(profile?.timeSlots||[])},[profile]);

  const save=async()=>{setSaving(true);try{await api.patch("/maid-dashboard/profile/availability",{timeSlots:slots});setMsg("Availability saved.");onSaved();}catch(e){setMsg(e.response?.data?.message||"Could not save");}finally{setSaving(false)}};

  const formatTime=(value)=>{
    const [h,m]=value.split(":").map(Number);
    const suffix=h>=12?"PM":"AM";
    const hour=h%12||12;
    return `${hour}:${String(m).padStart(2,"0")} ${suffix}`;
  };

  const addSlot=()=>{
    setPickerError("");
    if(!startTime||!endTime){setPickerError("Please select both start and end time.");return;}
    if(startTime>=endTime){setPickerError("End time must be later than start time.");return;}
    const formatted=`${formatTime(startTime)} - ${formatTime(endTime)}`;
    if(slots.includes(formatted)){setPickerError("This time slot is already added.");return;}
    setSlots([...slots,formatted]);
    setStartTime("");setEndTime("");setShowPicker(false);
  };

  return <div className="panel">
    <h2>My Schedule</h2>
    <p className="muted">Choose the exact time from which you want to work until the time you want to finish. Customers will only see the slots you save.</p>
    <div className="scheduleSlots">{slots.map(s=><div className="scheduleSlot" key={s}>{s}<button type="button" aria-label={`Remove ${s}`} onClick={()=>setSlots(slots.filter(x=>x!==s))}>×</button></div>)}</div>
    <button className="primary" type="button" onClick={()=>{setPickerError("");setShowPicker(true)}}>+ Add available time</button>
    {msg&&<div className="successBar">{msg}</div>}
    <button className="primary" onClick={save} disabled={saving}>{saving?"Saving...":"Save availability"}</button>

    {showPicker&&<div className="modalOverlay" onClick={()=>setShowPicker(false)}>
      <div className="timePickerModal" onClick={e=>e.stopPropagation()}>
        <div className="modalHeader"><div><h3>Select working hours</h3><p>Choose when you want to start and finish work.</p></div><button type="button" className="modalClose" onClick={()=>setShowPicker(false)}>×</button></div>
        <div className="timePickerGrid">
          <label>From<input type="time" value={startTime} onChange={e=>setStartTime(e.target.value)} /></label>
          <label>To<input type="time" value={endTime} onChange={e=>setEndTime(e.target.value)} /></label>
        </div>
        {pickerError&&<div className="error">{pickerError}</div>}
        <div className="modalActions"><button type="button" className="secondaryBtn" onClick={()=>setShowPicker(false)}>Cancel</button><button type="button" className="primary" onClick={addSlot}>Add time slot</button></div>
      </div>
    </div>}
  </div>
}
function CustomerProfile({user,setUser}) {
  const [form,setForm]=useState({
    name:"",
    phone:"",
    addressLine:"",
    area:"",
    city:"",
    state:"",
    pincode:"",
    latitude:"",
    longitude:""
  });

  const [msg,setMsg]=useState("");
  const [err,setErr]=useState("");
  const [saving,setSaving]=useState(false);
  const [locMsg,setLocMsg]=useState("");

  const load=async()=>{
    try{
      const r=await api.get("/users/me");

      setForm({
        name:r.data.name||"",
        phone:r.data.phone||"",
        addressLine:r.data.address?.addressLine||"",
        area:r.data.address?.area||"",
        city:r.data.address?.city||"",
        state:r.data.address?.state||"",
        pincode:r.data.address?.pincode||"",
        latitude:r.data.address?.latitude??"",
        longitude:r.data.address?.longitude??""
      });
    }catch(e){
      setErr(e.response?.data?.message||"Could not load profile");
    }
  };

  useEffect(()=>{
    load();
  },[]);

  const useLocation=()=>{
    if(!navigator.geolocation){
      setLocMsg("Geolocation is not supported by this browser.");
      return;
    }

    setLocMsg("Detecting your current location...");

    navigator.geolocation.getCurrentPosition(
      p=>{
        setForm(x=>({
          ...x,
          latitude:p.coords.latitude,
          longitude:p.coords.longitude
        }));

        setLocMsg("✓ Current location detected successfully.");
      },
      ()=>{
        setLocMsg("Location permission was not granted.");
      },
      {
        enableHighAccuracy:true,
        timeout:10000
      }
    );
  };

  const save=async e=>{
    e.preventDefault();

    setSaving(true);
    setErr("");
    setMsg("");

    try{
      const r=await api.patch("/users/me",form);

      setForm(x=>({
        ...x,
        ...r.data,
        addressLine:r.data.address.addressLine,
        area:r.data.address.area,
        city:r.data.address.city,
        state:r.data.address.state,
        pincode:r.data.address.pincode,
        latitude:r.data.address.latitude??"",
        longitude:r.data.address.longitude??""
      }));

      const next={
        ...user,
        name:r.data.name,
        phone:r.data.phone,
        address:r.data.address
      };

      localStorage.setItem("user",JSON.stringify(next));
      setUser(next);

      setMsg("Profile updated successfully.");
    }catch(e){
      setErr(e.response?.data?.message||"Could not save profile");
    }finally{
      setSaving(false);
    }
  };

  const profileComplete =
    form.name &&
    form.phone &&
    form.addressLine &&
    form.area &&
    form.city &&
    form.state &&
    form.pincode;

  const locationAvailable =
    form.latitude && form.longitude;

  return (
    <div className="page customerProfilePage">

      <div className="pageHead profilePageHead">
        <div>
          <div className="eyebrow">ACCOUNT SETTINGS</div>

          <h1>My Profile</h1>

          <p>
            Manage your personal information, service address and
            nearby maid preferences.
          </p>
        </div>
      </div>

      {msg && (
        <div className="successBar">
          ✓ {msg}
        </div>
      )}

      {err && (
        <div className="error">
          {err}
        </div>
      )}

      <form onSubmit={save}>

        {/* TOP PROFILE CARDS */}

        <div className="profileTopGrid">

          <div className="profileIdentityCard">

            <div className="profileBigAvatar">
              {form.name?.[0]?.toUpperCase() || "U"}
            </div>

            <div className="profileIdentityInfo">
              <h2>{form.name || "Customer"}</h2>

              <p>
                {user.email}
              </p>

              <span className="customerBadge">
                CUSTOMER
              </span>
            </div>

          </div>


          <div className="profileStatusCard">

            <div className="statusHeader">
              <div>
                <span className="statusLabel">
                  ACCOUNT STATUS
                </span>

                <h3>
                  {profileComplete
                    ? "Profile Complete"
                    : "Profile Incomplete"}
                </h3>
              </div>

              <div className="statusIcon">
                {profileComplete ? "✓" : "!"}
              </div>
            </div>


            <div className="statusItems">

              <div className={form.name ? "statusItem done" : "statusItem"}>
                <span>{form.name ? "✓" : "○"}</span>
                Personal details
              </div>

              <div className={form.addressLine ? "statusItem done" : "statusItem"}>
                <span>{form.addressLine ? "✓" : "○"}</span>
                Service address
              </div>

              <div className={locationAvailable ? "statusItem done" : "statusItem"}>
                <span>{locationAvailable ? "✓" : "○"}</span>
                GPS location
              </div>

            </div>

          </div>

        </div>


        {/* PERSONAL INFORMATION */}

        <div className="profileSection">

          <div className="profileSectionHeader">

            <div className="profileSectionIcon">
              👤
            </div>

            <div>
              <h2>Personal Information</h2>

              <p>
                Your basic account information
              </p>
            </div>

          </div>


          <div className="profileFormGrid">

            <div className="profileField">
              <label>Full Name</label>

              <input
                required
                value={form.name}
                onChange={e =>
                  setForm({
                    ...form,
                    name:e.target.value
                  })
                }
                placeholder="Enter your full name"
              />
            </div>


            <div className="profileField">
              <label>Phone Number</label>

              <input
                required
                value={form.phone}
                onChange={e =>
                  setForm({
                    ...form,
                    phone:e.target.value
                  })
                }
                placeholder="Enter your phone number"
              />
            </div>


            <div className="profileField fullWidth">
              <label>Email Address</label>

              <div className="readonlyField">
                {user.email}
                <span>Verified</span>
              </div>
            </div>

          </div>

        </div>


        {/* ADDRESS */}

        <div className="profileSection">

          <div className="profileSectionHeader">

            <div className="profileSectionIcon addressIcon">
              📍
            </div>

            <div>
              <h2>Service Address</h2>

              <p>
                This address is used to find maids near you.
              </p>
            </div>

            <span className="requiredBadge">
              REQUIRED
            </span>

          </div>


          <div className="profileFormGrid">

            <div className="profileField fullWidth">

              <label>
                House / Street Address
              </label>

              <input
                required
                value={form.addressLine}
                onChange={e =>
                  setForm({
                    ...form,
                    addressLine:e.target.value
                  })
                }
                placeholder="House no., street, building..."
              />

            </div>


            <div className="profileField">
              <label>Area / Sector</label>

              <input
                required
                value={form.area}
                onChange={e =>
                  setForm({
                    ...form,
                    area:e.target.value
                  })
                }
                placeholder="e.g. Alpha 1"
              />
            </div>


            <div className="profileField">
              <label>City</label>

              <input
                required
                value={form.city}
                onChange={e =>
                  setForm({
                    ...form,
                    city:e.target.value
                  })
                }
                placeholder="Enter city"
              />
            </div>


            <div className="profileField">
              <label>State</label>

              <input
                required
                value={form.state}
                onChange={e =>
                  setForm({
                    ...form,
                    state:e.target.value
                  })
                }
                placeholder="Enter state"
              />
            </div>


            <div className="profileField">
              <label>PIN Code</label>

              <input
                required
                pattern="[0-9]{6}"
                value={form.pincode}
                onChange={e =>
                  setForm({
                    ...form,
                    pincode:e.target.value
                      .replace(/\D/g,"")
                      .slice(0,6)
                  })
                }
                placeholder="6-digit PIN"
              />
            </div>

          </div>


          {/* GPS */}

          <div className="gpsCard">

            <div className="gpsLeft">

              <div className="gpsIcon">
                📍
              </div>

              <div>

                <h3>
                  Location-based maid matching
                </h3>

                <p>
                  Allow location access to show maids
                  based on their actual distance from you.
                </p>

                <span className={
                  locationAvailable
                    ? "gpsStatus active"
                    : "gpsStatus"
                }>
                  {locationAvailable
                    ? "● Location connected"
                    : "○ Location not connected"}
                </span>

              </div>

            </div>


            <button
              type="button"
              className="locationButton"
              onClick={useLocation}
            >
              📍 Update Current Location
            </button>

          </div>

          {locMsg && (
            <div className="locationMessage">
              {locMsg}
            </div>
          )}

        </div>


        {/* SAVE */}

        <div className="profileSaveBar">

          <div>
            <strong>
              Keep your information up to date
            </strong>

            <p>
              Your address helps MaidMate show relevant
              maids near your location.
            </p>
          </div>

          <button
            className="saveProfileButton"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Profile Changes"}
          </button>

        </div>

      </form>

    </div>
  );
}

function Support() {
  const [messages,setMessages]=useState([]);const [text,setText]=useState("");const user=JSON.parse(localStorage.getItem("user")||"null");
  useEffect(()=>{if(user)api.get("/support").then(r=>setMessages(r.data));},[]);
  const send=async()=>{if(!text.trim())return;if(!user)return;const r=await api.post("/support",{message:text});setMessages(x=>[...x,...r.data]);setText("");};
  return <div className="page supportPage"><div className="pageHead"><div><div className="eyebrow">CUSTOMER CARE</div><h1>How can we help?</h1><p>Chat with support or call our helpline.</p></div></div><div className="supportGrid"><div className="panel helpline"><div className="icon"><Phone/></div><h2>Customer helpline</h2><p>For urgent booking or service issues.</p><a href="tel:+9118001234567">+91 1800-123-4567</a><small>Mon–Sat · 9 AM–8 PM</small></div><div className="panel chat"><div className="chatHead"><MessageCircle/> <div><b>MaidMate Support</b><span>Usually replies quickly</span></div></div><div className="messages">{!user&&<div className="chatHint">Please <Link to="/login">login</Link> to start a support chat.</div>}{messages.map((m,i)=><div key={m._id||i} className={`bubble ${m.sender}`}>{m.message}</div>)}</div>{user&&<div className="chatInput"><input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Type your message..."/><button onClick={send}>Send</button></div>}</div></div></div>
}

function RoleRoute({user, role, children}) {
  const navigate = useNavigate();
  useEffect(()=>{ if(!user || (role && user.role!==role)) navigate("/dashboard", {replace:true}); },[user,role,navigate]);
  if(!user || (role && user.role!==role)) return null;
  return children;
}

function App() {
  const [user,setUser]=useState(()=>JSON.parse(localStorage.getItem("user")||"null"));
  return <><Navbar user={user} setUser={setUser}/><Routes><Route path="/" element={<Home/>}/><Route path="/maids" element={<Maids/>}/><Route path="/maid/:id" element={<MaidDetails user={user}/>}/><Route path="/book/:id" element={<RoleRoute user={user} role="customer"><Booking user={user}/></RoleRoute>}/><Route path="/payment/:id" element={<RoleRoute user={user} role="customer"><Payment user={user}/></RoleRoute>}/><Route path="/login" element={<LoginHub/>}/><Route path="/customer-login" element={<RoleLogin setUser={setUser} role="customer"/>}/><Route path="/maid-login" element={<RoleLogin setUser={setUser} role="maid"/>}/><Route path="/maid-register" element={<MaidRegister/>}/><Route path="/maid-verify" element={<MaidOtp setUser={setUser}/>}/><Route path="/maid-login-verify" element={<MaidOtp setUser={setUser}/>}/><Route path="/admin-login" element={<RoleLogin setUser={setUser} role="admin"/>}/><Route path="/register" element={<Register setUser={setUser}/>}/><Route path="/verify" element={<VerifyOtp setUser={setUser}/>}/><Route path="/dashboard" element={user?<Dashboard user={user}/>:<LoginHub/>}/><Route path="/profile" element={<RoleRoute user={user} role="customer"><CustomerProfile user={user} setUser={setUser}/></RoleRoute>}/><Route path="/support" element={<Support/>}/></Routes><footer><b>MaidMate</b><span>Trusted maid booking platform · Demo project</span><span>© 2026 MaidMate</span></footer></>
}

export default App;
