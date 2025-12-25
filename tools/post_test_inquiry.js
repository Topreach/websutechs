#!/usr/bin/env node
// tools/post_test_inquiry.js
// POST a test buyer inquiry to the local dev server and print the full response.

const payload = {
  companyName: 'Test Co',
  contactPerson: 'QA Tester',
  email: 'test-buyer@example.com',
  phone: '+12025550123',
  country: 'AE',
  productCategory: 'petroleum',
  specificProducts: ['EN590 Diesel'],
  quantity: '1000 MT',
  ndaAgreed: 'true'
};

async function run() {
  try {
    const url = process.env.TARGET_URL || 'http://localhost:3000/api/inquiries/buyer';
    console.log('POST', url);

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    console.log('HTTP', res.status, res.statusText);
    try {
      const json = JSON.parse(text);
      console.log('Response JSON:');
      console.dir(json, { depth: null });
    } catch (e) {
      console.log('Response body (non-JSON):');
      console.log(text);
    }
  } catch (err) {
    console.error('Request failed:', err && err.stack ? err.stack : err);
    process.exit(1);
  }
}

run();
