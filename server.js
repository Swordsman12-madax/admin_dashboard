// server.js - ULTIMATE SECURE DASHBOARD
require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// 🛡️ SECURITY CONFIG (from environment)
// ============================================
const SECRET_PATH = process.env.SECRET_PATH || 'x7k9m2p4'; // CHANGE THIS!
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'yourpassword123';
const ALLOWED_IPS = process.env.ALLOWED_IPS ? process.env.ALLOWED_IPS.split(',') : ['*'];

// ============================================
// 🔒 HELMET (hides server identity)
// ============================================
app.use(helmet({
    contentSecurityPolicy: false,
    hidePoweredBy: true,
    noSniff: true,
    xssFilter: true,
    frameguard: { action: 'deny' }
}));

// ============================================
// 📊 RATE LIMITING (5 attempts per 15 min)
// ============================================
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: { error: 'Too many attempts. Try again later.' },
    skip: (req) => {
        // Allow whitelisted IPs to bypass (optional)
        const clientIP = getClientIP(req);
        return ALLOWED_IPS.includes('*') || ALLOWED_IPS.includes(clientIP);
    }
});

// Apply rate limiting to all /api endpoints
app.use(`/${SECRET_PATH}/api`, limiter);

// ============================================
// 🕵️ IP WHITELIST MIDDLEWARE
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
// 🎯 FAKE SITE (What everyone sees)
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
// 🕵️ HONEYPOT TRAPS
// ============================================
const HONEYPOT_PATHS = ['/admin', '/wp-admin', '/login', '/dashboard', '/administrator', '/admin123', '/secret'];
HONEYPOT_PATHS.forEach(path => {
    app.get(path, (req, res) => {
        // Log the attempt (optional)
        console.log(`🐝 Honeypot triggered: ${req.path} from ${getClientIP(req)}`);
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
// 📱 REAL ADMIN DASHBOARD
// ============================================
app.use(express.static('public'));
app.use(express.json());

// Admin page
app.get(`/${SECRET_PATH}`, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ============================================
// 🔐 LOGIN WITH FAILURE TRACKING (in memory)
// ============================================
const failedAttempts = {};

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
        delete failedAttempts[ip]; // reset on success
        res.json({ success: true, token: 'secure-token-2024' });
    } else {
        if (!failedAttempts[ip]) {
            failedAttempts[ip] = { count: 1, blockUntil: 0 };
        } else {
            failedAttempts[ip].count += 1;
        }

        // Block after 5 failures
        if (failedAttempts[ip].count >= 5) {
            failedAttempts[ip].blockUntil = now + blockDuration;
            console.log(`🔒 IP ${ip} blocked for 1 hour`);
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

app.get(`/${SECRET_PATH}/api/devices`, (req, res) => res.json([]));
app.get(`/${SECRET_PATH}/api/numbers`, (req, res) => res.json([]));

// ============================================
// 🚀 START SERVER
// ============================================
app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════');
    console.log('🕵️  STEALTH ADMIN DASHBOARD');
    console.log('═══════════════════════════════════════════════');
    console.log(`📍 https://admin-dashboard-teal-beta-28.vercel.app/${SECRET_PATH}`);
    console.log(`🔑 Username: ${ADMIN_USER}`);
    console.log(`🔑 Password: ${ADMIN_PASS}`);
    console.log(`🛡️  Allowed IPs: ${ALLOWED_IPS.join(', ')}`);
    console.log('═══════════════════════════════════════════════');
});
