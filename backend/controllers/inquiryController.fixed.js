const { validationResult } = require('express-validator');
const { sendEmail, emailTemplates } = require('../config/mailer');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/database');

const getClientIp = (req) => (req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '').split(',')[0].trim();

// Submit buyer inquiry
exports.submitBuyerInquiry = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { companyName, contactPerson, email, phone, country, specificProduct, specificProducts, productCategories, quantity, targetPrice, deliveryLocation, paymentTerms, additionalRequirements, urgency = 'normal' } = req.body;

    const productList = specificProducts && Array.isArray(specificProducts) && specificProducts.length ? specificProducts : (specificProduct ? [specificProduct] : []);
    const storedSpecificProduct = productList.length ? productList.join('; ') : (specificProduct || '');
    const inquiryId = `BUY-${Date.now()}-${uuidv4().slice(0, 8)}`;

    db.saveInquiry({ id: inquiryId, type: 'buyer', companyName, contactPerson, email, phone, country, specificProduct: storedSpecificProduct, productCategories: productCategories || [], quantity, targetPrice, deliveryLocation, paymentTerms, additionalRequirements, urgency, status: 'new', createdAt: new Date().toISOString(), ipAddress: getClientIp(req), userAgent: req.get('User-Agent') });

    const adminEmail = process.env.EMAIL_FROM || 'contact@websutech.com';
    const adminEmailResult = await sendEmail({ to: adminEmail, subject: `🛒 New Buyer Inquiry: ${storedSpecificProduct} - ${inquiryId}`, html: emailTemplates.buyerInquiry({ inquiryId, companyName, contactPerson, specificProduct: storedSpecificProduct, quantity, targetPrice, deliveryLocation, paymentTerms, urgency, additionalRequirements }) });

    const buyerEmailResult = await sendEmail({ to: email, subject: `Inquiry Confirmation - ${storedSpecificProduct} (${inquiryId})`, html: emailTemplates.confirmationToBuyer({ contactPerson, specificProduct: storedSpecificProduct, inquiryId, quantity, companyName }) });

    return res.status(200).json({ success: true, message: 'Buyer inquiry submitted successfully', inquiryId, mail: { admin: adminEmailResult, buyer: buyerEmailResult } });
  } catch (error) {
    console.error('❌ Buyer inquiry error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit buyer inquiry', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

// Submit seller inquiry
exports.submitSellerInquiry = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { companyName, contactPerson, email, phone, country, specificProduct, availableQuantity, priceRange, origin, specifications, certifications, deliveryTerms, paymentTerms, additionalInfo } = req.body;
    const inquiryId = `SELL-${Date.now()}-${uuidv4().slice(0, 8)}`;

    db.saveInquiry({ id: inquiryId, type: 'seller', companyName, contactPerson, email, phone, country, specificProduct, availableQuantity, priceRange, origin, specifications, certifications, deliveryTerms, paymentTerms, additionalInfo, status: 'new', createdAt: new Date().toISOString(), ipAddress: getClientIp(req), userAgent: req.get('User-Agent') });

    await sendEmail({ to: process.env.EMAIL_FROM || 'contact@websutech.com', subject: `🏭 New Seller Inquiry: ${specificProduct} - ${inquiryId}`, html: `<p>Seller inquiry received: ${companyName} - ${specificProduct}</p>` });
    await sendEmail({ to: email, subject: `Seller Registration Confirmation - ${specificProduct} (${inquiryId})`, html: `<p>Thank you ${contactPerson}, we received your seller registration (${inquiryId}).</p>` });

    return res.status(200).json({ success: true, message: 'Seller inquiry submitted successfully', inquiryId });
  } catch (error) {
    console.error('❌ Seller inquiry error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit seller inquiry', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

// Get inquiry status
exports.getInquiryStatus = async (req, res) => {
  try {
    const { id: inquiryId } = req.params;
    const inquiry = db.getInquiry(inquiryId);
    if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found' });
    return res.status(200).json({ success: true, inquiry: { id: inquiry.id, type: inquiry.type, status: inquiry.status, createdAt: inquiry.createdAt, product: inquiry.specificProduct, company: inquiry.companyName } });
  } catch (error) {
    console.error('❌ Inquiry status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve inquiry status' });
  }
};

// Get all inquiries (summary)
exports.getAllInquiries = async (req, res) => {
  try {
    const { type, status, limit = 50 } = req.query;
    let inquiries = db.getAllInquiries();
    if (type) inquiries = inquiries.filter(i => i.type === type);
    if (status) inquiries = inquiries.filter(i => i.status === status);
    inquiries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    inquiries = inquiries.slice(0, parseInt(limit));
    const summaries = inquiries.map(i => ({ id: i.id, type: i.type, status: i.status, company: i.companyName, product: i.specificProduct, createdAt: i.createdAt }));
    return res.status(200).json({ success: true, count: summaries.length, inquiries: summaries });
  } catch (error) {
    console.error('❌ Get inquiries error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve inquiries' });
  }
};

// Submit mandate application
exports.submitMandateApplication = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { companyName, contactPerson, email, phone, country, experience, network, references, additionalInfo } = req.body;
    const mandateId = `MANDATE-${Date.now()}-${uuidv4().slice(0, 8)}`;

    db.saveInquiry({ id: mandateId, type: 'mandate', companyName, contactPerson, email, phone, country, experience, network, references, additionalInfo, status: 'pending_review', createdAt: new Date().toISOString(), ipAddress: getClientIp(req), userAgent: req.get('User-Agent') });

    await sendEmail({ to: process.env.EMAIL_FROM || 'contact@websutech.com', subject: `🤝 New Mandate Application - ${companyName} (${mandateId})`, html: `<p>Mandate application received: ${companyName} (${mandateId})</p>` });
    await sendEmail({ to: email, subject: `Mandate Application Received - ${mandateId}`, html: `<p>Thank you ${contactPerson}, your application (${mandateId}) has been received.</p>` });

    return res.status(200).json({ success: true, message: 'Mandate application submitted successfully', mandateId });
  } catch (error) {
    console.error('❌ Mandate application error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit mandate application', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};
