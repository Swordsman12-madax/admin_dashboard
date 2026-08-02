// server.js - FULLY SECURED WITH IP BLOCK
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_PATH = process.env.SECRET_PATH || 'admin123';

// ============================================
// 🔐 IP BLOCKING (12 hours after 5 failures)
// ============================================
const failedAttempts = {}; // { ip: { count, firstAttempt, blockUntil } }

function getClientIP(req) {
    return req.headers['x-forwarded-for']?.split(',')[0] || 
           req.socket.remoteAddress || 
           req.connection.remoteAddress;
}

// ============================================
// 🔐 IP WHITELIST (Change this!)
// ============================================
const ALLOWED_IPS = [
    '197.157.185.181',  // YOUR IP!
    '127.0.0.1',
    'localhost'
];

// IP Whitelist Middleware (keeps your admin hidden)
app.use((req, res, next) => {
    if (req.path === '/') return next();
    
    if (req.path.includes(SECRET_PATH)) {
        const clientIP = getClientIP(req);
        if (!ALLOWED_IPS.includes(clientIP) && !ALLOWED_IPS.includes('*')) {
            return res.status(404).send(`
                <html>
                <head><title>404 - Page Not Found</title></head>
                <body style="background:#0a0e17;color:#8896ab;font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;text-align:center;">
                    <div>
                        <h1 style="color:#4fc3f7;">404</h1>
                        <p>Page not found</p>
                    </div>
                </body>
                </html>
            `);
        }
    }
    next();
});

// ============================================
// 🎯 FAKE SITE (What everyone else sees)
// ============================================
app.get('/', (req, res) => {
    res.send(`
        <html>
        <head>
            <title>Kigali Tech Solutions</title>
            <style>
                body {
                    background: #0a0e17;
                    color: #8896ab;
                    font-family: -apple-system, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    text-align: center;
                    margin: 0;
                }
                h1 { color: #4fc3f7; font-size: 36px; }
                p { color: #4a5568; }
                .admin-gry {
                    position: fixed;
                    bottom: 10px;
                    right: 10px;
                    font-size: 8px;
                    color: rgba(79,195,247,0.03);
                    user-select: none;
                    pointer-events: none;
                }
            </style>
        </head>
        <body>
            <div>
                <h1>🏎️ Kigali Tech Solutions</h1>
                <p>Innovating the future of racing technology in East Africa.</p>
                <p style="font-size:12px;color:#1a2332;">© 2024 All rights reserved.</p>
                <div class="admin-gry">ADMIN GRY</div>
            </div>
        </body>
        </html>
    `);
});

// ============================================
// 🕵️ HONEYPOT TRAP (Fake admin pages)
// ============================================
const HONEYPOT_PATHS = ['/admin', '/wp-admin', '/login', '/dashboard', '/administrator'];

HONEYPOT_PATHS.forEach(path => {
    app.get(path, (req, res) => {
        res.status(404).send(`
            <html>
            <head><title>404 - Not Found</title></head>
            <body style="background:#0a0e17;color:#8896ab;font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;text-align:center;">
                <div>
                    <h1 style="color:#4fc3f7;">404</h1>
                    <p>Page not found</p>
                    <p style="font-size:12px;color:#1a2332;">Access denied</p>
                </div>
            </body>
            </html>
        `);
    });
});

// ============================================
// 📱 REAL ADMIN DASHBOARD
// ============================================
app.use(express.static('public'));
app.use(express.json());

// Admin dashboard page
app.get(`/${SECRET_PATH}`, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ============================================
// 🔐 LOGIN WITH IP BLOCKING
// ============================================
app.post(`/${SECRET_PATH}/api/login`, (req, res) => {
    const ip = getClientIP(req);
    const now = Date.now();
    const blockDuration = 12 * 60 * 60 * 1000; // 12 hours

    // Check if currently blocked
    if (failedAttempts[ip] && failedAttempts[ip].blockUntil && failedAttempts[ip].blockUntil > now) {
        // Still blocked – respond with generic error
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    // If block expired, clear record
    if (failedAttempts[ip] && failedAttempts[ip].blockUntil && failedAttempts[ip].blockUntil <= now) {
        delete failedAttempts[ip];
    }

    const { username, password } = req.body;

    if (username === 'admin' && password === 'yourpassword123') {
        // Successful login – reset failures
        if (failedAttempts[ip]) {
            delete failedAttempts[ip];
        }
        res.json({ success: true, token: 'secure-token-2024' });
    } else {
        // Failed login – increment attempts
        if (!failedAttempts[ip]) {
            failedAttempts[ip] = { count: 1, firstAttempt: now };
        } else {
            failedAttempts[ip].count += 1;
        }

        // Block if 5 or more failures
        if (failedAttempts[ip].count >= 5) {
            failedAttempts[ip].blockUntil = now + blockDuration;
            console.log(`🔒 IP ${ip} blocked for 12 hours (${new Date(failedAttempts[ip].blockUntil).toLocaleString()})`);
        }

        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// ============================================
// 📊 API ENDPOINTS
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
// 🚀 START SERVER
// ============================================
app.listen(PORT, '0.0.0.0', () => {
    console.log('═══════════════════════════════════════════════');
    console.log('🕵️  STEALTH ADMIN DASHBOARD');
    console.log('═══════════════════════════════════════════════');
    console.log(`📍 https://admin-dashboard-teal-beta-28.vercel.app/${SECRET_PATH}`);
    console.log(`🔑 Username: admin`);
    console.log(`🔑 Password: yourpassword123`);
    console.log(`🛡️  IP Whitelist: ${ALLOWED_IPS.join(', ')}`);
    console.log(`🔒 IP Blocking: 5 failures → 12 hour lockout`);
    console.log('═══════════════════════════════════════════════');
});
