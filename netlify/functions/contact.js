const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { name, email, subject, message, category = 'general' } = JSON.parse(event.body);

    if (!name || !email || !subject || !message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'All fields are required' 
        })
      };
    }

    const messageId = `CONTACT-${Date.now()}`;
    let emailStatus = 'not_attempted';
    let emailError = null;

    // Check if email credentials are available
    if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
      console.log('Email credentials missing');
      emailStatus = 'credentials_missing';
    } else {
      try {
        console.log('Attempting to send email...');
        
        const transporter = nodemailer.createTransport({
          host: 'mail.privateemail.com',
          port: 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
          },
          tls: {
            rejectUnauthorized: false
          },
          debug: true,
          logger: true
        });

        // Verify connection first
        console.log('Verifying SMTP connection...');
        await transporter.verify();
        console.log('SMTP connection verified');

        const mailOptions = {
          from: process.env.EMAIL_USERNAME,
          to: process.env.EMAIL_USERNAME,
          replyTo: email,
          subject: `New Contact: ${subject}`,
          html: `
            <h2>New Contact Message</h2>
            <p><strong>ID:</strong> ${messageId}</p>
            <p><strong>From:</strong> ${name} (${email})</p>
            <p><strong>Category:</strong> ${category}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          `
        };

        console.log('Sending email to:', process.env.EMAIL_USERNAME);
        const result = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', result.messageId);
        
        // Send auto-reply to customer
        await transporter.sendMail({
          from: process.env.EMAIL_USERNAME,
          to: email,
          subject: 'Thank you for contacting ResultBroker',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1a365d;">Thank You for Your Inquiry</h2>
              <p>Dear ${name},</p>
              <p>Thank you for contacting ResultBroker. We have received your message and will respond within 24 hours.</p>
              
              <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1a365d; margin-top: 0;">Your Message Details:</h3>
                <p><strong>Reference ID:</strong> ${messageId}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Category:</strong> ${category}</p>
              </div>
              
              <h3 style="color: #1a365d;">What happens next?</h3>
              <ul>
                <li>Our team will review your inquiry</li>
                <li>You'll receive a detailed response within 24 hours</li>
                <li>For urgent matters, call +1 (555) 123-4567</li>
              </ul>
              
              <p>Best regards,<br>
              <strong>ResultBroker Team</strong><br>
              Global Commodity Trading Solutions</p>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
              <p style="font-size: 12px; color: #718096;">
                This is an automated message. Please do not reply to this email.
                For immediate assistance, contact us at contact@resultbroker.com
              </p>
            </div>
          `
        });
        
        emailStatus = 'sent';
        
      } catch (emailErr) {
        console.error('Email sending failed:', emailErr);
        emailStatus = 'failed';
        emailError = emailErr.message;
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Message received successfully',
        messageId,
        emailStatus,
        emailError: emailError || undefined
      })
    };

  } catch (error) {
    console.error('Contact function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to process message'
      })
    };
  }
};