const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const config = {
      host: 'mail.privateemail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    };

    console.log('Testing email config:', {
      host: config.host,
      port: config.port,
      user: config.auth.user ? 'Set' : 'Missing',
      pass: config.auth.pass ? 'Set' : 'Missing'
    });

    const transporter = nodemailer.createTransporter(config);
    
    // Test connection
    await transporter.verify();
    
    // Send test email
    const result = await transporter.sendMail({
      from: process.env.EMAIL_USERNAME,
      to: process.env.EMAIL_USERNAME,
      subject: 'Test Email from Netlify Function',
      text: 'This is a test email to verify SMTP configuration.'
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Email test successful',
        messageId: result.messageId,
        config: {
          host: config.host,
          port: config.port,
          user: config.auth.user
        }
      })
    };

  } catch (error) {
    console.error('Email test failed:', error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        code: error.code,
        config: {
          username: process.env.EMAIL_USERNAME ? 'Set' : 'Missing',
          password: process.env.EMAIL_PASSWORD ? 'Set' : 'Missing'
        }
      })
    };
  }
};