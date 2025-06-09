import type { VercelRequest, VercelResponse } from '@vercel/node';

// Rate limiting map (in production, consider using Redis or database)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? String(forwarded).split(',')[0] : req.socket?.remoteAddress || 'unknown';
  return `file_upload_${ip}`;
}

function checkRateLimit(req: VercelRequest): { allowed: boolean; resetIn?: number } {
  const key = getRateLimitKey(req);
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 10; // 10 file uploads per minute

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
      message: 'Too many file upload requests. Please try again later.',
      resetIn: rateLimitCheck.resetIn
    });
  }

  try {
    // Check for API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY not configured');
      return res.status(500).json({
        success: false,
        error: 'Service configuration error',
        message: 'File upload service is not properly configured'
      });
    }

    // Parse multipart form data (basic implementation)
    // In production, consider using a proper multipart parser like 'formidable'
    const contentType = req.headers['content-type'] || '';
    
    if (!contentType.includes('multipart/form-data')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid content type',
        message: 'File upload requires multipart/form-data'
      });
    }

    // For now, return a placeholder response indicating the service is ready
    // Actual file upload implementation would require proper multipart parsing
    return res.status(501).json({
      success: false,
      error: 'Not implemented',
      message: 'File upload endpoint is prepared but multipart parsing is not yet implemented. Use BackendService.uploadFile() for chat functionality.'
    });

  } catch (error) {
    console.error('File upload error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred during file upload'
    });
  }
};

export default handler;
