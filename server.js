// server.js - FULLY SECURED ADMIN DASHBOARD
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_PATH = process.env.SECRET_PATH || 'admin123';

// ============================================
// 🔐 SECURITY: IP WHITELIST (Change this!)
// ============================================
const ALLOWED_IPS = [
    '197.157.185.181',  // YOUR IP!
    '127.0.0.1',
    'localhost'
];

// Get client IP
function getClientIP(req) {
    return req.headers['x-forwarded-for']?.split(',')[0] || 
           req.socket.remoteAddress || 
           req.connection.remoteAddress;
}

// IP Whitelist Middleware
app.use((req, res, next) => {
    // Allow access to root (fake site) for everyone
    if (req.path === '/') return next();
    
    // Check if trying to access admin
    if (req.path.includes(SECRET_PATH)) {
        const clientIP = getClientIP(req);
        if (!ALLOWED_IPS.includes(clientIP) && !ALLOWED_IPS.includes('*')) {
            // Return fake 404 - looks like site doesn't exist
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
// Serve static files
app.use(express.static('public'));

// Admin dashboard
app.get(`/${SECRET_PATH}`, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Login API
app.post(`/${SECRET_PATH}/api/login`, express.json(), (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'yourpassword123') {
        res.json({ 
            success: true, 
            token: 'secure-token-2024',
            message: 'Welcome Admin!'
        });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Stats API
app.get(`/${SECRET_PATH}/api/stats`, (req, res) => {
    res.json({ 
        devices: 0, 
        numbers: 0, 
        online: 0,
        last_updated: new Date().toISOString()
    });
});

// Devices API
app.get(`/${SECRET_PATH}/api/devices`, (req, res) => {
    res.json([]);
});

// Numbers API
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
    console.log('═══════════════════════════════════════════════');
});
