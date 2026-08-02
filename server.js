// server.js - CORRECTED VERSION
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_PATH = process.env.SECRET_PATH || 'admin123';

// Serve static files
app.use(express.static('public'));
app.use(express.json());

// Homepage (fake site)
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

// ✅ Admin dashboard - USING BACKTICKS
app.get(`/${SECRET_PATH}`, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ✅ Login API - USING BACKTICKS
app.post(`/${SECRET_PATH}/api/login`, (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'yourpassword123') {
        res.json({ success: true });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// ✅ Stats API - USING BACKTICKS
app.get(`/${SECRET_PATH}/api/stats`, (req, res) => {
    res.json({ devices: 0, numbers: 0, online: 0 });
});

// ✅ Devices API - USING BACKTICKS
app.get(`/${SECRET_PATH}/api/devices`, (req, res) => {
    res.json([]);
});

// ✅ Numbers API - USING BACKTICKS
app.get(`/${SECRET_PATH}/api/numbers`, (req, res) => {
    res.json([]);
});

// Debug route
app.get('/debug', (req, res) => {
    res.json({
        SECRET_PATH: process.env.SECRET_PATH || 'NOT SET',
        PORT: process.env.PORT || 'NOT SET',
        ADMIN_USER: process.env.ADMIN_USER || 'NOT SET'
    });
});

// Start server
app.listen(PORT, () => {
    console.log('✅ Server running on port', PORT);
    console.log('🔑 SECRET_PATH:', SECRET_PATH);
    console.log('📍 https://admin-dashboard-teal-beta-28.vercel.app/' + SECRET_PATH);
});
// Catch-all route to see what paths are being hit
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
