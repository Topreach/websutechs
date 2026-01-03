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
    // Check environment variables
    const envCheck = {
      EMAIL_USERNAME: process.env.EMAIL_USERNAME || 'NOT_SET',
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? 'SET' : 'NOT_SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT_SET'
    };

    console.log('Environment check:', envCheck);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Environment check complete',
        environment: envCheck,
        timestamp: new Date().toISOString(),
        suggestions: [
          'Verify contact@resultbroker.com email account exists in Namecheap',
          'Check if SMTP is enabled for the email account',
          'Verify the password is correct',
          'Try using mail.resultbroker.com as SMTP host instead',
          'Check spam/junk folder for delivered emails'
        ]
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message,
        stack: error.stack
      })
    };
  }
};