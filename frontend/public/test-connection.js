// Simple test to check if frontend can reach backend
async function testBackendConnection() {
  console.log('Testing backend connection...');
  
  try {
    // Test 1: Simple health check
    const healthResponse = await fetch('http://localhost:8000/health');
    console.log('Health check status:', healthResponse.status);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('Health check response:', healthData);
    }
    
    // Test 2: Auth endpoint
    const authResponse = await fetch('http://localhost:8000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@cenai.com',
        password: 'admin123'
      })
    });
    
    console.log('Auth test status:', authResponse.status);
    
    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log('Auth test response:', authData);
    } else {
      console.error('Auth test failed:', await authResponse.text());
    }
    
  } catch (error) {
    console.error('Connection test failed:', error);
  }
}

// Run the test
testBackendConnection();