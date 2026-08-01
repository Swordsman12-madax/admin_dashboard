// server.js - Admin Dashboard
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_PATH = process.env.SECRET_PATH || 'admin123';

// Serve static files
app.use(express.static('public'));

// Fake site (what everyone else sees)
app.get('/', (req, res) => {
    res.send(`
        <html>
        <head>
            <title>Kigali Tech Solutions</title>
            <style>
                body { background: #0a0e17; color: #8896ab; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; text-align: center; margin: 0; }
                h1 { color: #4fc3f7; font-size: 36px; }
                p { color: #4a5568; }
                .admin-gry { position: fixed; bottom: 10px; right: 10px; font-size: 8px; color: rgba(79,195,247,0.05); user-select: none; }
            </style>
        </head>
        <body>
            <div>
                <h1>🏎️ Kigali Tech Solutions</h1>
                <p>Innovating the future of racing technology.</p>
                <div class="admin-gry">ADMIN GRY</div>
            </div>
        </body>
        </html>
    `);
});

// Admin dashboard
app.get(`/${SECRET_PATH}`, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Simple login
app.post(`/${SECRET_PATH}/api/login`, express.json(), (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'yourpassword123') {
        res.json({ success: true, token: 'fake-token' });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Stats API
app.get(`/${SECRET_PATH}/api/stats`, (req, res) => {
    res.json({ devices: 0, numbers: 0, online: 0 });
});

// Devices API
app.get(`/${SECRET_PATH}/api/devices`, (req, res) => {
    res.json([]);
});

// Numbers API
app.get(`/${SECRET_PATH}/api/numbers`, (req, res) => {
    res.json([]);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log('═══════════════════════════════════════════════');
    console.log('🕵️  ADMIN DASHBOARD');
    console.log('═══════════════════════════════════════════════');
    console.log(`📍 http://localhost:${PORT}/${SECRET_PATH}`);
    console.log(`🔑 Username: admin`);
    console.log(`🔑 Password: yourpassword123`);
    console.log('═══════════════════════════════════════════════');
});
