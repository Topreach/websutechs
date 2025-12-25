const express = require('express');
const router = express.Router();
const path = require('path');

// Available documents
const documents = {
    ndas: [
        { id: 'mutual-nda', name: 'Mutual Non-Disclosure Agreement', file: 'mutual-nda.pdf', description: 'For mutual confidentiality between parties' },
        { id: 'seller-nda', name: 'Seller Non-Disclosure Agreement', file: 'seller-nda.pdf', description: 'For seller confidentiality' }
    ],
    agreements: [
        { id: 'ncnnda', name: 'Non-Circumvention Non-Disclosure Agreement', file: 'ncnnda.pdf', description: 'NCNDA for broker protection' },
        { id: 'imfpa', name: 'Irrevocable Master Fee Protection Agreement', file: 'imfpa.pdf', description: 'IMFPA for commission protection' },
        { id: 'broker-agreement', name: 'Broker Agreement', file: 'broker-agreement.pdf', description: 'Standard broker agreement' }
    ],
    compliance: [
        { id: 'kyc-policy', name: 'KYC Policy', file: 'kyc-policy.pdf', description: 'Know Your Customer policy' },
        { id: 'aml-policy', name: 'AML Policy', file: 'aml-policy.pdf', description: 'Anti-Money Laundering policy' },
        { id: 'sanctions-policy', name: 'Sanctions Policy', file: 'sanctions-policy.pdf', description: 'International sanctions compliance' }
    ],
    company: [
        { id: 'company-profile', name: 'Company Profile', file: 'company-profile.pdf', description: 'Websutech company overview' }
    ]
};

// Get all documents
router.get('/list', (req, res) => {
    res.json({
        success: true,
        documents,
        timestamp: new Date().toISOString()
    });
});

// Get specific document category
router.get('/category/:category', (req, res) => {
    const { category } = req.params;
    
    if (!documents[category]) {
        return res.status(404).json({
            success: false,
            message: 'Document category not found'
        });
    }
    
    res.json({
        success: true,
        category,
        documents: documents[category]
    });
});

// Request document access (simulated)
router.post('/request/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, company } = req.body;
    
    // Find document
    let foundDoc = null;
    for (const category in documents) {
        const doc = documents[category].find(d => d.id === id);
        if (doc) {
            foundDoc = { ...doc, category };
            break;
        }
    }
    
    if (!foundDoc) {
        return res.status(404).json({
            success: false,
            message: 'Document not found'
        });
    }
    
    // Log request (in production, save to database and send email)
    console.log('Document request:', {
        document: foundDoc.name,
        requestedBy: { name, email, company },
        timestamp: new Date().toISOString(),
        ip: req.ip
    });
    
    res.json({
        success: true,
        message: 'Document request received. You will receive an email with download instructions.',
        document: foundDoc.name,
        reference: `DOC-${Date.now()}`
    });
});

// Test endpoint
router.get('/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Documents API is working',
        availableCategories: Object.keys(documents)
    });
});

module.exports = router;