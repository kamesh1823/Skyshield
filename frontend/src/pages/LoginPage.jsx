import React, { useState } from "react";

const USERS = [
  { username:"admin",   password:"admin123",   role:"Administrator",    initial:"A" },
  { username:"analyst", password:"analyst123", role:"Security Analyst", initial:"S" },
  { username:"demo",    password:"demo",        role:"Demo User",        initial:"D" },
];

const C = {
  ink:"#0F0F0F",ink2:"#171717",ink3:"#1E1E1E",wire:"#2E2E2E",wire2:"#3A3A3A",
  chalk:"#F0EDE8",chalk2:"#B8B5B0",chalk3:"#7A7773",chalk4:"#4A4845",
  gold:"#C8963E",goldLt:"#DFB06A",goldDim:"rgba(200,150,62,.10)",goldWire:"rgba(200,150,62,.22)",
  red:"#C0392B",
};

export default function LoginPage({ onSuccess, onBack, dark, onToggleTheme }) {
  const [form,    setForm]    = useState({ username:"", password:"" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);
  const [focused, setFocused] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const user = USERS.find(u => u.username === form.username && u.password === form.password);
    if (user) onSuccess(user);
    else { setError("Invalid credentials. Please try again."); setLoading(false); }
  };

  const inputStyle = (name) => ({
    width:"100%", background:C.ink3,
    border:`1px solid ${focused===name ? C.gold : C.wire}`,
    boxShadow: focused===name ? `0 0 0 3px rgba(200,150,62,.08)` : "none",
    color:C.chalk, borderRadius:7, padding:"11px 14px",
    fontSize:14, outline:"none", transition:"all .2s", fontFamily:"inherit",
  });

  return (
    <div style={{ minHeight:"100vh", background:C.ink, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 20px", position:"relative", overflow:"hidden", fontFamily:"'Inter',system-ui,sans-serif" }}>

      {/* Ambient glow */}
      <div style={{ position:"absolute", top:-160, right:-160, width:480, height:480, borderRadius:"50%", background:"rgba(200,150,62,.04)", filter:"blur(80px)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:-120, left:-120, width:400, height:400, borderRadius:"50%", background:"rgba(200,150,62,.03)", filter:"blur(80px)", pointerEvents:"none" }} />

      {/* Back */}
      <button onClick={onToggleTheme} style={{ position:"absolute", top:24, right:28, background:"transparent", border:"1px solid var(--wire)", color:"var(--chalk3)", padding:"7px 14px", borderRadius:20, fontSize:12, cursor:"pointer", fontWeight:600 }}>{dark?"☀ Light":"🌙 Dark"}</button>
      <button onClick={onBack} style={{ position:"absolute", top:24, left:28, background:"transparent", border:`1px solid ${C.wire}`, color:C.chalk3, padding:"7px 16px", borderRadius:6, fontSize:12, cursor:"pointer" }}>
        ← Back
      </button>

      {/* Theme Toggle */}
      <button onClick={onToggleTheme} style={{ position:"absolute", top:24, right:28, background:"transparent", border:`1px solid ${C.wire}`, color:C.chalk3, padding:"7px 16px", borderRadius:20, fontSize:12, cursor:"pointer", fontWeight:600 }}>
        {dark ? "☀ Light" : "🌙 Dark"}
      </button>

      <div style={{ width:"100%", maxWidth:400, position:"relative", zIndex:1 }}>

        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ width:60, height:60, borderRadius:"50%", border:`1px solid ${C.goldWire}`, background:C.goldDim, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", fontSize:26 }}>🛡️</div>
          <h1 style={{ fontSize:22, fontWeight:800, color:C.chalk, letterSpacing:.5, marginBottom:4 }}>SkyShield</h1>
          <p style={{ fontSize:12, color:C.chalk4 }}>Network Intrusion Detection System</p>
        </div>

        {/* Card */}
        <div style={{ background:C.ink2, border:`1px solid ${C.wire}`, borderRadius:12, padding:"32px 30px", boxShadow:"0 24px 64px rgba(0,0,0,.5)" }}>

          {/* top gold rule */}
          <div style={{ height:1, background:`linear-gradient(90deg, ${C.gold}, transparent)`, marginBottom:28 }} />

          <form onSubmit={submit}>

            {/* Username */}
            <div style={{ marginBottom:14 }}>
              <label style={{ display:"block", fontSize:9.5, fontWeight:700, letterSpacing:1.8, textTransform:"uppercase", color:C.chalk4, marginBottom:7 }}>Username</label>
              <input type="text" placeholder="Enter username" required
                value={form.username} onChange={e => setForm({...form,username:e.target.value})}
                onFocus={()=>setFocused("u")} onBlur={()=>setFocused("")}
                style={inputStyle("u")} />
            </div>

            {/* Password */}
            <div style={{ marginBottom:22 }}>
              <label style={{ display:"block", fontSize:9.5, fontWeight:700, letterSpacing:1.8, textTransform:"uppercase", color:C.chalk4, marginBottom:7 }}>Password</label>
              <div style={{ position:"relative" }}>
                <input type={showPw?"text":"password"} placeholder="Enter password" required
                  value={form.password} onChange={e => setForm({...form,password:e.target.value})}
                  onFocus={()=>setFocused("p")} onBlur={()=>setFocused("")}
                  style={{ ...inputStyle("p"), paddingRight:42 }} />
                <button type="button" onClick={()=>setShowPw(v=>!v)}
                  style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:14, color:C.chalk4, padding:4 }}>
                  {showPw?"🙈":"👁️"}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background:"rgba(192,57,43,.08)", border:`1px solid rgba(192,57,43,.2)`, borderRadius:6, padding:"9px 13px", fontSize:12, color:C.red, marginBottom:16 }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              width:"100%", background:C.gold, color:C.ink, border:"none",
              padding:"12px", borderRadius:7, fontWeight:700, fontSize:14,
              cursor:loading?"not-allowed":"pointer", marginBottom:10,
              opacity:loading?.75:1, transition:"all .2s", fontFamily:"inherit",
            }}>
              {loading ? "Authenticating…" : "Login to Dashboard"}
            </button>

            <button type="button" onClick={()=>setForm({username:"admin",password:"admin123"})} style={{
              width:"100%", background:"transparent", border:`1px solid ${C.wire}`,
              color:C.chalk3, padding:"9px", borderRadius:7, fontSize:12,
              cursor:"pointer", fontFamily:"inherit",
            }}>
              Use Demo Credentials
            </button>
          </form>

          {/* Accounts */}
          <div style={{ marginTop:22, paddingTop:18, borderTop:`1px solid ${C.wire}` }}>
            <div style={{ fontSize:9, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:C.chalk4, marginBottom:12 }}>Available Accounts</div>
            {USERS.map(u => (
              <div key={u.username} onClick={()=>setForm({username:u.username,password:u.password})}
                style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:6, cursor:"pointer", marginBottom:4, transition:"background .15s" }}
                onMouseEnter={e=>e.currentTarget.style.background=C.ink3}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{ width:26, height:26, borderRadius:"50%", background:`linear-gradient(135deg,${C.gold},#8B6914)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:C.ink, flexShrink:0 }}>{u.initial}</div>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:C.chalk2 }}>{u.role}</div>
                  <div style={{ fontSize:10.5, color:C.gold, fontFamily:"monospace" }}>{u.username} / {u.password}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
