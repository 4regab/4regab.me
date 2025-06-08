import type { VercelRequest, VercelResponse } from '@vercel/node';

// Rate limiting map (in production, consider using Redis or database)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? String(forwarded).split(',')[0] : req.socket?.remoteAddress || 'unknown';
  return `chat_${ip}`;
}

function checkRateLimit(req: VercelRequest): { allowed: boolean; resetIn?: number } {
  const key = getRateLimitKey(req);
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 30; // 30 requests per minute for chat

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
      message: 'Too many chat requests. Please try again later.',
      resetIn: rateLimitCheck.resetIn
    });
  }

  try {
    const { 
      prompt, 
      systemPrompt, 
      conversationHistory, 
      model = 'gemini-1.5-flash',
      enableThinking = false 
    } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
        message: 'Prompt field is required and must be a string'
      });
    }

    const trimmedPrompt = prompt.trim();
    
    if (!trimmedPrompt) {
      return res.status(400).json({
        success: false,
        error: 'Empty input',
        message: 'Prompt cannot be empty'
      });
    }

    if (trimmedPrompt.length > 100000) {
      return res.status(400).json({
        success: false,
        error: 'Prompt too long',
        message: 'Prompt must be less than 100,000 characters'
      });
    }

    // Check for API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY not configured');
      return res.status(500).json({
        success: false,
        error: 'Service configuration error',
        message: 'Chat service is not properly configured'
      });
    }

    // Prepare contents for Gemini API
    const contents: any[] = [];

    // Add conversation history if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const historyItem of conversationHistory) {
        if (historyItem.role && historyItem.parts) {
          contents.push({
            role: historyItem.role,
            parts: historyItem.parts
          });
        }
      }
    }

    // Add current user prompt
    const currentParts: any[] = [{ text: trimmedPrompt }];
    contents.push({ role: 'user', parts: currentParts });

    // Prepare request config
    const requestConfig: any = {
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
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
    };

    // Add system instruction if provided
    if (systemPrompt && typeof systemPrompt === 'string' && systemPrompt.trim()) {
      requestConfig.systemInstruction = {
        parts: [{ text: systemPrompt.trim() }]
      };
    }

    // Add thinking configuration if enabled and supported
    if (enableThinking && (model.includes('2.5') || model.includes('2.0'))) {
      requestConfig.thinkingConfig = {
        includeThoughts: true
      };
    }

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestConfig)
      }
    );

    if (!geminiResponse.ok) {
      console.error('Gemini Chat API error:', geminiResponse.status, geminiResponse.statusText);
      
      if (geminiResponse.status === 429) {
        return res.status(429).json({
          success: false,
          error: 'Rate limit exceeded',
          message: 'Chat service is temporarily overloaded. Please try again in a few moments.',
          resetIn: 60
        });
      } else if (geminiResponse.status === 400) {
        const errorData = await geminiResponse.json().catch(() => null);
        return res.status(400).json({
          success: false,
          error: 'Invalid request',
          message: errorData?.error?.message || 'The request provided cannot be processed. Please check your input and try again.'
        });
      } else {
        return res.status(500).json({
          success: false,
          error: 'External service error',
          message: 'Chat service is temporarily unavailable. Please try again later.'
        });
      }
    }

    const geminiData = await geminiResponse.json();

    // Extract response from Gemini
    if (!geminiData.candidates || 
        !geminiData.candidates[0] || 
        !geminiData.candidates[0].content || 
        !geminiData.candidates[0].content.parts || 
        !geminiData.candidates[0].content.parts[0]) {
      console.error('Unexpected Gemini response structure:', JSON.stringify(geminiData, null, 2));
      return res.status(500).json({
        success: false,
        error: 'Chat error',
        message: 'Chat service returned an unexpected response. Please try again.'
      });
    }

    const candidate = geminiData.candidates[0];
    let response = '';
    let thoughts = '';

    // Check for thinking mode response
    if (enableThinking && candidate.content.parts) {
      for (const part of candidate.content.parts) {
        if (part.thought) {
          thoughts += part.text || '';
        } else if (part.text) {
          response += part.text;
        }
      }
      
      if (thoughts || response) {
        return res.json({
          success: true,
          response: response.trim(),
          thoughts: thoughts.trim(),
          isThinking: true,
          model: model
        });
      }
    }

    // Regular response processing
    response = candidate.content.parts[0].text || '';

    if (!response.trim()) {
      return res.status(500).json({
        success: false,
        error: 'Empty response',
        message: 'Chat service returned an empty result. Please try again with different input.'
      });
    }

    return res.json({
      success: true,
      response: response.trim(),
      isThinking: false,
      model: model
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        return res.status(500).json({
          success: false,
          error: 'Network error',
          message: 'Unable to connect to chat service. Please check your internet connection and try again.'
        });
      }    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred. Please try again later.'
    });
  }
};

export default handler;
