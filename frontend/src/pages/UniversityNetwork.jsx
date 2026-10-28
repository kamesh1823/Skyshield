import React, { useState, useEffect } from "react";

const API = "http://localhost:5000/api";

const ICONS = {
  "Student Portal": "🎓", "Exam Database": "📝",
  "Library Server": "📚", "Admin Panel":   "🔐",
  "Faculty Portal": "👨‍🏫","Result Server":  "📊",
};

export default function UniversityNetwork() {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const load = async () => {
    try {
      const d = await fetch(`${API}/servers`).then(r => r.json());
      setServers(d); setError("");
    } catch {
      setError("Cannot connect. Make sure python app.py is running on port 5000.");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, []);

  const safe      = servers.filter(s => s.status === "Safe").length;
  const underAtk  = servers.filter(s => s.status !== "Safe").length;
  const protected_ = servers.filter(s => s.protected).length;
  const totalAtk  = servers.reduce((n, s) => n + s.attack_count, 0);

  if (loading) return (
    <p style={{ color: "var(--chalk4)", padding: 20, fontSize: 13 }}>
      Connecting to university network…
    </p>
  );

  return (
    <div>
      {error && (
        <div style={{ background: "rgba(192,57,43,.08)", border: "1px solid rgba(192,57,43,.2)", borderRadius: 8, padding: "11px 16px", marginBottom: 18, color: "#C0392B", fontSize: 13 }}>
          ⚠ {error}
        </div>
      )}

      {/* Summary */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          ["Campus Servers",   servers.length, ""],
          ["Servers Safe",     safe,           "green"],
          ["Under Threat",     underAtk,       underAtk > 0 ? "red" : "green"],
          ["Attacks Blocked",  totalAtk,       "amber"],
        ].map(([l, v, c]) => (
          <div key={l} className="stat-card">
            <div className="stat-label">{l}</div>
            <div className={`stat-value ${c}`}>{v}</div>
          </div>
        ))}
      </div>

      {/* SkyShield status banner */}
      {underAtk === 0 && (
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "13px 18px", marginBottom: 18,
          background: "rgba(39,174,96,.07)",
          border: "1px solid rgba(39,174,96,.22)",
          borderRadius: 8, fontSize: 13,
        }}>
          <span style={{ fontSize: 20 }}>🛡️</span>
          <div>
            <div style={{ fontWeight: 700, color: "#27AE60", marginBottom: 2 }}>
              SkyShield is protecting all campus servers
            </div>
            <div style={{ fontSize: 12, color: "var(--chalk4)" }}>
              All {servers.length} servers are safe. Attacks are being detected and blocked automatically.
              {protected_ > 0 && ` ${protected_} server${protected_>1?"s were":"was"} attacked earlier and successfully protected.`}
            </div>
          </div>
        </div>
      )}

      {/* Server cards */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-label">🏛️ Anna University — Campus Network Topology</div>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 18, fontSize: 11, color: "var(--chalk4)", flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#27AE60", display: "inline-block" }} /> Safe
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#C0392B", display: "inline-block" }} /> Under Attack (last 60 s)
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--gold)", display: "inline-block" }} /> Protected (attack stopped)
          </span>
          <span style={{ marginLeft: "auto" }}>Refreshes every 3 s</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
          {servers.map(sv => {
            const isAtk   = sv.status !== "Safe";
            const wasAtk  = sv.protected; // attacked before but now safe
            const borderC = isAtk ? "#C0392B" : wasAtk ? "var(--gold)" : "#27AE60";
            return (
              <div key={sv.ip} style={{
                background: "var(--ink3)", border: `1px solid var(--wire)`,
                borderLeft: `3px solid ${borderC}`,
                borderRadius: "var(--r-lg)", padding: 20, transition: "border-color .3s",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--chalk)", marginBottom: 4 }}>
                      {ICONS[sv.name] || "🖥️"}  {sv.name}
                    </div>
                    <div style={{ fontFamily: "monospace", fontSize: 11, color: "var(--chalk4)" }}>{sv.ip}</div>
                  </div>
                  {isAtk
                    ? <span className="badge badge-red">⚠ Under Attack</span>
                    : wasAtk
                      ? <span className="badge badge-gold">🛡 Protected</span>
                      : <span className="badge badge-green">✓ Safe</span>
                  }
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: isAtk || sv.attack_count > 0 ? 10 : 0 }}>
                  <span className="badge badge-dim" style={{ fontSize: 10 }}>{sv.department}</span>
                  <span className="badge badge-dim" style={{ fontSize: 10 }}>{sv.service}</span>
                  {sv.attack_count > 0 && (
                    <span className={`badge ${isAtk ? "badge-red" : "badge-gold"}`} style={{ fontSize: 10 }}>
                      {sv.attack_count} attack{sv.attack_count > 1 ? "s" : ""} this session
                    </span>
                  )}
                </div>

                {isAtk && sv.last_attack && (
                  <div style={{ fontSize: 11, color: "#C0392B", marginTop: 4 }}>
                    ⚡ Active: {sv.last_attack}
                  </div>
                )}
                {!isAtk && wasAtk && (
                  <div style={{ fontSize: 11, color: "var(--gold)", marginTop: 4 }}>
                    ✓ SkyShield blocked the attack — server recovered
                  </div>
                )}
                {!isAtk && !wasAtk && (
                  <div style={{ fontSize: 11, color: "#27AE60", marginTop: 4 }}>
                    ✓ No attacks detected
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Network flow */}
      <div className="card">
        <div className="card-label">📡 Network Flow</div>
        <div style={{ fontFamily: "monospace", fontSize: 12, color: "var(--chalk4)", lineHeight: 2.2 }}>
          <div style={{ color: "var(--gold)", marginBottom: 10, fontWeight: 600 }}>
            Internet ──────▶ [Firewall] ──────▶ [SkyShield NIDS ✓] ──────▶ Campus Servers
          </div>
          {servers.map(sv => {
            const isAtk = sv.status !== "Safe";
            return (
              <div key={sv.ip} style={{ display: "flex", alignItems: "center", gap: 14, padding: "2px 0" }}>
                <span style={{ color: isAtk ? "#C0392B" : "#27AE60", width: 16 }}>
                  {isAtk ? "⛔" : "✓"}
                </span>
                <span style={{ color: "var(--chalk4)", width: 112 }}>{sv.ip}</span>
                <span style={{ color: "var(--chalk2)", width: 148 }}>{sv.name}</span>
                <span style={{ color: "var(--chalk4)" }}>{sv.department}</span>
                {sv.attack_count > 0 && (
                  <span style={{ marginLeft: "auto", color: isAtk ? "#C0392B" : "var(--gold)", fontSize: 11 }}>
                    {isAtk ? `⚡ ${sv.attack_count} attacks` : `🛡 ${sv.attack_count} blocked`}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
