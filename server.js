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
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Kigali Tech Solutions</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
                    min-height: 100vh;
                    background: #0a0e17;
                    color: #fff;
                    overflow-x: hidden;
                }
                .hero {
                    position: relative;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    padding: 40px 20px;
                    background: #0a0e17;
                }
                .hero-bg {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: 
                        linear-gradient(135deg, rgba(10,14,23,0.6) 0%, rgba(10,14,23,0.2) 100%),
                        url('https://raw.githubusercontent.com/Swordsman12-madax/admin_dashboard/main/public/images/kigali-convention-center.png') center/cover no-repeat;
                    z-index: 0;
                }
                .car-container {
                    position: absolute;
                    bottom: 5%;
                    width: 100%;
                    z-index: 1;
                    display: flex;
                    justify-content: space-around;
                    padding: 0 20px;
                    opacity: 0.25;
                }
                .car {
                    display: inline-block;
                    font-size: 48px;
                    filter: drop-shadow(0 0 20px rgba(79,195,247,0.1));
                    animation: floatCar 4s ease-in-out infinite;
                }
                .car:nth-child(2) { animation-delay: 0.5s; font-size: 56px; }
                .car:nth-child(3) { animation-delay: 1s; font-size: 42px; }
                .car:nth-child(4) { animation-delay: 1.5s; font-size: 52px; }
                @keyframes floatCar {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                .hero-content {
                    position: relative;
                    z-index: 2;
                    max-width: 800px;
                }
                .hero-logo {
                    font-size: 72px;
                    margin-bottom: 10px;
                    display: block;
                }
                .hero-title {
                    font-size: 52px;
                    font-weight: 700;
                    background: linear-gradient(135deg, #4fc3f7 0%, #7c4dff 50%, #4fc3f7 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-size: 200% 200%;
                    animation: gradientMove 4s ease-in-out infinite;
                    letter-spacing: -1px;
                }
                @keyframes gradientMove {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .hero-subtitle {
                    font-size: 20px;
                    color: #8896ab;
                    margin: 16px 0 8px;
                    font-weight: 300;
                    letter-spacing: 2px;
                }
                .hero-tagline {
                    font-size: 16px;
                    color: #4a5568;
                    margin-bottom: 30px;
                    font-weight: 300;
                }
                .hero-divider {
                    width: 80px;
                    height: 2px;
                    background: linear-gradient(90deg, #4fc3f7, #7c4dff);
                    margin: 20px auto 30px;
                    border: none;
                }
                .features {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                    gap: 20px;
                    margin-top: 30px;
                }
                .feature-item {
                    background: rgba(17, 25, 39, 0.6);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(79, 195, 247, 0.08);
                    border-radius: 12px;
                    padding: 16px 12px;
                    transition: all 0.3s ease;
                }
                .feature-item:hover {
                    border-color: rgba(79, 195, 247, 0.25);
                    transform: translateY(-2px);
                }
                .feature-item .icon {
                    font-size: 28px;
                    display: block;
                    margin-bottom: 6px;
                }
                .feature-item .label {
                    font-size: 12px;
                    color: #8896ab;
                    font-weight: 500;
                    letter-spacing: 0.5px;
                }
                .admin-gry-badge {
                    position: fixed;
                    bottom: 15px;
                    right: 15px;
                    font-size: 9px;
                    color: rgba(79,195,247,0.04);
                    font-family: 'Courier New', monospace;
                    letter-spacing: 3px;
                    user-select: none;
                    pointer-events: none;
                    z-index: 999;
                }
                @media (max-width: 768px) {
                    .hero-title { font-size: 32px; }
                    .hero-subtitle { font-size: 16px; }
                    .hero-logo { font-size: 48px; }
                    .car { font-size: 32px !important; }
                    .features { grid-template-columns: repeat(2, 1fr); }
                }
                @media (max-width: 480px) {
                    .hero-title { font-size: 24px; }
                    .hero-subtitle { font-size: 14px; }
                    .car-container { display: none; }
                }
            </style>
        </head>
        <body>
        <div class="admin-gry-badge">ADMIN GRY</div>
        <section class="hero">
            <div class="hero-bg"></div>
            <div class="car-container">
                <span class="car">🏎️</span>
                <span class="car">🏎️</span>
                <span class="car">🏎️</span>
                <span class="car">🏎️</span>
            </div>
            <div class="hero-content">
                <span class="hero-logo">🏎️</span>
                <h1 class="hero-title">Kigali Tech Solutions</h1>
                <p class="hero-subtitle">INNOVATING THE FUTURE OF RACING TECHNOLOGY</p>
                <div class="hero-divider"></div>
                <p class="hero-tagline">Luxury. Performance. Innovation.</p>
                <div class="features">
                    <div class="feature-item">
                        <span class="icon">⚡</span>
                        <span class="label">Electric Performance</span>
                    </div>
                    <div class="feature-item">
                        <span class="icon">🧠</span>
                        <span class="label">AI-Driven Tech</span>
                    </div>
                    <div class="feature-item">
                        <span class="icon">🔋</span>
                        <span class="label">Sustainable Energy</span>
                    </div>
                    <div class="feature-item">
                        <span class="icon">🌍</span>
                        <span class="label">Global Innovation</span>
                    </div>
                </div>
            </div>
        </section>
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
