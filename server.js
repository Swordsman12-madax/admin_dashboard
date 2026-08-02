// server.js - ULTIMATE SECURE DASHBOARD (self-contained HTML)
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// SECRET PATH from environment (or fallback)
// ============================================
const SECRET_PATH = process.env.SECRET_PATH || 'a9f3k217';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'yourpassword123';
const ALLOWED_IPS = process.env.ALLOWED_IPS ? process.env.ALLOWED_IPS.split(',') : ['*'];

// ============================================
// IP Whitelist Middleware
// ============================================
function getClientIP(req) {
    return req.headers['x-forwarded-for']?.split(',')[0] || 
           req.socket.remoteAddress || 
           req.connection.remoteAddress;
}

app.use((req, res, next) => {
    // Allow root (fake site) for everyone
    if (req.path === '/') return next();

    // Check if accessing admin area
    if (req.path.includes(SECRET_PATH)) {
        const clientIP = getClientIP(req);
        if (!ALLOWED_IPS.includes('*') && !ALLOWED_IPS.includes(clientIP)) {
            // Return 404 to hide existence
            return res.status(404).send(`
                <html>
                <head><title>404</title></head>
                <body style="background:#0a0e17;color:#8896ab;font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;text-align:center;">
                    <h1 style="color:#4fc3f7;">404</h1>
                    <p>Not found</p>
                </body>
                </html>
            `);
        }
    }
    next();
});

// ============================================
// FAKE SITE (what everyone sees)
// ============================================
app.get('/', (req, res) => {
    res.send(`
        <html>
        <head><title>Kigali Tech Solutions</title></head>
        <body style="background:#0a0e17;color:#8896ab;font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;text-align:center;margin:0;">
            <div>
                <h1 style="color:#4fc3f7;">🏎️ Kigali Tech Solutions</h1>
                <p style="color:#4a5568;">Innovating the future of racing technology.</p>
                <p style="font-size:12px;color:#1a2332;">© 2024 All rights reserved.</p>
                <div style="position:fixed;bottom:10px;right:10px;font-size:8px;color:rgba(79,195,247,0.05);user-select:none;">ADMIN GRY</div>
            </div>
        </body>
        </html>
    `);
});

// ============================================
// HONEYPOT TRAPS
// ============================================
const HONEYPOT_PATHS = ['/admin', '/wp-admin', '/login', '/dashboard', '/administrator', '/admin123', '/secret'];
HONEYPOT_PATHS.forEach(path => {
    app.get(path, (req, res) => {
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
});

// ============================================
// FAILED ATTEMPT TRACKING (in-memory)
// ============================================
const failedAttempts = {};

// ============================================
// ADMIN DASHBOARD – Self-contained HTML
// ============================================
app.get(`/${SECRET_PATH}`, (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, sans-serif;
            background: #0a0e17;
            color: #e0e6ed;
            padding: 20px;
        }
        .container { max-width: 800px; margin: 0 auto; }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 0;
            border-bottom: 1px solid #1a2332;
            margin-bottom: 20px;
        }
        .header h1 { font-size: 24px; color: #4fc3f7; }
        .logout { color: #ff6b6b; cursor: pointer; }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        .stat-card {
            background: #111927;
            border: 1px solid #1a2332;
            border-radius: 10px;
            padding: 15px;
            text-align: center;
        }
        .stat-card .value { font-size: 28px; font-weight: 700; color: #4fc3f7; }
        .stat-card .label { font-size: 12px; color: #8896ab; }
        .section {
            background: #111927;
            border: 1px solid #1a2332;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .section h3 { margin-bottom: 15px; font-size: 16px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { text-align: left; color: #8896ab; padding: 8px; border-bottom: 1px solid #1a2332; }
        td { padding: 8px; border-bottom: 1px solid #0a0e17; }
        .badge {
            display: inline-block;
            padding: 2px 10px;
            border-radius: 12px;
            font-size: 11px;
        }
        .badge.online { background: rgba(107,203,119,0.15); color: #6bcb77; }
        .badge.offline { background: rgba(255,107,107,0.15); color: #ff6b6b; }
        .admin-gry {
            position: fixed;
            bottom: 10px;
            right: 10px;
            font-size: 8px;
            color: rgba(79,195,247,0.05);
            user-select: none;
            pointer-events: none;
        }
        .hidden { display: none; }
        .login-container {
            max-width: 350px;
            margin: 80px auto;
            background: #111927;
            border: 1px solid #1a2332;
            border-radius: 16px;
            padding: 40px;
            text-align: center;
        }
        .login-container input {
            width: 100%;
            padding: 12px;
            margin: 8px 0;
            background: #0a0e17;
            border: 1px solid #1a2332;
            border-radius: 8px;
            color: #e0e6ed;
            font-size: 14px;
        }
        .login-container input:focus { outline: none; border-color: #4fc3f7; }
        .login-container button {
            width: 100%;
            padding: 12px;
            margin-top: 10px;
            background: #4fc3f7;
            border: none;
            border-radius: 8px;
            color: #0a0e17;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
        }
    </style>
</head>
<body>

<div class="admin-gry">ADMIN GRY</div>

<!-- LOGIN -->
<div id="loginContainer" class="login-container">
    <h3 style="margin-bottom:10px;">🔐 Admin Access</h3>
    <input type="text" id="loginUser" placeholder="Username" value="${ADMIN_USER}">
    <input type="password" id="loginPass" placeholder="Password">
    <button onclick="login()">Sign In</button>
    <div id="loginError" style="color:#ff6b6b;margin-top:10px;display:none;"></div>
</div>

<!-- DASHBOARD -->
<div id="dashboard" class="container hidden">
    <div class="header">
        <h1>📊 Admin Dashboard</h1>
        <span class="logout" onclick="logout()">🚪 Exit</span>
    </div>

    <div class="stats" id="statsGrid">
        <div class="stat-card"><div class="value" id="devicesCount">0</div><div class="label">📱 Devices</div></div>
        <div class="stat-card"><div class="value" id="numbersCount">0</div><div class="label">🔢 Numbers</div></div>
        <div class="stat-card"><div class="value" id="onlineCount">0</div><div class="label">🟢 Online</div></div>
    </div>

    <div class="section">
        <h3>📱 Recent Devices</h3>
        <div id="devicesList"><p style="color:#8896ab;">No devices connected</p></div>
    </div>

    <div class="section">
        <h3>🔢 Recent Short Numbers (4-5 digits)</h3>
        <div id="numbersList"><p style="color:#8896ab;">No numbers detected</p></div>
    </div>
</div>

<script>
const API_BASE = '/${SECRET_PATH}';

async function login() {
    const username = document.getElementById('loginUser').value;
    const password = document.getElementById('loginPass').value;
    const errorEl = document.getElementById('loginError');
    errorEl.style.display = 'none';

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
        } else {
            errorEl.textContent = 'Invalid credentials';
            errorEl.style.display = 'block';
        }
    } catch {
        errorEl.textContent = 'Connection error';
        errorEl.style.display = 'block';
    }
}

function logout() {
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('loginContainer').style.display = 'block';
}

async function loadData() {
    try {
        const response = await fetch(API_BASE + '/api/stats');
        const stats = await response.json();
        document.getElementById('devicesCount').textContent = stats.devices || 0;
        document.getElementById('numbersCount').textContent = stats.numbers || 0;
        document.getElementById('onlineCount').textContent = stats.online || 0;
    } catch (error) {
        console.error('Error:', error);
    }
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
// LOGIN API with IP Blocking
// ============================================
app.use(express.json());

app.post(`/${SECRET_PATH}/api/login`, (req, res) => {
    const ip = getClientIP(req);
    const now = Date.now();
    const blockDuration = 60 * 60 * 1000; // 1 hour

    // Check if blocked
    if (failedAttempts[ip] && failedAttempts[ip].blockUntil > now) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Reset if block expired
    if (failedAttempts[ip] && failedAttempts[ip].blockUntil <= now) {
        delete failedAttempts[ip];
    }

    const { username, password } = req.body;

    if (username === ADMIN_USER && password === ADMIN_PASS) {
        delete failedAttempts[ip];
        res.json({ success: true });
    } else {
        if (!failedAttempts[ip]) {
            failedAttempts[ip] = { count: 1, blockUntil: 0 };
        } else {
            failedAttempts[ip].count += 1;
        }

        if (failedAttempts[ip].count >= 5) {
            failedAttempts[ip].blockUntil = now + blockDuration;
            console.log(`🔒 IP ${ip} blocked for 1 hour`);
        }

        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// ============================================
// API ENDPOINTS
// ============================================
app.get(`/${SECRET_PATH}/api/stats`, (req, res) => {
    res.json({ devices: 0, numbers: 0, online: 0 });
});

app.get(`/${SECRET_PATH}/api/devices`, (req, res) => {
    res.json([]);
});

app.get(`/${SECRET_PATH}/api/numbers`, (req, res) => {
    res.json([]);
});

// ============================================
// DEBUG ROUTE (shows environment)
// ============================================
app.get('/debug', (req, res) => {
    res.json({
        SECRET_PATH: process.env.SECRET_PATH || 'not set',
        ADMIN_USER: process.env.ADMIN_USER || 'not set',
        ALLOWED_IPS: process.env.ALLOWED_IPS || 'not set'
    });
});

// ============================================
// CATCH-ALL (for debugging)
// ============================================
app.get('*', (req, res) => {
    res.send(`
        <html>
        <head><title>Debug</title></head>
        <body style="background:#0a0e17;color:#fff;font-family:sans-serif;padding:20px;">
            <h1 style="color:#4fc3f7;">🔍 Debug</h1>
            <p>Requested path: <strong>${req.path}</strong></p>
            <p>SECRET_PATH: <strong>${SECRET_PATH}</strong></p>
            <p>Try: <a href="/${SECRET_PATH}" style="color:#4fc3f7;">/${SECRET_PATH}</a></p>
            <p style="color:#8896ab;margin-top:20px;">ADMIN GRY</p>
        </body>
        </html>
    `);
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
    console.log('🕵️  STEALTH ADMIN DASHBOARD');
    console.log(`📍 https://admin-dashboard-teal-beta-28.vercel.app/${SECRET_PATH}`);
    console.log(`🔑 Username: ${ADMIN_USER}`);
    console.log(`🔑 Password: ${ADMIN_PASS}`);
});
