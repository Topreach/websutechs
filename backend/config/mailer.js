// backend/config/mailer.js - Zoho Mail version
const nodemailer = require('nodemailer');

// Create Zoho Mail transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.zoho.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: false
    }
});

// NOTE: Skip transporter.verify on startup to avoid blocking DNS/network
// issues during app bootstrap. sendEmail will still attempt real sending
// when SMTP credentials are present and will return helpful errors.
console.log('📧 Mailer initialized (verification skipped at startup)');

const sendEmail = async (options) => {
    try {
        // Check if SMTP is configured
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.log('📧 [DEV MODE] Email would be sent:', {
                to: options.to,
                subject: options.subject,
                preview: options.html ? options.html.substring(0, 100) + '...' : 'No HTML content'
            });
            
            // Return success for development
            return { 
                success: true, 
                devMode: true,
                message: 'Email sent in development mode (logged to console)'
            };
        }

        // Actual email sending with Zoho
        // Zoho Mail requires the "from" address to match the authenticated SMTP_USER
        // Always use SMTP_USER as the from address to avoid "553 relay" errors
        const fromAddress = process.env.SMTP_USER || process.env.EMAIL_FROM;
        
        const mailOptions = {
            from: `"Websutech" <${fromAddress}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
            ...(options.text && { text: options.text }),
            // Reply-to should be the same as sender (contact@websutech.com)
            replyTo: process.env.EMAIL_REPLY_TO || fromAddress
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('📧 Email sent via Zoho:', info.messageId);
        
        return { 
            success: true, 
            messageId: info.messageId,
            message: 'Email sent successfully via Zoho Mail'
        };
    } catch (error) {
        console.error('❌ Email sending error:', error);
        
        // Provide helpful error messages
        let errorMessage = 'Failed to send email';
        if (error.code === 'EAUTH') {
            errorMessage = 'Email authentication failed. Check your Zoho credentials.';
        } else if (error.code === 'ECONNECTION') {
            errorMessage = 'Could not connect to email server. Check SMTP settings.';
        } else if (error.responseCode === 553 || error.message.includes('relay')) {
            errorMessage = 'Zoho Mail relay error: The "from" address must match your SMTP_USER. Using SMTP_USER as sender.';
            console.log('💡 Tip: Zoho requires EMAIL_FROM to match SMTP_USER. Current SMTP_USER:', process.env.SMTP_USER);
        }
        
        return { 
            success: false, 
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        };
    }
};

// Email templates
const emailTemplates = {
    buyerInquiry: (data) => `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
                .header { background: #1a365d; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { padding: 30px; background: #f9f9f9; border: 1px solid #ddd; border-top: none; }
                .footer { background: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #666; }
                .highlight { background: #e8f4fc; padding: 15px; border-radius: 5px; margin: 15px 0; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Websutech</h1>
                <p>Global Commodity Trading</p>
            </div>
            <div class="content">
                <h2>New Buyer Inquiry</h2>
                <p><strong>Reference:</strong> #${data.inquiryId}</p>
                <p><strong>Company:</strong> ${data.companyName}</p>
                <p><strong>Contact:</strong> ${data.contactPerson}</p>
                <p><strong>Product:</strong> ${data.specificProduct}</p>
                <p><strong>Quantity:</strong> ${data.quantity}</p>
                <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
                
                <div class="highlight">
                    <p><strong>Action Required:</strong> Please contact the buyer within 24 hours.</p>
                </div>
            </div>
            <div class="footer">
                <p>This is an automated message from Websutech Commodity Brokerage</p>
                <p>© ${new Date().getFullYear()} Websutech. All rights reserved.</p>
            </div>
        </body>
        </html>
    `,
    
    confirmationToBuyer: (data) => `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
                .header { background: #1a365d; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { padding: 30px; background: white; border: 1px solid #ddd; border-top: none; }
                .footer { background: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #666; }
                .btn { display: inline-block; padding: 12px 24px; background: #d4af37; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Websutech</h1>
                <p>Thank You for Your Inquiry</p>
            </div>
            <div class="content">
                <h2>Dear ${data.contactPerson},</h2>
                
                ${data.specificProduct && data.specificProduct !== 'General Inquiry' ? 
                    `<p>Thank you for submitting your inquiry for <strong>${data.specificProduct}</strong>.</p>` :
                    `<p>Thank you for contacting <strong>Websutech</strong>. We have received your message and appreciate you reaching out to us.</p>`
                }
                
                <p><strong>Inquiry Reference:</strong> #${data.inquiryId}</p>
                
                <p>Our trading team has received your request and will review it shortly. Here's what happens next:</p>
                
                <ol>
                    <li>Our team will review your inquiry (within 24 hours)</li>
                    ${data.specificProduct && data.specificProduct !== 'General Inquiry' ? 
                        `<li>We will prepare a Mutual NDA for signing</li>
                        <li>After NDA execution, we'll share available offers</li>
                        <li>You'll receive formal offers from verified suppliers</li>` :
                        `<li>We will respond to your message with detailed information</li>
                        <li>If needed, we'll schedule a call to discuss your requirements</li>
                        <li>You'll receive personalized assistance from our team</li>`
                    }
                </ol>
                
                <p style="text-align: center; margin: 30px 0;">
                    <a href="https://websutech.com/track/${data.inquiryId}" class="btn">Track Your Inquiry</a>
                </p>
                
                <p>If you have any immediate questions, please contact our team:</p>
                <p>📧 <a href="mailto:${process.env.EMAIL_FROM || 'contact@websutech.com'}">${process.env.EMAIL_FROM || 'contact@websutech.com'}</a></p>
                <p>📞 +1 (555) 123-4567</p>
                
                <p>We look forward to assisting you with your commodity trading needs.</p>
                
                <p>Best regards,<br>
                <strong>The Websutech Team</strong></p>
            </div>
            <div class="footer">
                <p>Websutech - Global Commodity Trading Solutions</p>
                <p>Dubai | Singapore | London | Houston</p>
                <p>© ${new Date().getFullYear()} Websutech. All rights reserved.</p>
            </div>
        </body>
        </html>
    `,
    
    contactConfirmation: (data) => `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
                .header { background: #1a365d; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { padding: 30px; background: white; border: 1px solid #ddd; border-top: none; }
                .footer { background: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #666; }
                .message-box { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #d4af37; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Websutech</h1>
                <p>Thank You for Contacting Us</p>
            </div>
            <div class="content">
                <h2>Dear ${data.name},</h2>
                
                <p>Thank you for reaching out to Websutech! We have received your message and appreciate you taking the time to contact us.</p>
                
                <div class="message-box">
                    <p><strong>Message Reference:</strong> #${data.messageId}</p>
                    <p><strong>Subject:</strong> ${data.subject}</p>
                    ${data.category ? `<p><strong>Category:</strong> ${data.category}</p>` : ''}
                </div>
                
                <p>Our team will review your message and respond to you within <strong>24 hours</strong> during business days.</p>
                
                <p>In the meantime, if you have any urgent inquiries, please feel free to contact us directly:</p>
                <ul>
                    <li>📧 Email: <a href="mailto:${process.env.EMAIL_FROM || 'contact@websutech.com'}">${process.env.EMAIL_FROM || 'contact@websutech.com'}</a></li>
                    <li>📞 Phone: +1 (555) 123-4567</li>
                </ul>
                
                <p>We look forward to assisting you with your commodity trading needs.</p>
                
                <p>Best regards,<br>
                <strong>The Websutech Team</strong></p>
            </div>
            <div class="footer">
                <p>Websutech - Global Commodity Trading Solutions</p>
                <p>Dubai | Singapore | London | Houston</p>
                <p>© ${new Date().getFullYear()} Websutech. All rights reserved.</p>
            </div>
        </body>
        </html>
    `
};

module.exports = { sendEmail, emailTemplates, transporter };