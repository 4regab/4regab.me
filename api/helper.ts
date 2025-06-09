import type { VercelRequest, VercelResponse } from '@vercel/node';

// Rate limiting map (in production, consider using Redis or database)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? String(forwarded).split(',')[0] : req.socket?.remoteAddress || 'unknown';
  return `helper_${ip}`;
}

function checkRateLimit(req: VercelRequest): { allowed: boolean; resetIn?: number } {
  const key = getRateLimitKey(req);
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 25; // 25 requests per minute for helper

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

interface HelperRequest {
  query: string;
  context?: string;
  type: 'general' | 'code' | 'creative' | 'analysis';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
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

  // Rate limiting
  const rateCheck = checkRateLimit(req);
  if (!rateCheck.allowed) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests',
      message: `Rate limit exceeded. Try again in ${rateCheck.resetIn} seconds.`,
      retryAfter: rateCheck.resetIn
    });
  }

  try {
    // Validate environment variable
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY not configured');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error',
        message: 'API service temporarily unavailable'
      });
    }

    // Validate request body
    const { query, context, type = 'general' }: HelperRequest = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        message: 'Query is required and must be a non-empty string'
      });
    }

    if (query.length > 4000) {
      return res.status(400).json({
        success: false,
        error: 'Query too long',
        message: 'Query must be less than 4000 characters'
      });
    }

    // Build the helper prompt based on type
    let systemPrompt = '';
    switch (type) {
      case 'code':
        systemPrompt = 'You are an expert programming assistant. Provide clear, well-documented code solutions and explanations. Include best practices and potential pitfalls.';
        break;
      case 'creative':
        systemPrompt = 'You are a creative writing assistant. Help with brainstorming, storytelling, content creation, and creative projects. Be imaginative and inspiring.';
        break;
      case 'analysis':
        systemPrompt = 'You are an analytical assistant. Provide thorough analysis, break down complex topics, and offer structured insights with supporting evidence.';
        break;
      default:
        systemPrompt = 'You are a helpful AI assistant. Provide accurate, helpful, and well-structured responses to user queries.';
    }

    const fullPrompt = context 
      ? `${systemPrompt}\n\nContext: ${context}\n\nUser Query: ${query}`
      : `${systemPrompt}\n\nUser Query: ${query}`;

    // Call Gemini API securely
    const response = await fetch(
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
                  text: fullPrompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: type === 'creative' ? 0.8 : 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', errorText);
      
      if (response.status === 429) {
        return res.status(429).json({
          success: false,
          error: 'API rate limit exceeded',
          message: 'Service temporarily overloaded. Please try again in a moment.'
        });
      }
      
      return res.status(response.status).json({
        success: false,
        error: 'AI service error',
        message: 'Unable to process request at this time'
      });
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      return res.status(200).json({
        success: false,
        error: 'No response generated',
        message: 'The AI was unable to generate a response for this query'
      });
    }

    const aiResponse = data.candidates[0].content.parts[0].text;

    return res.status(200).json({
      success: true,
      data: {
        response: aiResponse,
        type: type,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Helper API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred while processing your request'
    });
  }
}
