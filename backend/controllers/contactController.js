const { validationResult } = require('express-validator');
const { sendEmail, emailTemplates } = require('../config/mailer');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/database');

// Track recent submissions to prevent duplicates (in-memory, clears on restart)
const recentSubmissions = new Map();

exports.submitContact = async (req, res) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { name, email, subject, message, category = 'general' } = req.body;
        
        // Prevent duplicate submissions (same email + subject + message hash within 5 seconds)
        // Use a more precise key to avoid false positives
        const messageHash = message ? message.substring(0, 50).replace(/\s/g, '') : '';
        const submissionKey = `${email}:${subject}:${messageHash}`;
        
        // Check if this exact submission was made recently
        const existingSubmission = recentSubmissions.get(submissionKey);
        if (existingSubmission && (Date.now() - existingSubmission) < 5000) {
            console.log('⚠️ Duplicate submission detected (within 5 seconds):', { email, subject });
            // Return success to avoid confusing the user - their message was already received
            return res.status(200).json({
                success: true,
                message: 'Your message was already received successfully!',
                messageId: existingSubmission.messageId || 'Already Processed',
                duplicate: true,
                nextSteps: [
                    'We will respond to your message within 24 hours',
                    'Check your email for confirmation'
                ]
            });
        }
        
        // Mark this submission with timestamp
        const messageId = `CONTACT-${Date.now()}-${uuidv4().slice(0, 8)}`;
        recentSubmissions.set(submissionKey, {
            timestamp: Date.now(),
            messageId: messageId
        });
        
        // Clean up after 60 seconds
        setTimeout(() => {
            const submission = recentSubmissions.get(submissionKey);
            if (submission && (Date.now() - submission.timestamp) > 60000) {
                recentSubmissions.delete(submissionKey);
            }
        }, 60000);

        // messageId was already created above for duplicate detection
        // Store contact submission
        db.saveContact({
            id: messageId,
            name,
            email,
            subject,
            message,
            category,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            status: 'new'
        });

        console.log('📝 Contact form submitted:', {
            messageId,
            name,
            email,
            subject: subject.substring(0, 50) + (subject.length > 50 ? '...' : ''),
            category
        });

        // Send emails (admin notification and user confirmation)
        // Send user confirmation first (most important - client assurance)
        const userEmailResult = await sendEmail({
            to: email,
            subject: `Thank You for Your Inquiry - ${messageId}`,
            html: emailTemplates.confirmationToBuyer({
                contactPerson: name,
                specificProduct: subject || 'General Inquiry',
                inquiryId: messageId,
                quantity: '',
                companyName: name
            })
        });

        // Send admin notification (non-blocking - if it fails, we still return success)
        const adminEmailResult = await sendEmail({
            to: process.env.EMAIL_FROM || 'contact@websutech.com',
            subject: `New Contact Message: ${subject}`,
            html: `
                <h2>New Contact Message</h2>
                <p><strong>Message ID:</strong> ${messageId}</p>
                <p><strong>From:</strong> ${name} (${email})</p>
                <p><strong>Category:</strong> ${category}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
                    ${message.replace(/\n/g, '<br>')}
                </div>
                <p><strong>Received:</strong> ${new Date().toLocaleString()}</p>
            `
        });

        // Log email results
        if (userEmailResult.success) {
            console.log('✅ User confirmation email sent successfully');
        } else {
            console.error('⚠️ User confirmation email failed:', userEmailResult.error);
        }

        if (adminEmailResult.success) {
            console.log('✅ Admin notification email sent successfully');
        } else {
            console.warn('⚠️ Admin notification email failed (non-critical):', adminEmailResult.error);
        }

        // Return success if user email was sent (most important)
        // Admin email failure is logged but doesn't fail the request
        if (userEmailResult.success) {
            res.status(200).json({
                success: true,
                message: 'Contact message sent successfully',
                messageId,
                nextSteps: [
                    'We will respond to your message within 24 hours',
                    'Check your email for confirmation'
                ],
                emailSent: true
            });
        } else {
            // Only fail if user email couldn't be sent
            throw new Error(userEmailResult.error || 'Failed to send confirmation email');
        }

    } catch (error) {
        console.error('❌ Contact submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send contact message',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.subscribeNewsletter = async (req, res) => {
    try {
        const { email, name } = req.body;
        
        if (!email || !email.includes('@')) {
            return res.status(400).json({
                success: false,
                message: 'Valid email is required'
            });
        }

        // Store subscription
        const subscriptionId = `NEWS-${Date.now()}`;
        db.saveUser({
            id: subscriptionId,
            email,
            name: name || '',
            type: 'newsletter',
            active: true
        });

        console.log('📰 Newsletter subscription:', { email, name: name || 'Anonymous' });

        // Send welcome email
        await sendEmail({
            to: email,
            subject: 'Welcome to Websutech Newsletter',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #1a365d; color: white; padding: 20px; text-align: center;">
                        <h1>Websutech Newsletter</h1>
                    </div>
                    <div style="padding: 30px; background: white;">
                        <h2>Welcome to Our Community!</h2>
                        <p>Dear ${name || 'Subscriber'},</p>
                        <p>Thank you for subscribing to the Websutech newsletter. You'll now receive:</p>
                        <ul>
                            <li>📈 Market trends and commodity insights</li>
                            <li>🛢️ New product offerings and availability</li>
                            <li>🌍 Industry news and analysis</li>
                            <li>💎 Special offers and trading opportunities</li>
                            <li>🔒 Compliance and regulatory updates</li>
                        </ul>
                        <p>We respect your privacy. You can unsubscribe at any time by clicking the link in our emails.</p>
                        <br>
                        <p>Best regards,<br>The Websutech Team</p>
                    </div>
                    <div style="background: #f1f1f1; padding: 20px; text-align: center; font-size: 12px;">
                        <p>© ${new Date().getFullYear()} Websutech. All rights reserved.</p>
                    </div>
                </div>
            `
        });

        res.status(200).json({
            success: true,
            message: 'Successfully subscribed to newsletter',
            subscriptionId
        });

    } catch (error) {
        console.error('❌ Newsletter subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to subscribe to newsletter'
        });
    }
};