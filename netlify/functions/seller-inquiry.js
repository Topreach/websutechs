const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
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
        body: JSON.stringify({ 
          success: false, 
          error: 'Required fields missing' 
        })
      };
    }

    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const inquiryId = `SELL-${Date.now()}`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.ADMIN_EMAIL,
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
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Failed to submit inquiry'
      })
    };
  }
};