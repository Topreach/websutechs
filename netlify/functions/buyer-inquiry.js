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
    const data = JSON.parse(event.body);
    const {
      companyName,
      contactPerson,
      email,
      phone,
      country,
      specificProduct,
      quantity,
      targetPrice,
      deliveryLocation,
      paymentTerms,
      additionalRequirements,
      urgency = 'normal'
    } = data;

    if (!companyName || !contactPerson || !email || !specificProduct || !quantity) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Required fields missing' 
        })
      };
    }

    const transporter = nodemailer.createTransport({
      host: 'mail.privateemail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const inquiryId = `BUY-${Date.now()}`;

    await transporter.sendMail({
      from: `"ResultBroker" <${process.env.EMAIL_USERNAME}>`,
      to: 'contact@resultbroker.com',
      replyTo: email,
      subject: `New Buyer Inquiry: ${specificProduct} - ${inquiryId}`,
      html: `
        <h2>New Buyer Inquiry</h2>
        <p><strong>Reference:</strong> ${inquiryId}</p>
        <p><strong>Company:</strong> ${companyName}</p>
        <p><strong>Contact:</strong> ${contactPerson}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Country:</strong> ${country}</p>
        <p><strong>Product:</strong> ${specificProduct}</p>
        <p><strong>Quantity:</strong> ${quantity}</p>
        <p><strong>Target Price:</strong> ${targetPrice}</p>
        <p><strong>Delivery Location:</strong> ${deliveryLocation}</p>
        <p><strong>Payment Terms:</strong> ${paymentTerms}</p>
        <p><strong>Urgency:</strong> ${urgency}</p>
        ${additionalRequirements ? `<p><strong>Additional Requirements:</strong> ${additionalRequirements}</p>` : ''}
      `
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Buyer inquiry submitted successfully',
        inquiryId,
        nextSteps: [
          'Our team will review your inquiry within 24 hours',
          'You will receive a Mutual NDA for signing',
          'After NDA execution, we will share available offers',
          'Track your inquiry status using the reference ID'
        ]
      })
    };

  } catch (error) {
    console.error('Buyer inquiry error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to submit inquiry'
      })
    };
  }
};