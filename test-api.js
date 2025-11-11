// Quick test script to verify API integration
// Run with: node test-api.js

const testProviders = async () => {
  console.log('🧪 Testing Viber AI API Integration...\n');

  // Test OpenRouter (if API key is available)
  try {
    console.log('Testing OpenRouter integration...');
    const response = await fetch('http://localhost:3000/api/stream/research?worker=worker1&sessionId=test&provider=openrouter&model=meta-llama/llama-3.3-8b-instruct&prompt=test', {
      method: 'GET',
      headers: {
        'Accept': 'text/event-stream',
      }
    });
    
    if (response.ok) {
      console.log('✅ OpenRouter endpoint responding');
    } else {
      console.log('❌ OpenRouter endpoint failed:', response.status);
    }
  } catch (error) {
    console.log('⚠️  OpenRouter test skipped (no API key or server not running)');
  }

  // Test model discovery
  try {
    console.log('\nTesting model discovery...');
    const response = await fetch('http://localhost:3000/api/models', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'openrouter',
        apiKey: 'test-key'
      })
    });
    
    if (response.ok) {
      console.log('✅ Model discovery endpoint responding');
    } else {
      console.log('❌ Model discovery failed:', response.status);
    }
  } catch (error) {
    console.log('⚠️  Model discovery test skipped (server not running)');
  }

  console.log('\n🎉 API integration test completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Add your API keys to .env.local');
  console.log('2. Run: npm run dev');
  console.log('3. Open http://localhost:3000');
  console.log('4. Configure models and test with real AI responses!');
};

testProviders().catch(console.error);

