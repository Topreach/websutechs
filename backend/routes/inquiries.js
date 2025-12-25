const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const inquiryController = require('../controllers/inquiryController.fixed');

// Rate limiters
const buyerInquiryLimiter = rateLimit({
    windowMs: 30 * 60 * 1000,
    max: 3,
    message: 'Too many buyer inquiries. Please try again later.'
});

const sellerInquiryLimiter = rateLimit({
    windowMs: 30 * 60 * 1000,
    max: 3,
    message: 'Too many seller inquiries. Please try again later.'
});

// Validation rules
const validateBuyerInquiry = [
    body('companyName').trim().notEmpty().isLength({ min: 2, max: 200 }).withMessage('Valid company name is required'),
    body('contactPerson').trim().notEmpty().isLength({ min: 2, max: 100 }).withMessage('Valid contact person name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').matches(/^[\+]?[1-9][\d]{0,15}$/).withMessage('Valid phone number is required'),
    body('country').trim().notEmpty().withMessage('Country is required'),
    body('productCategory').isIn(['petroleum', 'metals', 'diamonds', 'industrial']).withMessage('Invalid product category'),
    // Accept either a single specificProduct string or an array specificProducts (multiple selection from the client)
    body().custom((value, { req }) => {
        const hasSingle = req.body.specificProduct && typeof req.body.specificProduct === 'string' && req.body.specificProduct.trim().length > 0;
        const hasMultiple = Array.isArray(req.body.specificProducts) && req.body.specificProducts.length > 0;
        if (!hasSingle && !hasMultiple) {
            throw new Error('Specific product is required (single or multiple)');
        }
        return true;
    }),
    body('quantity').trim().notEmpty().withMessage('Quantity is required'),
    body('ndaAgreed').custom((value) => {
        if (value !== 'true' && value !== true) {
            throw new Error('You must agree to the NDA');
        }
        return true;
    })
];

const validateSellerInquiry = [
    body('companyName').trim().notEmpty().withMessage('Company name is required'),
    body('contactPerson').trim().notEmpty().withMessage('Contact person is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').matches(/^[\+]?[1-9][\d]{0,15}$/).withMessage('Valid phone number is required'),
    body('productDescription').trim().notEmpty().withMessage('Product description is required'),
    body('quantityAvailable').trim().notEmpty().withMessage('Quantity available is required'),
    body('certification').optional().trim()
];

// Routes
router.post('/buyer', buyerInquiryLimiter, validateBuyerInquiry, inquiryController.submitBuyerInquiry);
router.post('/seller', sellerInquiryLimiter, validateSellerInquiry, inquiryController.submitSellerInquiry);
router.post('/mandate', inquiryController.submitMandateApplication);
router.get('/status/:id', inquiryController.getInquiryStatus);

// Test endpoint
router.get('/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Inquiries API is working',
        endpoints: [
            'POST /api/inquiries/buyer',
            'POST /api/inquiries/seller',
            'POST /api/inquiries/mandate',
            'GET /api/inquiries/status/:id'
        ]
    });
});

module.exports = router;