import React, { useEffect, useRef, useState } from "react";
import MLComparison from "./MLComparison";

const C = () => ({
  ink:      "var(--ink)",
  ink2:     "var(--ink2)",
  ink3:     "var(--ink3)",
  wire:     "var(--wire)",
  chalk:    "var(--chalk)",
  chalk2:   "var(--chalk2)",
  chalk3:   "var(--chalk3)",
  chalk4:   "var(--chalk4)",
  gold:     "var(--gold)",
  goldLt:   "var(--gold-lt)",
  goldDim:  "var(--gold-dim)",
  goldWire: "var(--gold-wire)",
  green:    "#27AE60",
  red:      "#C0392B",
});


const SERVERS = [
  { icon:"🎓", name:"Student Portal",  dept:"IT Department",  ip:"192.168.1.10" },
  { icon:"📝", name:"Exam Database",   dept:"Exam Cell",      ip:"192.168.1.20" },
  { icon:"📚", name:"Library Server",  dept:"Library",        ip:"192.168.1.30" },
  { icon:"🔐", name:"Admin Panel",     dept:"Administration", ip:"192.168.1.40" },
  { icon:"👨‍🏫",name:"Faculty Portal", dept:"Academic Dept",  ip:"192.168.1.50" },
  { icon:"📊", name:"Result Server",   dept:"Exam Cell",      ip:"192.168.1.60" },
];

function useCountUp(target, duration=1400) {
  const [val, setVal] = useState(0);
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return; done.current = true;
    const start = performance.now();
    const tick = now => {
      const p = Math.min((now - start) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return val;
}

export default function HomePage({ onGetStarted, dark, onToggleTheme }) {
  const c = C();
  const packets = useCountUp(2847, 1500);
  const [nav,   setNav]   = useState(false);

  useEffect(() => {
    const fn = () => setNav(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);


  return (
    <div style={{ background:c.ink, color:c.chalk2, fontFamily:"'Inter',system-ui,sans-serif", minHeight:"100vh", transition:"background .3s, color .3s" }}>

      {/* ── NAV ─────────────────────────────────────────── */}
      <nav style={{
        position:"sticky", top:0, zIndex:100,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 52px", height:60,
        background: nav ? (dark?"rgba(15,15,15,.96)":"rgba(245,243,239,.96)") : "transparent",
        borderBottom: nav ? `1px solid ${c.wire}` : "1px solid transparent",
        backdropFilter:"blur(14px)", transition:"all .3s",
      }}>
        {/* Brand */}
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <span style={{ fontSize:20 }}>🛡️</span>
          <span style={{ fontSize:16, fontWeight:800, color:c.chalk, letterSpacing:.5 }}>SkyShield</span>
          <span style={{ fontSize:10, color:c.chalk4, background:c.ink3, padding:"2px 8px", borderRadius:4, border:`1px solid ${c.wire}` }}>NIDS</span>
        </div>

        {/* Links */}
        <div style={{ display:"flex", gap:28, alignItems:"center" }}>
          {[["#models","ML Models"],["#network","Network"],["#about","How It Works"]].map(([h,l]) => (
            <a key={h} href={h} style={{ fontSize:13, color:c.chalk3, textDecoration:"none" }}>{l}</a>
          ))}
        </div>

        {/* Right: theme toggle + login */}
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {/* ── THEME TOGGLE ── */}
          <button onClick={onToggleTheme} className="theme-toggle" title="Toggle light/dark mode">
            {dark ? "☀ Light" : "🌙 Dark"}
          </button>
          <button onClick={onGetStarted} style={{
            background:"transparent", border:`1px solid ${c.goldWire}`,
            color:c.gold, padding:"7px 20px", borderRadius:6,
            fontSize:13, fontWeight:600, cursor:"pointer", transition:"all .2s",
          }}
            onMouseEnter={e=>{e.target.style.background=c.goldDim}}
            onMouseLeave={e=>{e.target.style.background="transparent"}}>
            Enter Dashboard
          </button>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{ padding:"96px 52px 76px", maxWidth:860, margin:"0 auto", textAlign:"center", position:"relative" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 60% 40% at 50% 0%, var(--gold-dim) 0%, transparent 70%)", pointerEvents:"none" }} />

        <div style={{ display:"inline-flex", alignItems:"center", gap:7, fontSize:11, color:c.gold, background:c.goldDim, padding:"5px 16px", borderRadius:20, border:`1px solid ${c.goldWire}`, marginBottom:30, letterSpacing:1, fontWeight:600, textTransform:"uppercase" }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:c.gold, display:"inline-block" }} />
          Anna University · Campus Network Protection
        </div>

        <h1 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:52, fontWeight:800, lineHeight:1.13, color:c.chalk, marginBottom:20, position:"relative" }}>
          Intelligent Network<br />
          <span style={{ color:c.goldLt }}>Intrusion Detection</span>
        </h1>

        <p style={{ fontSize:15.5, color:c.chalk3, lineHeight:1.78, maxWidth:580, margin:"0 auto 38px", position:"relative" }}>
          SkyShield deploys a hybrid ensemble of machine learning classifiers to monitor
          live campus traffic, detect cyber attacks in real time, and automatically
          quarantine malicious sources — protecting every university server.
        </p>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:22, marginBottom:52, flexWrap:"wrap", position:"relative" }}>
          <button onClick={onGetStarted} style={{
            background:c.gold, color:"var(--ink)", border:"none",
            padding:"13px 34px", borderRadius:7, fontWeight:700, fontSize:15,
            cursor:"pointer", boxShadow:"0 4px 20px var(--gold-dim)", transition:"all .2s",
          }}>
            Launch Dashboard →
          </button>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-start", gap:2 }}>
            <span style={{ fontSize:10, color:c.chalk4, textTransform:"uppercase", letterSpacing:1.5 }}>Packets Analysed</span>
            <span style={{ fontSize:22, fontWeight:700, color:c.goldLt, fontFamily:"monospace" }}>{packets.toLocaleString()}</span>
          </div>
        </div>

        {/* KPI strip */}
        <div style={{ display:"flex", justifyContent:"center", gap:0, borderTop:`1px solid ${c.wire}`, borderBottom:`1px solid ${c.wire}`, position:"relative" }}>
          {[["96.4%","Hybrid Accuracy",c.goldLt],["4","Attack Types",c.chalk],["6","Campus Servers",c.chalk],["2 s","Live Refresh",c.chalk]].map(([v,l,col],i,arr)=>(
            <div key={l} style={{ flex:1, padding:"20px 0", textAlign:"center", borderRight:i<arr.length-1?`1px solid ${c.wire}`:"none" }}>
              <div style={{ fontSize:24, fontWeight:700, color:col, fontFamily:"monospace", marginBottom:4 }}>{v}</div>
              <div style={{ fontSize:10, color:c.chalk4, textTransform:"uppercase", letterSpacing:1 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ML MODEL COMPARISON ───────────────────────────── */}
      <section id="models" style={{ padding:"76px 52px", maxWidth:1080, margin:"0 auto" }}>
        <MLComparison />
      </section>


      {/* ── CAMPUS NETWORK ────────────────────────────────── */}
      <section id="network" style={{ padding:"72px 52px", background:c.ink2, borderTop:`1px solid ${c.wire}`, borderBottom:`1px solid ${c.wire}` }}>
        <div style={{ maxWidth:1080, margin:"0 auto" }}>
          <div style={{ marginBottom:40 }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:c.gold, marginBottom:12 }}>Protected Infrastructure</div>
            <h2 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:32, fontWeight:800, color:c.chalk }}>University Network</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))", gap:13 }}>
            {SERVERS.map(sv=>(
              <div key={sv.ip} style={{ background:c.ink3, border:`1px solid ${c.wire}`, borderTop:`2px solid ${c.goldWire}`, borderRadius:10, padding:20 }}>
                <div style={{ fontSize:26, marginBottom:9 }}>{sv.icon}</div>
                <div style={{ fontSize:13.5, fontWeight:700, color:c.chalk, marginBottom:4 }}>{sv.name}</div>
                <div style={{ fontSize:10.5, fontFamily:"monospace", color:c.chalk4, marginBottom:10 }}>{sv.ip}</div>
                <span style={{ fontSize:10.5, color:c.gold, background:c.goldDim, border:`1px solid ${c.goldWire}`, padding:"3px 10px", borderRadius:20 }}>{sv.dept}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <section id="about" style={{ padding:"76px 52px", maxWidth:1080, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:48, alignItems:"start" }}>
          <div>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:c.gold, marginBottom:14 }}>How It Works</div>
            <h2 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:30, fontWeight:800, color:c.chalk, lineHeight:1.2, marginBottom:18 }}>Six-Module Pipeline</h2>
            <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
              {[["01","Data Collection","Packet capture — IP, protocol, service, size"],["02","Preprocessing","Label encode, normalise, impute, deduplicate"],["03","Feature Selection","Chi-Square + RF importance ranking"],["04","Hybrid ML Training","Weighted DT + RF + SVM ensemble"],["05","Attack Detection","Real-time classify + auto IP block"],["06","Dashboard","React SPA with live stats and alerts"]].map(([n,nm,d],i,arr)=>(
                <div key={n} style={{ display:"flex", gap:16, paddingBottom:i<arr.length-1?18:0, marginBottom:i<arr.length-1?18:0, borderBottom:i<arr.length-1?`1px solid ${c.wire}`:"none" }}>
                  <div style={{ fontSize:10, fontWeight:700, color:c.gold, fontFamily:"monospace", width:18, flexShrink:0, marginTop:2 }}>{n}</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:c.chalk, marginBottom:2 }}>{nm}</div>
                    <div style={{ fontSize:12, color:c.chalk3 }}>{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:c.gold, marginBottom:14 }}>Attacks Classified</div>
            <h2 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:30, fontWeight:800, color:c.chalk, lineHeight:1.2, marginBottom:24 }}>Four Categories</h2>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {[["DoS","Denial of Service","High-volume flooding to deny access to campus servers","#C0392B"],["Probe","Network Scanning","Reconnaissance scanning of campus ports and services","#D68910"],["R2L","Remote to Local","Unauthorised remote access to internal systems","#7D3C98"],["U2R","User to Root","Privilege escalation attacks on campus machines","#1E8449"]].map(([code,name,desc,col])=>(
                <div key={code} style={{ display:"flex", gap:16, padding:"15px 17px", background:c.ink2, border:`1px solid ${c.wire}`, borderLeft:`2px solid ${col}`, borderRadius:8 }}>
                  <div style={{ fontSize:13, fontWeight:800, color:col, fontFamily:"monospace", width:36, flexShrink:0 }}>{code}</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:c.chalk, marginBottom:3 }}>{name}</div>
                    <div style={{ fontSize:12, color:c.chalk3 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section style={{ padding:"76px 52px", textAlign:"center", background:c.ink2, borderTop:`1px solid ${c.wire}`, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:600, height:200, background:"var(--gold-dim)", borderRadius:"50%", filter:"blur(60px)", pointerEvents:"none" }}/>
        <div style={{ fontSize:10, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:c.gold, marginBottom:14, position:"relative" }}>Ready to begin</div>
        <h2 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:36, fontWeight:800, color:c.chalk, marginBottom:14, position:"relative" }}>Protect your campus network.</h2>
        <p style={{ fontSize:14, color:c.chalk3, marginBottom:32, position:"relative" }}>Log in to the live SkyShield dashboard and start monitoring traffic now.</p>
        <button onClick={onGetStarted} style={{ background:c.gold, color:"var(--ink)", border:"none", padding:"13px 34px", borderRadius:7, fontWeight:700, fontSize:15, cursor:"pointer", position:"relative" }}>
          Login to Dashboard
        </button>
      </section>

      {/* FOOTER */}
      <footer style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:10, padding:"18px 52px", borderTop:`1px solid ${c.wire}`, fontSize:11, color:c.chalk4 }}>
        <span>🛡️ <strong style={{ color:c.chalk3 }}>SkyShield</strong> — Network Intrusion Detection System</span>
        <span>Hybrid ML · 96.4% Accuracy · Anna University</span>
      </footer>
    </div>
  );
}
