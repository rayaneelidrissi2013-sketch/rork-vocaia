async function testRailwayBackend() {
  const baseUrl = 'https://vocaia-backend-clean-production.up.railway.app';
  
  console.log('🔍 Testing Railway Backend...\n');
  console.log('Base URL:', baseUrl);
  console.log('=' .repeat(50));
  
  console.log('\n1️⃣ Testing root endpoint...');
  try {
    const response = await fetch(baseUrl);
    const data = await response.json();
    console.log('✅ Root endpoint status:', response.status);
    console.log('✅ Root endpoint response:', data);
  } catch (error) {
    console.error('❌ Root endpoint failed:', error);
  }
  
  console.log('\n2️⃣ Testing tRPC endpoint directly...');
  const trpcUrl = `${baseUrl}/api/trpc`;
  try {
    const response = await fetch(trpcUrl);
    console.log('✅ tRPC endpoint status:', response.status);
    const text = await response.text();
    console.log('✅ tRPC endpoint response:', text.substring(0, 200));
  } catch (error) {
    console.error('❌ tRPC endpoint failed:', error);
  }
  
  console.log('\n3️⃣ Testing auth.register route...');
  const registerUrl = `${baseUrl}/api/trpc/auth.register`;
  try {
    const response = await fetch(registerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@test.com',
        name: 'Test User',
        phoneNumber: '+33612345678',
        language: 'fr',
        timezone: 'Europe/Paris',
      }),
    });
    console.log('✅ auth.register status:', response.status);
    const text = await response.text();
    console.log('✅ auth.register response:', text.substring(0, 300));
  } catch (error) {
    console.error('❌ auth.register failed:', error);
  }
  
  console.log('\n4️⃣ Testing with proper tRPC client format...');
  const trpcClientUrl = `${baseUrl}/api/trpc/auth.register?batch=1&input=${encodeURIComponent(
    JSON.stringify({
      "0": {
        email: 'test@test.com',
        name: 'Test User',
        phoneNumber: '+33612345678',
        language: 'fr',
        timezone: 'Europe/Paris',
      }
    })
  )}`;
  
  try {
    const response = await fetch(trpcClientUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('✅ tRPC client format status:', response.status);
    const text = await response.text();
    console.log('✅ tRPC client format response:', text.substring(0, 300));
  } catch (error) {
    console.error('❌ tRPC client format failed:', error);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('Test completed!\n');
}

testRailwayBackend();
