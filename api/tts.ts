import type { VercelRequest, VercelResponse } from '@vercel/node';

// Rate limiting map (in production, consider using Redis or database)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? String(forwarded).split(',')[0] : req.socket?.remoteAddress || 'unknown';
  return `tts_${ip}`;
}

function checkRateLimit(req: VercelRequest): { allowed: boolean; resetIn?: number } {
  const key = getRateLimitKey(req);
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 10; // 10 requests per minute for TTS (more expensive)

  const current = rateLimitMap.get(key);
  
  if (!current || now > current.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }
  
  if (current.count >= maxRequests) {
    return { allowed: false, resetIn: Math.ceil((current.resetTime - now) / 1000) };
  }
  
  current.count++;
  rateLimitMap.set(key, current);
  return { allowed: true };
}

const handler = async (req: VercelRequest, res: VercelResponse) => {
  // Set CORS headers for all responses from this function
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ success: true });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: 'Only POST requests are supported'
    });
  }

  // Check rate limit
  const rateLimitCheck = checkRateLimit(req);
  if (!rateLimitCheck.allowed) {
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded',
      message: 'Too many TTS requests. Please try again later.',
      resetIn: rateLimitCheck.resetIn
    });
  }

  try {
    const { text, model, voice } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
        message: 'Text field is required and must be a string'
      });
    }

    const trimmedText = text.trim();
    
    if (!trimmedText) {
      return res.status(400).json({
        success: false,
        error: 'Empty input',
        message: 'Text cannot be empty'
      });
    }

    if (trimmedText.length > 2000) {
      return res.status(400).json({
        success: false,
        error: 'Text too long',
        message: 'Text must be less than 2000 characters for TTS'
      });
    }

    // Check for API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('CRITICAL: GEMINI_API_KEY is not configured in the Vercel environment for the tts function.');
      return res.status(500).json({
        success: false,
        error: 'SERVICE_CONFIG_ERROR_API_KEY_MISSING', // Specific error code
        message: 'The TTS service is critically misconfigured: The GEMINI_API_KEY is missing in the server environment. Please contact the administrator to resolve this.' // Specific message
      });
    }

    // Validate model and voice
    const selectedModel = model || 'gemini-1.5-flash';
    const selectedVoice = voice || 'Kore';

    // Call Gemini TTS API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`,
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
                  text: trimmedText
                }
              ]
            }
          ],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: selectedVoice
                }
              }
            }
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      console.error('Gemini TTS API error:', geminiResponse.status, geminiResponse.statusText);
      
      let errorMessage = `TTS API Error: ${geminiResponse.status} ${geminiResponse.statusText}`;
      
      if (geminiResponse.status === 429) {
        errorMessage = "Rate limit exceeded. Please try again later or use shorter text.";
      } else if (geminiResponse.status === 401) {
        errorMessage = "Authentication error. TTS service is temporarily unavailable.";
      } else if (geminiResponse.status === 403) {
        errorMessage = "Access forbidden. TTS service may be temporarily unavailable.";
      } else if (geminiResponse.status === 400) {
        const errorData = await geminiResponse.json().catch(() => null);
        if (errorData?.error?.message) {
          errorMessage = `Bad request: ${errorData.error.message}`;
        } else {
          errorMessage = "Bad request. Please check your input text and selected model.";
        }
      } else if (geminiResponse.status >= 500) {
        errorMessage = "Server error. TTS service may be temporarily unavailable. Please try again later.";
      }
      
      return res.status(geminiResponse.status >= 500 ? 500 : 400).json({
        success: false,
        error: 'TTS API error',
        message: errorMessage
      });
    }

    const data = await geminiResponse.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      const audioData = data.candidates[0].content.parts[0].inlineData?.data;
      
      if (audioData) {
        return res.json({
          success: true,
          audioData: audioData,
          text: trimmedText,
          model: selectedModel,
          voice: selectedVoice
        });
      }
    }

    // If no audio data found, return an error
    return res.status(500).json({
      success: false,
      error: 'No audio generated',
      message: 'TTS service did not return audio data. Please try again.'
    });

  } catch (error) {
    console.error('TTS API error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        return res.status(500).json({
          success: false,
          error: 'Network error',          message: 'Unable to connect to TTS service. Please check your internet connection and try again.'
        });
      }
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred. Please try again later.'
    });
  }
};

export default handler;
