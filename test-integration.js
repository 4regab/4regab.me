/**
 * Integration test for the secure backend architecture
 * Tests key functionality to ensure all features work with the backend API
 */

// Test configuration
const BASE_URL = 'http://localhost:3000'; // Will need to be updated when server is running
const ENDPOINTS = {
  HEALTH: '/api/health',
  TRANSLATE: '/api/translate',
  CHAT: '/api/chat',
  TTS: '/api/tts'
};

async function testHealth() {
  console.log('🔍 Testing health endpoint...');
  try {
    const response = await fetch(`${BASE_URL}${ENDPOINTS.HEALTH}`);
    const data = await response.json();
    console.log('✅ Health check passed:', data);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

async function testTranslation() {
  console.log('🔍 Testing translation endpoint...');
  try {
    const response = await fetch(`${BASE_URL}${ENDPOINTS.TRANSLATE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Hello world',
        targetLanguage: 'Spanish',
        sourceLanguage: 'English'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Translation test passed:', data);
    return true;
  } catch (error) {
    console.error('❌ Translation test failed:', error.message);
    return false;
  }
}

async function testChat() {
  console.log('🔍 Testing chat endpoint...');
  try {
    const response = await fetch(`${BASE_URL}${ENDPOINTS.CHAT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello, how are you?',
        conversationId: 'test_' + Date.now()
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Chat test passed:', data);
    return true;
  } catch (error) {
    console.error('❌ Chat test failed:', error.message);
    return false;
  }
}

async function testTTS() {
  console.log('🔍 Testing TTS endpoint...');
  try {
    const response = await fetch(`${BASE_URL}${ENDPOINTS.TTS}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Hello world',
        voice: 'alloy',
        format: 'mp3'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ TTS test passed:', data);
    return true;
  } catch (error) {
    console.error('❌ TTS test failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting integration tests...\n');
  
  const results = [];
  
  // Test each endpoint
  results.push(await testHealth());
  results.push(await testTranslation());
  results.push(await testChat());
  results.push(await testTTS());
  
  const passed = results.filter(Boolean).length;
  const total = results.length;
  
  console.log(`\n📊 Test Results: ${passed}/${total} passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! The secure backend architecture is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the logs above for details.');
  }
  
  return passed === total;
}

// Export for use in other contexts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests, testHealth, testTranslation, testChat, testTTS };
} else {
  // Run tests if called directly
  runAllTests();
}
