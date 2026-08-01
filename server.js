// Minimal server.js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// The main page
app.get('/', (req, res) => {
    res.send(`
        <html>
        <head><title>Kigali Tech Solutions</title></head>
        <body style="background:#0a0e17;color:#fff;font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;text-align:center;">
            <div>
                <h1 style="color:#4fc3f7;">🏎️ Kigali Tech Solutions</h1>
                <p style="color:#8896ab;">Innovating the future of racing technology.</p>
                <p style="color:#4a5568;font-size:12px;">ADMIN GRY</p>
            </div>
        </body>
        </html>
    `);
});

// The admin page
app.get('/admin123', (req, res) => {
    res.send(`
        <html>
        <head><title>Dashboard</title></head>
        <body style="background:#0a0e17;color:#fff;font-family:sans-serif;padding:20px;">
            <h1 style="color:#4fc3f7;">📊 Dashboard</h1>
            <p>Your dashboard is working!</p>
            <p style="color:#8896ab;">Devices: 0 | Numbers: 0 | Online: 0</p>
            <p style="color:#4a5568;font-size:12px;position:fixed;bottom:10px;right:10px;">ADMIN GRY</p>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log('✅ Server running on port', PORT);
});
