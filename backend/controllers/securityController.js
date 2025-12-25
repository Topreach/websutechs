const logger = require('../utils/logger');

exports.receiveLog = async (req, res) => {
    try {
        const payload = req.body || {};

        // Basic sanitization / limit fields we persist
        const entry = {
            type: payload.type || 'security_alert',
            message: String(payload.message || '').slice(0, 2000),
            url: payload.url || req.get('Referer') || '',
            userAgent: payload.userAgent || req.get('User-Agent') || '',
            ip: req.ip,
            timestamp: payload.timestamp || new Date().toISOString(),
            meta: payload.meta || {}
        };

        // Log at warning level to the logger
        logger.warn({ security: entry });

        // In future: persist to DB or alerting system
        res.status(201).json({ success: true, message: 'Security log received' });
    } catch (error) {
        logger.error('Error receiving security log', { error: error.message });
        res.status(500).json({ success: false, message: 'Failed to record security log' });
    }
};
