(async () => {
  try {
    const res = await fetch('http://127.0.0.1:3000/api/security/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'security_test', message: 'Automated security log test from test script', timestamp: new Date().toISOString(), meta: { source: 'test_script' } })
    });

    const text = await res.text();
    console.log('STATUS:', res.status);
    console.log('BODY:', text);
  } catch (err) {
    console.error('ERROR:', err);
    process.exit(1);
  }
})();
