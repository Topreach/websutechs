const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const contactController = require('../controllers/contactController');

// Rate limiting: 5 requests per 15 minutes
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many contact requests from this IP, please try again later.'
});

// Validation rules
const validateContact = [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('subject').trim().notEmpty().withMessage('Subject is required').isLength({ max: 200 }),
    body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 5000 }),
    body('category').optional().isIn(['general', 'technical', 'compliance', 'sales']).withMessage('Invalid category')
];

// Routes
router.post('/submit', contactLimiter, validateContact, contactController.submitContact);
router.post('/newsletter', contactLimiter, contactController.subscribeNewsletter);

// Test endpoint
router.get('/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Contact API is working',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;