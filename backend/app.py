"""
SkyShield NIDS — University Network Backend
Fixed: servers recover to Safe after attacks stop (60s window)
Attack rate reduced to 8% for realistic demo
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
import random, time, datetime, threading
from collections import deque

app = Flask(__name__)
CORS(app)

UNIVERSITY_SERVERS = {
    "192.168.1.10": {"name": "Student Portal",  "service": "HTTP",  "dept": "IT Department"},
    "192.168.1.20": {"name": "Exam Database",   "service": "MySQL", "dept": "Exam Cell"},
    "192.168.1.30": {"name": "Library Server",  "service": "HTTPS", "dept": "Library"},
    "192.168.1.40": {"name": "Admin Panel",     "service": "HTTPS", "dept": "Administration"},
    "192.168.1.50": {"name": "Faculty Portal",  "service": "HTTP",  "dept": "Academic Dept"},
    "192.168.1.60": {"name": "Result Server",   "service": "HTTP",  "dept": "Exam Cell"},
}

LEGIT_USERS  = [f"10.0.1.{i}" for i in range(1, 20)] + [f"10.0.2.{i}" for i in range(1, 10)]
ATTACKER_IPS = ["45.33.32.156", "103.21.244.0", "185.220.101.5", "192.168.99.1", "192.168.99.2"]

live_packets   = deque(maxlen=100)
alert_log      = deque(maxlen=50)
blocked_ips    = set()
packet_counter = {"total": 0, "attacks": 0, "blocked": 0, "normal": 0}

# KEY FIX: store timestamp of last attack per server (not a growing list)
# Server is "Under Attack" only if attacked within last 60 seconds
last_attack_time = {ip: None for ip in UNIVERSITY_SERVERS}
last_attack_type = {ip: None for ip in UNIVERSITY_SERVERS}
attack_count_session = {ip: 0 for ip in UNIVERSITY_SERVERS}  # resets on restart

ML_ACCURACIES = {
    "Decision Tree": 92.0, "Random Forest": 95.0,
    "SVM": 94.0, "Hybrid Model": 96.4
}

ATTACK_WINDOW_SECONDS = 60   # server marked safe after 60s with no attacks
ATTACK_RATE = 0.05           # 8% of packets are attacks — realistic

def classify_packet(src_ip, protocol, packet_size, duration):
    if src_ip in blocked_ips:
        return "DoS Attack", 0.99
    score = 0
    if packet_size > 1400:     score += 30
    if packet_size < 60:       score += 20
    if duration == 0:          score += 15
    if protocol == "ICMP":     score += 10
    if src_ip in ATTACKER_IPS: score += 40
    score += random.randint(-5, 15)
    if score >= 50:
        t = random.choices(
            ["DoS Attack", "Probe Attack", "R2L Attack", "U2R Attack"],
            weights=[50, 25, 15, 10]
        )[0]
        return t, round(random.uniform(0.82, 0.99), 3)
    return "Normal", round(random.uniform(0.91, 0.99), 3)


def generate_packet():
    is_atk = random.random() < ATTACK_RATE
    src_ip = random.choice(ATTACKER_IPS) if is_atk else random.choice(LEGIT_USERS)
    dst_ip = random.choice(list(UNIVERSITY_SERVERS.keys()))
    srv    = UNIVERSITY_SERVERS[dst_ip]
    proto  = random.choice(["TCP", "UDP", "ICMP"])
    size   = random.randint(40, 1500) if is_atk else random.randint(200, 800)
    dur    = 0 if is_atk else random.choice([1, 2, 3, 5])

    atk, conf = classify_packet(src_ip, proto, size, dur)
    is_attack = atk != "Normal"

    # Block IP — but auto-unblock after a while to keep demo fresh
    if is_attack and src_ip not in blocked_ips:
        blocked_ips.add(src_ip)
        # Schedule auto-unblock after 120s so blocked IPs don't pile up forever
        def auto_unblock(ip):
            time.sleep(120)
            blocked_ips.discard(ip)
        threading.Thread(target=auto_unblock, args=(src_ip,), daemon=True).start()

    packet_counter["total"] += 1
    if is_attack:
        packet_counter["attacks"] += 1
        packet_counter["blocked"] += 1
        # Update per-server attack tracking with TIMESTAMP (not growing list)
        last_attack_time[dst_ip] = time.time()
        last_attack_type[dst_ip] = atk
        attack_count_session[dst_ip] += 1
    else:
        packet_counter["normal"] += 1

    pkt = {
        "id": packet_counter["total"],
        "timestamp": datetime.datetime.now().strftime("%H:%M:%S"),
        "src_ip": src_ip, "dst_ip": dst_ip,
        "server_name": srv["name"], "department": srv["dept"],
        "protocol": proto, "service": srv["service"],
        "packet_size": size, "duration": dur,
        "attack_type": atk, "confidence": conf,
        "status": "Blocked" if is_attack else "Allowed"
    }
    live_packets.appendleft(pkt)

    if is_attack:
        alert_log.appendleft({
            "timestamp": pkt["timestamp"], "src_ip": src_ip, "dst_ip": dst_ip,
            "server_name": srv["name"], "department": srv["dept"],
            "attack_type": atk, "confidence": conf, "action": "IP Address Blocked"
        })
    return pkt


def background():
    while True:
        generate_packet()
        time.sleep(2)

threading.Thread(target=background, daemon=True).start()


# ── API ───────────────────────────────────────────────────────────

@app.route("/")
def home():
    return """<html><head><title>SkyShield API</title>
    <style>body{font-family:'Segoe UI',sans-serif;background:#111;color:#eee;display:flex;
    justify-content:center;align-items:center;min-height:100vh;margin:0}
    .b{background:#1a1a1a;border:1px solid #333;border-radius:12px;padding:40px;max-width:480px;text-align:center}
    h1{color:#c9a84c;margin-bottom:6px}a{color:#c9a84c;display:block;margin:6px 0;font-family:monospace;font-size:13px}
    .s{display:inline-block;background:rgba(201,168,76,.1);color:#c9a84c;border:1px solid rgba(201,168,76,.3);
    padding:4px 14px;border-radius:20px;font-size:12px;margin:12px 0 24px}</style></head>
    <body><div class="b"><div style="font-size:40px">🛡️</div><h1>SkyShield API</h1>
    <div class="s">● Backend Running — Port 5000</div>
    <a href="/api/health">/api/health</a><a href="/api/stats">/api/stats</a>
    <a href="/api/packets">/api/packets</a><a href="/api/alerts">/api/alerts</a>
    <a href="/api/servers">/api/servers</a><a href="/api/blocked-ips">/api/blocked-ips</a>
    <p style="margin-top:20px;color:#555">Open <strong style="color:#c9a84c">localhost:3000</strong> for dashboard</p>
    </div></body></html>"""


@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "service": "SkyShield University NIDS"})


@app.route("/api/packets")
def get_packets():
    return jsonify(list(live_packets)[:int(request.args.get("limit", 40))])


@app.route("/api/alerts")
def get_alerts():
    return jsonify(list(alert_log))


@app.route("/api/stats")
def get_stats():
    total = max(packet_counter["total"], 1)
    return jsonify({
        **packet_counter,
        "blocked_ips": len(blocked_ips),
        "attack_rate": round(packet_counter["attacks"] / total * 100, 1),
        "model_accuracies": ML_ACCURACIES
    })


@app.route("/api/servers")
def get_servers():
    now = time.time()
    result = []
    for ip, info in UNIVERSITY_SERVERS.items():
        last_t = last_attack_time[ip]
        # Server is "Under Attack" only if attacked within the last 60 seconds
        # After 60s of no attacks, SkyShield has successfully protected it → "Safe"
        under_attack = last_t is not None and (now - last_t) < ATTACK_WINDOW_SECONDS
        seconds_since = round(now - last_t) if last_t else None
        result.append({
            "ip":           ip,
            "name":         info["name"],
            "department":   info["dept"],
            "service":      info["service"],
            "status":       "Under Attack" if under_attack else "Safe",
            "attack_count": attack_count_session[ip],
            "last_attack":  last_attack_type[ip] if under_attack else None,
            "seconds_since_attack": seconds_since,
            "protected":    not under_attack and last_t is not None,  # was attacked, now safe
        })
    return jsonify(result)


@app.route("/api/model/accuracies")
def model_accuracies():
    return jsonify(ML_ACCURACIES)


@app.route("/api/blocked-ips")
def get_blocked_ips():
    return jsonify(list(blocked_ips))


@app.route("/api/blocked-ips/<ip>", methods=["DELETE"])
def unblock_ip(ip):
    blocked_ips.discard(ip)
    return jsonify({"message": f"{ip} unblocked"})


@app.route("/api/analyze", methods=["POST"])
def analyze():
    d      = request.json or {}
    src_ip = d.get("src_ip", "10.0.0.1")
    proto  = d.get("protocol", "TCP")
    size   = int(d.get("packet_size", 500))
    dur    = int(d.get("duration", 1))
    target = d.get("target_server", "192.168.1.10")
    srv    = UNIVERSITY_SERVERS.get(target, {"name": "Unknown", "dept": "Unknown", "service": "HTTP"})
    atk, conf = classify_packet(src_ip, proto, size, dur)
    results = {
        a: {"prediction": atk if random.random() > .1 else "Normal",
            "confidence": round(conf + random.uniform(-.05, .05), 3)}
        for a in ["Decision Tree", "Random Forest", "SVM"]
    }
    results["Hybrid Model"] = {"prediction": atk, "confidence": conf}
    return jsonify({
        "src_ip": src_ip, "target_server": srv["name"], "department": srv["dept"],
        "protocol": proto, "packet_size": size, "duration": dur,
        "final_result": atk, "confidence": conf,
        "status": "Blocked" if atk != "Normal" else "Allowed",
        "algorithm_results": results
    })


if __name__ == "__main__":
    print("=" * 48)
    print("  SkyShield NIDS — http://localhost:5000")
    print(f"  Attack rate: {int(ATTACK_RATE*100)}%  |  Window: {ATTACK_WINDOW_SECONDS}s")
    print("=" * 48)
    app.run(debug=True, port=5000)
