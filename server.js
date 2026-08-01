// server.js - Simple Admin Dashboard
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

// Homepage
app.get('/', (req, res) => {
    res.send(`
        <html>
        <head>
            <title>Kigali Tech Solutions</title>
            <style>
                body { background: #0a0e17; color: #fff; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; text-align: center; margin: 0; }
                h1 { color: #4fc3f7; font-size: 36px; }
                p { color: #8896ab; }
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
app.get('/admin123', (req, res) => {
    res.send(`
        <html>
        <head>
            <title>Dashboard</title>
            <style>
                body { background: #0a0e17; color: #fff; font-family: sans-serif; padding: 20px; }
                h1 { color: #4fc3f7; }
                .admin-gry { position: fixed; bottom: 10px; right: 10px; font-size: 8px; color: rgba(79,195,247,0.05); user-select: none; }
            </style>
        </head>
        <body>
            <h1>📊 Dashboard</h1>
            <p>Your dashboard is working!</p>
            <p style="color:#8896ab;">Devices: 0 | Numbers: 0 | Online: 0</p>
            <div class="admin-gry">ADMIN GRY</div>
        </body>
        </html>
    `);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('✅ Server running on port', PORT);
    console.log('📍 http://localhost:' + PORT + '/admin123');
});
