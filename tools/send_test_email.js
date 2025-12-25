#!/usr/bin/env node
// tools/send_test_email.js
// Sends a test email using the project's mailer helper.

const path = require('path');

async function run() {
  try {
    // Load .env from repo root so SMTP_* vars are available when running this script directly
    try {
      require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
    } catch (e) {
      // dotenv not required; continue
    }

    console.log('SMTP_USER present:', !!process.env.SMTP_USER);

    const mailer = require(path.join(__dirname, '..', 'backend', 'config', 'mailer'));
    const { sendEmail } = mailer;

    console.log('Sending test email to contact@websutech.com...');

    // Add a timeout so we don't hang indefinitely if the SMTP connection stalls.
    const sendPromise = sendEmail({
      to: 'contact@websutech.com',
      subject: 'Test email from Websutech Dev',
      html: '<p>This is a test email from the Websutech dev environment. If you received this, email sending is working.</p>'
    });

    const timeoutMs = 15000; // 15 seconds
    let result;
    try {
      result = await Promise.race([
        sendPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('sendEmail timed out after ' + timeoutMs + 'ms')), timeoutMs))
      ]);
      console.log('Result:', result);
    } catch (err) {
      console.error('Test email error / timeout:', err && err.message ? err.message : err);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error running test email:', err);
    process.exit(1);
  }
}

run();
