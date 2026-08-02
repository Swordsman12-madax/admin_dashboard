// server.js - DEBUG VERSION (prints IP)
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_PATH = 'admin123';

function getClientIP(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return req.socket.remoteAddress || req.connection.remoteAddress;
}

// ALLOW ALL IPs for testing (REMOVE AFTER DEBUG)
const ALLOWED_IPS = ['*']; // allow all

app.use((req, res, next) => {
    const clientIP = getClientIP(req);
    console.log('Client IP:', clientIP);
    console.log('Request path:', req.path);
    
    // If not allowed and not root, show 404
    if (!ALLOWED_IPS.includes('*') && !ALLOWED_IPS.includes(clientIP)) {
        if (req.path !== '/') {
            return res.status(404).send('Not Found (IP blocked)');
        }
    }
    next();
});

// Root page shows your IP for debugging
app.get('/', (req, res) => {
    const ip = getClientIP(req);
    res.send(`
        <html>
        <head><title>Debug</title></head>
        <body style="background:#0a0e17;color:#fff;font-family:sans-serif;padding:20px;">
            <h1 style="color:#4fc3f7;">Debug Info</h1>
            <p>Your IP: <strong>${ip}</strong></p>
            <p>Secret Path: /${SECRET_PATH}</p>
            <p>Try: <a href="/${SECRET_PATH}" style="color:#4fc3f7;">/${SECRET_PATH}</a></p>
            <p style="color:#8896ab;margin-top:20px;">ADMIN GRY</p>
        </body>
        </html>
    `);
});

// Admin dashboard
app.get(`/${SECRET_PATH}`, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Login API (simplified)
app.post(`/${SECRET_PATH}/api/login`, express.json(), (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'yourpassword123') {
        res.json({ success: true });
    } else {
        res.status(401).json({ error: 'Invalid' });
    }
});

// Stats
app.get(`/${SECRET_PATH}/api/stats`, (req, res) => {
    res.json({ devices: 0, numbers: 0, online: 0 });
});

app.get(`/${SECRET_PATH}/api/devices`, (req, res) => res.json([]));
app.get(`/${SECRET_PATH}/api/numbers`, (req, res) => res.json([]));

app.listen(PORT, () => {
    console.log('✅ Debug server running on port', PORT);
});
