// server.js - Simple Admin Dashboard
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

// Simple route for testing
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

// Admin dashboard
app.get('/admin123', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Simple login
app.post('/admin123/api/login', express.json(), (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'yourpassword123') {
        res.json({ success: true });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// API endpoints
app.get('/admin123/api/stats', (req, res) => {
    res.json({ devices: 0, numbers: 0, online: 0 });
});

app.get('/admin123/api/devices', (req, res) => {
    res.json([]);
});

app.get('/admin123/api/numbers', (req, res) => {
    res.json([]);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log('✅ Server running on port', PORT);
    console.log('📍 http://localhost:' + PORT + '/admin123');
    console.log('🔑 Username: admin');
    console.log('🔑 Password: yourpassword123');
});
