app.post('/a9f3k217/api/login', (req, res) => {
    const ip = getClientIP(req);
    const now = Date.now();
    const blockDuration = 12 * 60 * 60 * 1000;

    // Debug: log IP and current attempts
    console.log(`Login attempt from IP: ${ip}`);
    console.log(`Current failed attempts data:`, failedAttempts[ip]);

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
            console.log(`🔒 IP ${ip} blocked for 12 hours`);
            res.status(401).json({ remainingAttempts: 0 });
        } else {
            console.log(`❌ IP ${ip} has ${remaining} attempts left`);
            res.status(401).json({ remainingAttempts: remaining });
        }
    }
});
