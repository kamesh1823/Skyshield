import React, { useState, useEffect, useCallback } from "react";
import UniversityNetwork from "./UniversityNetwork";

const API = "http://localhost:5000/api";

const NAV = [
  { id:"university", icon:"🏛️", label:"University Network" },
  { id:"dashboard",  icon:"📊", label:"Dashboard"          },
  { id:"packets",    icon:"📡", label:"Live Packets"       },
  { id:"alerts",     icon:"🚨", label:"Alerts"             },
  { id:"analyzer",   icon:"🔬", label:"Packet Analyzer"   },
  { id:"blocked",    icon:"🛡️", label:"Blocked IPs"       },
  { id:"model",      icon:"🤖", label:"ML Models"         },
];

/* ── Dashboard ──────────────────────────────────────────────────── */
function Dashboard({ stats, alerts, packets }) {
  if (!stats) return (
    <div style={{ padding:24, fontSize:13, color:"var(--chalk4)", lineHeight:1.8 }}>
      ⚠ Waiting for backend…<br />
      Make sure <code style={{ background:"var(--ink3)", padding:"1px 6px", borderRadius:4, fontSize:12 }}>python app.py</code> is running on port 5000, then refresh.
    </div>
  );

  const recent = packets.filter(p=>p.attack_type!=="Normal").slice(0,5);

  return (
    <div>
      <div className="stats-grid">
        {[["Total Packets",stats.total.toLocaleString(),"gold"],["Attacks Detected",stats.attacks.toLocaleString(),"red"],["Normal Traffic",stats.normal.toLocaleString(),"green"],["IPs Blocked",stats.blocked_ips,"amber"],["Attack Rate",`${stats.attack_rate}%`,"red"],["Hybrid Accuracy","96.4%","gold"]].map(([l,v,c])=>(
          <div key={l} className="stat-card">
            <div className="stat-label">{l}</div>
            <div className={`stat-value ${c}`}>{v}</div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        <div className="card card-sm">
          <div className="card-label">⚠ Recent Attacks</div>
          {recent.length===0
            ? <p style={{ color:"#27AE60", fontSize:13 }}>✓ No attacks detected recently</p>
            : <div className="tbl-wrap">
                <table className="tbl">
                  <thead><tr><th>Source IP</th><th>Server</th><th>Type</th><th>Status</th></tr></thead>
                  <tbody>
                    {recent.map((p,i)=>(
                      <tr key={i}>
                        <td className="mono">{p.src_ip}</td>
                        <td style={{ fontSize:12 }}>{p.server_name||p.dst_ip}</td>
                        <td style={{ color:"#C0392B", fontWeight:600, fontSize:12 }}>{p.attack_type}</td>
                        <td><span className="badge badge-red">Blocked</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          }
        </div>

        <div className="card card-sm">
          <div className="card-label">🤖 ML Performance</div>
          {Object.entries(stats.model_accuracies||{}).map(([name,acc])=>(
            <div key={name} style={{ marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:6 }}>
                <span style={{ color:"var(--chalk2)" }}>{name}</span>
                <span style={{ color:"var(--gold)", fontWeight:600, fontFamily:"monospace" }}>{acc}%</span>
              </div>
              <div className="pbar-wrap"><div className="pbar-fill" style={{ width:`${acc}%` }} /></div>
            </div>
          ))}
        </div>

        <div className="card card-sm">
          <div className="card-label">🚨 Latest Alerts</div>
          {alerts.slice(0,3).map((a,i)=>(
            <div className="alert-row" key={i}>
              <div className="alert-icon">⚠</div>
              <div>
                <div className="alert-title">{a.attack_type} — {a.server_name||a.dst_ip}</div>
                <div className="alert-meta">
                  {a.src_ip} → {a.dst_ip}<br/>
                  {a.timestamp} · {a.department||""} · {a.action}
                </div>
              </div>
            </div>
          ))}
          {alerts.length===0 && <p style={{ fontSize:12, color:"var(--chalk4)" }}>No alerts yet</p>}
        </div>

        <div className="card card-sm">
          <div className="card-label">📊 Traffic</div>
          {[{l:"Normal",v:stats.normal,p:100-stats.attack_rate,c:"#27AE60"},{l:"Attacks",v:stats.attacks,p:stats.attack_rate,c:"#C0392B"},{l:"Blocked",v:stats.blocked,p:stats.attack_rate,c:"#D68910"}].map(row=>(
            <div key={row.l} style={{ marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:6 }}>
                <span style={{ color:"var(--chalk3)" }}>{row.l}</span>
                <span style={{ color:row.c, fontWeight:600, fontFamily:"monospace" }}>{row.v.toLocaleString()}</span>
              </div>
              <div className="pbar-wrap"><div className="pbar-fill" style={{ width:`${row.p}%`, background:row.c }} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Packet Table ───────────────────────────────────────────────── */
function PacketTable({ packets }) {
  const [f, setF] = useState("all");
  const shown = f==="all"?packets:f==="attacks"?packets.filter(p=>p.attack_type!=="Normal"):packets.filter(p=>p.attack_type==="Normal");
  return (
    <div>
      <div style={{ display:"flex", gap:8, marginBottom:16, alignItems:"center" }}>
        {["all","attacks","normal"].map(v=>(
          <button key={v} className={`btn btn-sm ${f===v?"btn-gold":"btn-outline"}`} onClick={()=>setF(v)} style={{ textTransform:"capitalize" }}>{v}</button>
        ))}
        <span style={{ marginLeft:"auto", fontSize:11, color:"var(--chalk4)" }}>{shown.length} packets</span>
      </div>
      <div className="card" style={{ padding:0 }}>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>#</th><th>Time</th><th>Source IP</th><th>Server</th><th>Dept</th><th>Proto</th><th>Size</th><th>Attack Type</th><th>Conf.</th><th>Status</th></tr></thead>
            <tbody>
              {shown.map((p,i)=>(
                <tr key={i}>
                  <td className="mono" style={{ color:"var(--chalk4)" }}>{p.id}</td>
                  <td className="mono">{p.timestamp}</td>
                  <td className="mono">{p.src_ip}</td>
                  <td style={{ fontSize:12 }}>{p.server_name||p.dst_ip}</td>
                  <td style={{ fontSize:11, color:"var(--chalk4)" }}>{p.department||"—"}</td>
                  <td><span className="badge badge-dim" style={{ fontSize:10 }}>{p.protocol}</span></td>
                  <td className="mono">{p.packet_size}</td>
                  <td style={{ fontSize:12, fontWeight:600, color:p.attack_type==="Normal"?"#27AE60":"#C0392B" }}>{p.attack_type}</td>
                  <td className="mono">{(p.confidence*100).toFixed(1)}%</td>
                  <td><span className={`badge ${p.status==="Allowed"?"badge-green":"badge-red"}`}>{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Alert Log ──────────────────────────────────────────────────── */
function AlertLog({ alerts }) {
  return (
    <div>
      <div style={{ marginBottom:16 }}>
        <span className="badge badge-red">{alerts.length} Alerts</span>
      </div>
      {alerts.length===0
        ? <div className="card" style={{ textAlign:"center", padding:60 }}>
            <div style={{ fontSize:40, marginBottom:12 }}>✓</div>
            <div style={{ color:"#27AE60", fontSize:14 }}>No attacks detected</div>
          </div>
        : alerts.map((a,i)=>(
          <div className="alert-row" key={i}>
            <div className="alert-icon">⚠</div>
            <div>
              <div className="alert-title">🚨 {a.attack_type} — {a.server_name||a.dst_ip}</div>
              <div className="alert-meta">
                {a.timestamp} &nbsp;·&nbsp; {a.src_ip} → {a.dst_ip}<br/>
                {a.department||""} &nbsp;·&nbsp; {a.action} &nbsp;·&nbsp; {(a.confidence*100).toFixed(1)}% confidence
              </div>
            </div>
          </div>
        ))
      }
    </div>
  );
}

/* ── Analyzer ───────────────────────────────────────────────────── */
function Analyzer() {
  const [form, setForm]     = useState({ src_ip:"45.33.32.156", protocol:"TCP", packet_size:1400, duration:0, target_server:"192.168.1.10" });
  const [result, setResult] = useState(null);
  const [loading, setLoad]  = useState(false);
  const [err, setErr]       = useState("");

  const analyze = async () => {
    setLoad(true); setErr(""); setResult(null);
    try {
      const r = await fetch(`${API}/analyze`,{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
      setResult(await r.json());
    } catch { setErr("Cannot reach backend. Make sure python app.py is running on port 5000."); }
    setLoad(false);
  };

  return (
    <div>
      <div className="card" style={{ marginBottom:18 }}>
        <div className="card-label">🔬 Packet Analyzer</div>
        <div className="grid-2">
          <div className="field"><label>Source IP</label><input value={form.src_ip} onChange={e=>setForm({...form,src_ip:e.target.value})} /></div>
          <div className="field"><label>Protocol</label>
            <select value={form.protocol} onChange={e=>setForm({...form,protocol:e.target.value})}>
              {["TCP","UDP","ICMP"].map(p=><option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="field"><label>Packet Size (bytes)</label><input type="number" value={form.packet_size} onChange={e=>setForm({...form,packet_size:+e.target.value})} /></div>
          <div className="field"><label>Duration (seconds)</label><input type="number" value={form.duration} onChange={e=>setForm({...form,duration:+e.target.value})} /></div>
          <div className="field span-2"><label>Target Server</label>
            <select value={form.target_server} onChange={e=>setForm({...form,target_server:e.target.value})}>
              {[["192.168.1.10","Student Portal"],["192.168.1.20","Exam Database"],["192.168.1.30","Library Server"],["192.168.1.40","Admin Panel"],["192.168.1.50","Faculty Portal"],["192.168.1.60","Result Server"]].map(([ip,n])=>(
                <option key={ip} value={ip}>{n} ({ip})</option>
              ))}
            </select>
          </div>
        </div>
        {err && <p style={{ color:"#C0392B", fontSize:12, marginTop:8 }}>⚠ {err}</p>}
        <button className="btn btn-gold" onClick={analyze} disabled={loading} style={{ marginTop:10 }}>
          {loading?"Analysing…":"Analyse Packet"}
        </button>
      </div>

      {result && (
        <div className="result-block">
          <h3 style={{ fontSize:15, fontWeight:700, marginBottom:16, color:result.final_result==="Normal"?"#27AE60":"#C0392B" }}>
            {result.final_result==="Normal"?"✓ Normal Traffic":`⚠ ${result.final_result} Detected`}
          </h3>
          {[["Source IP",result.src_ip],["Target Server",result.target_server],["Department",result.department],["Protocol",result.protocol],["Packet Size",`${result.packet_size} bytes`],["Duration",`${result.duration}s`],["Final Result",result.final_result],["Confidence",`${(result.confidence*100).toFixed(1)}%`],["Action",result.status]].map(([k,v])=>(
            <div className="result-row" key={k}>
              <span>{k}</span><span className="mono">{v}</span>
            </div>
          ))}
          <div style={{ marginTop:18 }}>
            <div className="card-label" style={{ marginBottom:10 }}>Per-Algorithm Breakdown</div>
            {Object.entries(result.algorithm_results||{}).map(([algo,r])=>(
              <div className="result-row" key={algo}>
                <span>{algo}</span>
                <span style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <span className={`badge ${r.prediction==="Normal"?"badge-green":"badge-red"}`}>{r.prediction}</span>
                  <span className="mono">{(r.confidence*100).toFixed(1)}%</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Blocked IPs ────────────────────────────────────────────────── */
function BlockedIPs() {
  const [ips, setIps] = useState([]);
  const load = async()=>{ try{ setIps(await fetch(`${API}/blocked-ips`).then(r=>r.json())); }catch{} };
  useEffect(()=>{ load(); const id=setInterval(load,3000); return()=>clearInterval(id); },[]);
  const unblock = async ip=>{ await fetch(`${API}/blocked-ips/${ip}`,{method:"DELETE"}); load(); };
  return (
    <div>
      <div style={{ marginBottom:14 }}><span className="badge badge-red">{ips.length} IPs Blocked</span></div>
      <div className="card">
        <div className="card-label">🛡️ Quarantined Addresses</div>
        {ips.length===0
          ? <p style={{ fontSize:12, color:"var(--chalk4)" }}>No IPs currently blocked</p>
          : ips.map((ip,i)=>(
            <div className="ip-chip" key={i}>
              <span>🚫 {ip}</span>
              <button onClick={()=>unblock(ip)}>Unblock</button>
            </div>
          ))
        }
      </div>
    </div>
  );
}

/* ── ML Models ──────────────────────────────────────────────────── */
function MLModels() {
  const models = [
    { name:"Decision Tree",  acc:92.0, w:"25%", color:"var(--gold)", desc:"Entropy/Gini splits on 6 features. Fast, interpretable, used as baseline." },
    { name:"Random Forest",  acc:95.0, w:"40%", color:"#27AE60",     desc:"100-tree bootstrap ensemble. Best standalone accuracy — given highest weight." },
    { name:"SVM (RBF)",      acc:94.0, w:"35%", color:"#7D3C98",     desc:"Radial Basis Function kernel for non-linear class separation." },
    { name:"★ Hybrid Model", acc:96.4, w:"—",   color:"var(--gold)", desc:"Weighted vote: RF 40% + SVM 35% + DT 25%. Outperforms every individual model.", highlight:true },
  ];
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {models.map(m=>(
        <div key={m.name} className="card card-sm" style={{ borderLeft:m.highlight?"2px solid var(--gold)":"2px solid transparent" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:m.highlight?"var(--chalk)":"var(--chalk2)", marginBottom:5 }}>{m.name}</div>
              <div style={{ fontSize:12, color:"var(--chalk3)", maxWidth:500 }}>{m.desc}</div>
            </div>
            <div style={{ textAlign:"right", flexShrink:0, marginLeft:20 }}>
              <div style={{ fontSize:28, fontWeight:700, color:m.color, fontFamily:"monospace" }}>{m.acc}%</div>
              {m.w!=="—" && <div style={{ fontSize:10, color:"var(--chalk4)", marginTop:2 }}>Weight: {m.w}</div>}
            </div>
          </div>
          <div className="pbar-wrap"><div className="pbar-fill" style={{ width:`${m.acc}%`, background:m.color }} /></div>
        </div>
      ))}
    </div>
  );
}

/* ── Shell ──────────────────────────────────────────────────────── */
export default function MainApp({ user, onLogout, dark, onToggleTheme }) {
  const [page, setPage]           = useState("university");
  const [stats, setStats]         = useState(null);
  const [packets, setPackets]     = useState([]);
  const [alerts, setAlerts]       = useState([]);
  const [time, setTime]           = useState(new Date().toLocaleTimeString());
  const [showLogout, setShowLogout] = useState(false);

  const fetchAll = useCallback(async()=>{
    try {
      const [s,p,a] = await Promise.all([
        fetch(`${API}/stats`).then(r=>r.json()),
        fetch(`${API}/packets?limit=40`).then(r=>r.json()),
        fetch(`${API}/alerts`).then(r=>r.json()),
      ]);
      setStats(s); setPackets(p); setAlerts(a);
    } catch {}
  },[]);

  useEffect(()=>{
    fetchAll();
    const d=setInterval(fetchAll,2000);
    const c=setInterval(()=>setTime(new Date().toLocaleTimeString()),1000);
    return()=>{clearInterval(d);clearInterval(c);};
  },[fetchAll]);

  const active = NAV.find(n=>n.id===page);

  return (
    <div className="app-shell">

      {/* ── Sidebar ─────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-head">
          <div className="brand-row">
            <span className="brand-icon">🛡️</span>
            <span className="brand-name">SkyShield</span>
          </div>
          <div className="brand-sub">University NIDS</div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(n=>(
            <div key={n.id} className={`nav-item ${page===n.id?"active":""}`} onClick={()=>setPage(n.id)}>
              <span className="nav-icon">{n.icon}</span>
              {n.label}
              {n.id==="alerts" && alerts.length>0 && <span className="nav-badge">{alerts.length}</span>}
            </div>
          ))}
        </nav>

        <div className="sidebar-foot">
          {user && (
            <div className="user-row">
              <div className="user-av">{(user.initial||user.username[0]).toUpperCase()}</div>
              <div>
                <span className="user-name">{user.username}</span>
                <span className="user-role">{user.role}</span>
              </div>
            </div>
          )}
          <div className="live-row">
            <span className="pulse-dot" />
            Live Monitoring
          </div>
          <button className="logout-btn" onClick={()=>setShowLogout(true)}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────── */}
      <main className="main-area">
        <header className="topbar">
          <h1 className="topbar-title">{active?.label}</h1>
          <div className="topbar-right">
            {alerts.length>0 && <span className="badge badge-red">🚨 {alerts.length} Alert{alerts.length>1?"s":""}</span>}
            <span className="badge badge-green">● Online</span>
            <span className="topbar-time">{time}</span>
          </div>
        </header>
        <div className="page-body">
          {page==="university" && <UniversityNetwork />}
          {page==="dashboard"  && <Dashboard stats={stats} alerts={alerts} packets={packets} />}
          {page==="packets"    && <PacketTable packets={packets} />}
          {page==="alerts"     && <AlertLog alerts={alerts} />}
          {page==="analyzer"   && <Analyzer />}
          {page==="blocked"    && <BlockedIPs />}
          {page==="model"      && <MLModels />}
        </div>
      </main>

      {/* ── Logout modal ────────────────────────────── */}
      {showLogout && (
        <div className="modal-bg" onClick={()=>setShowLogout(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize:32, marginBottom:14 }}>🚪</div>
            <h2 style={{ fontSize:18, fontWeight:700, color:"var(--chalk)", marginBottom:8 }}>Logout</h2>
            <p style={{ color:"var(--chalk3)", fontSize:13, marginBottom:24 }}>You will be returned to the home page.</p>
            <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
              <button className="btn btn-ghost" onClick={()=>setShowLogout(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={onLogout}>Yes, Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
