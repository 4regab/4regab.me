import type { VercelRequest, VercelResponse } from '@vercel/node';

// Rate limiting map (in production, consider using Redis or database)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? String(forwarded).split(',')[0] : req.socket?.remoteAddress || 'unknown';
  return `translate_${ip}`;
}

function checkRateLimit(req: VercelRequest): { allowed: boolean; resetIn?: number } {
  const key = getRateLimitKey(req);
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 20; // 20 requests per minute for translation

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
      message: 'Too many translation requests. Please try again later.',
      resetIn: rateLimitCheck.resetIn
    });
  }

  try {
    const { text, targetLanguage, sourceLanguage = 'auto' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
        message: 'Text field is required and must be a string'
      });
    }

    if (!targetLanguage || typeof targetLanguage !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
        message: 'Target language is required'
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

    if (trimmedText.length > 5000) {
      return res.status(400).json({
        success: false,
        error: 'Text too long',
        message: 'Text must be less than 5000 characters for translation'
      });
    }

    // Check for API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY not configured');
      return res.status(500).json({
        success: false,
        error: 'Service configuration error',
        message: 'Translation service is not properly configured'
      });
    }

    // Construct translation prompt
    const sourceText = sourceLanguage === 'auto' 
      ? `Detect the language and translate the following text to ${targetLanguage}:`
      : `Translate the following text from ${sourceLanguage} to ${targetLanguage}:`;

    const prompt = `${sourceText}\n\n"${trimmedText}"\n\nProvide only the translation without any additional explanation or formatting.`;    // Call Gemini API with stable model
    const model = 'gemini-1.5-flash'; // Use stable model instead of preview
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
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
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      }
    );

    if (!geminiResponse.ok) {
      console.error('Gemini Translation API error:', geminiResponse.status, geminiResponse.statusText);
      
      let errorMessage = `Translation API Error: ${geminiResponse.status} ${geminiResponse.statusText}`;
      
      if (geminiResponse.status === 429) {
        errorMessage = 'Translation service is temporarily overloaded. Please try again in a few moments.';
      } else if (geminiResponse.status === 401) {
        errorMessage = 'Translation service authentication failed. Please check configuration.';
      } else if (geminiResponse.status === 403) {
        errorMessage = 'Translation service access denied. Please check your permissions.';
      } else if (geminiResponse.status === 400) {
        const errorText = await geminiResponse.text();
        console.error('Translation API 400 error details:', errorText);
        errorMessage = 'Invalid translation request. Please check your input.';
      } else if (geminiResponse.status >= 500) {
        errorMessage = 'Translation service is temporarily unavailable. Please try again later.';
      }
      
      return res.status(geminiResponse.status >= 500 ? 500 : 400).json({
        success: false,
        error: 'Translation API error',
        message: errorMessage
      });
    }

    const geminiData = await geminiResponse.json();

    // Extract translation from Gemini
    if (!geminiData.candidates || 
        !geminiData.candidates[0] || 
        !geminiData.candidates[0].content || 
        !geminiData.candidates[0].content.parts || 
        !geminiData.candidates[0].content.parts[0]) {
      console.error('Unexpected Gemini API response structure:', geminiData);
      return res.status(500).json({
        success: false,
        error: 'Translation processing error',
        message: 'Unable to process translation. Please try again.'
      });
    }

    const translatedText = geminiData.candidates[0].content.parts[0].text || '';

    if (!translatedText.trim()) {
      return res.status(500).json({
        success: false,
        error: 'Empty translation',
        message: 'Translation service returned empty result. Please try again.'
      });
    }

    return res.json({
      success: true,
      translatedText: translatedText.trim(),
      sourceLanguage: sourceLanguage,
      targetLanguage: targetLanguage,
      originalText: trimmedText
    });

  } catch (error) {
    console.error('Translation API error:', error);
    
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred. Please try again later.'
    });
  }
};

export default handler;
