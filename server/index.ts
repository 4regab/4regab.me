import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import rateLimit from 'express-rate-limit';

// For ES modules compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting middleware
const translateRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute per IP
  message: {
    success: false,
    error: 'Rate limit exceeded',
    message: 'Too many translation requests. Please try again later.',
    resetIn: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://4regab.me', 'https://www.4regab.me'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from the React app build
app.use(express.static(path.join(__dirname, '../../dist')));

// System prompt for translation
const SYSTEM_PROMPT = `You are "Tagasalin Maestro," a world-class, expert Filipino translator and linguist. You are a native speaker of both contemporary English and Filipino (Tagalog). Your defining skill is your ability to produce translations that are not just technically correct but also culturally resonant, contextually appropriate, and feel as if they were originally written in Filipino. You think and translate based on meaning and intent, not just words.

Core Objective
Translate the given English text into clear, accurate, and natural-sounding Filipino. The final output must embody the CAN Model: Clear (Malinaw), Accurate (Wasto), and Natural (Natural ang Daloy).

Guidelines for Translation:
1. **Contextual Understanding**: Analyze the full context, purpose, and intended audience of the text before translating.
2. **Cultural Adaptation**: Ensure the translation respects Filipino cultural nuances, values, and communication styles.
3. **Register Appropriateness**: Match the formality level, tone, and register of the original text (formal, casual, academic, technical, etc.).
4. **Natural Flow**: Produce translations that sound natural to Filipino speakers, avoiding literal word-for-word translations.
5. **Meaning Preservation**: Maintain the original meaning, intent, and emotional tone while adapting to Filipino linguistic patterns.
6. **Modern Filipino**: Use contemporary Filipino/Tagalog that reflects current usage while respecting traditional forms when appropriate.
7. **Technical Terms**: For specialized terminology, use established Filipino translations when available, or provide clear adaptations with context.
8. **Idiomatic Expression**: Transform English idioms and expressions into equivalent Filipino expressions that convey the same meaning and impact.

Translation Process:
1. First, understand the complete meaning and context of the English text
2. Identify key concepts, cultural references, and stylistic elements
3. Create a Filipino version that captures the essence while sounding natural
4. Ensure the translation flows smoothly and maintains the original's impact
5. Review for accuracy, naturalness, and cultural appropriateness

Return only the Filipino translation without explanations, notes, or additional comments unless specifically requested otherwise.`;

// Translation API endpoint
app.post('/api/translate', translateRateLimit, async (req, res) => {
  try {
    const { text } = req.body;

    // Validation
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid input',
        message: 'Text is required and must be a string'
      });
    }

    if (text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Empty input',
        message: 'Text cannot be empty'
      });
    }

    if (text.length > 5000) {
      return res.status(400).json({
        success: false,
        error: 'Text too long',
        message: 'Text must be less than 5000 characters'
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

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: SYSTEM_PROMPT },
                { text: `Translate this English text to Filipino: "${text}"` }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
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
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', geminiResponse.status, errorText);
      
      if (geminiResponse.status === 429) {
        return res.status(429).json({
          success: false,
          error: 'Rate limit exceeded',
          message: 'Translation service is temporarily overloaded. Please try again in a few moments.',
          resetIn: 60
        });
      } else if (geminiResponse.status === 400) {
        return res.status(400).json({
          success: false,
          error: 'Invalid request',
          message: 'The text provided cannot be translated. Please check your input and try again.'
        });
      } else {
        return res.status(500).json({
          success: false,
          error: 'External service error',
          message: 'Translation service is temporarily unavailable. Please try again later.'
        });
      }
    }

    const geminiData = await geminiResponse.json();

    // Extract translation from Gemini response
    if (!geminiData.candidates || 
        !geminiData.candidates[0] || 
        !geminiData.candidates[0].content || 
        !geminiData.candidates[0].content.parts || 
        !geminiData.candidates[0].content.parts[0] ||
        !geminiData.candidates[0].content.parts[0].text) {
      console.error('Unexpected Gemini response structure:', JSON.stringify(geminiData, null, 2));
      return res.status(500).json({
        success: false,
        error: 'Translation error',
        message: 'Translation service returned an unexpected response. Please try again.'
      });
    }

    const translation = geminiData.candidates[0].content.parts[0].text.trim();

    if (!translation) {
      return res.status(500).json({
        success: false,
        error: 'Empty translation',
        message: 'Translation service returned an empty result. Please try again with different text.'
      });
    }

    return res.json({
      success: true,
      translation: translation,
      originalText: text
    });

  } catch (error) {
    console.error('Translation API error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        return res.status(500).json({
          success: false,
          error: 'Network error',
          message: 'Unable to connect to translation service. Please check your internet connection and try again.'
        });
      }
    }
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred. Please try again later.'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Translation API is running',
    timestamp: new Date().toISOString()
  });
});

// Catch all handler: send back React's index.html file for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

// Error handling middleware
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Translation API: http://localhost:${PORT}/api/translate`);
});
