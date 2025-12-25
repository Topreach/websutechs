const express = require('express');
const router = express.Router();
const securityController = require('../controllers/securityController');

// Accept security logs from client-side (non-sensitive telemetry)
router.post('/log', securityController.receiveLog);

// Simple test endpoint
router.get('/test', (req, res) => {
    res.json({ success: true, message: 'Security API is working', timestamp: new Date().toISOString() });
});

module.exports = router;
