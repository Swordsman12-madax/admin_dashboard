// test.js - Minimal server to verify deployment
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Hello! Server is running.');
});

app.listen(PORT, () => {
    console.log('✅ Server running on port', PORT);
});
