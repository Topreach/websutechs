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

    // Log the form data (remove email sending for now)
    console.log('Form submission:', { name, email, subject, message, category });
    console.log('Environment variables:', {
      EMAIL_USERNAME: process.env.EMAIL_USERNAME ? 'Set' : 'Missing',
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? 'Set' : 'Missing'
    });

    const messageId = `CONTACT-${Date.now()}`;

    // Simulate successful email sending
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Message received successfully (email disabled for testing)',
        messageId,
        debug: {
          name,
          email,
          subject,
          hasEnvVars: {
            username: !!process.env.EMAIL_USERNAME,
            password: !!process.env.EMAIL_PASSWORD
          }
        }
      })
    };

  } catch (error) {
    console.error('Contact function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: `Function error: ${error.message}`,
        stack: error.stack
      })
    };
  }
};