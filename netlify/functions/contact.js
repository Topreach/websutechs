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