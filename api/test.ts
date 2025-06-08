import type { VercelRequest, VercelResponse } from '@vercel/node';

const handler = async (req: VercelRequest, res: VercelResponse) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true });
  }

  try {
    // Check environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    const hasApiKey = !!apiKey && apiKey !== 'your_gemini_api_key_here';
    
    // Test basic Gemini API call if API key is available
    let geminiTest = null;
    if (hasApiKey) {
      try {
        const testResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: "Say 'Hello, API test successful!'"
                    }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 100,
              }
            })
          }
        );

        geminiTest = {
          status: testResponse.status,
          ok: testResponse.ok,
          statusText: testResponse.statusText
        };

        if (testResponse.ok) {
          const data = await testResponse.json();
          geminiTest.response = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
        } else {
          const errorText = await testResponse.text();
          geminiTest.error = errorText;
        }
      } catch (error) {
        geminiTest = {
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    return res.json({
      success: true,
      environment: {
        hasApiKey,
        apiKeyPreview: apiKey ? `${apiKey.substring(0, 8)}...` : 'Not set',
        node_env: process.env.NODE_ENV,
        vercel_env: process.env.VERCEL_ENV
      },
      geminiApiTest: geminiTest,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test API error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
};

export default handler;
