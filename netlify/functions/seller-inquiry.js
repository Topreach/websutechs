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
      availableQuantity,
      priceRange,
      origin,
      specifications,
      certifications,
      deliveryTerms,
      paymentTerms,
      additionalInfo
    } = data;

    if (!companyName || !contactPerson || !email || !specificProduct || !availableQuantity) {
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

    const inquiryId = `SELL-${Date.now()}`;

    await transporter.sendMail({
      from: `"ResultBroker" <${process.env.EMAIL_USERNAME}>`,
      to: 'contact@resultbroker.com',
      replyTo: email,
      subject: `New Seller Inquiry: ${specificProduct} - ${inquiryId}`,
      html: `
        <h2>New Seller Inquiry</h2>
        <p><strong>Reference:</strong> ${inquiryId}</p>
        <p><strong>Company:</strong> ${companyName}</p>
        <p><strong>Contact:</strong> ${contactPerson}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Country:</strong> ${country}</p>
        <p><strong>Product:</strong> ${specificProduct}</p>
        <p><strong>Available Quantity:</strong> ${availableQuantity}</p>
        <p><strong>Price Range:</strong> ${priceRange}</p>
        <p><strong>Origin:</strong> ${origin}</p>
        <p><strong>Specifications:</strong> ${specifications}</p>
        <p><strong>Certifications:</strong> ${certifications}</p>
        <p><strong>Delivery Terms:</strong> ${deliveryTerms}</p>
        <p><strong>Payment Terms:</strong> ${paymentTerms}</p>
        ${additionalInfo ? `<p><strong>Additional Info:</strong> ${additionalInfo}</p>` : ''}
      `
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Seller inquiry submitted successfully',
        inquiryId,
        nextSteps: [
          'Document verification process will begin',
          'Our team will contact you within 48 hours',
          'Complete KYC and compliance requirements',
          'Join our verified supplier network'
        ]
      })
    };

  } catch (error) {
    console.error('Seller inquiry error:', error);
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