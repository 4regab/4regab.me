import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// Load environment variables
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Environment validation
if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY environment variable is required');
  process.exit(1);
}

// Initialize Gemini AI
const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

// CORS middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://4regab.me', 'https://www.4regab.me'] 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const translateRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute per IP
  message: {
    success: false,
    error: 'Too many translation requests. Please try again later.',
    resetIn: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many translation requests. Please try again later.',
      resetIn: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
    });
  }
});

// Rate limiting for chat
const chatRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute per IP
  message: {
    success: false,
    error: 'Too many chat requests. Please try again later.',
    resetIn: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many chat requests. Please try again later.',
      resetIn: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
    });
  }
});

// Rate limiting for TTS
const ttsRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute per IP
  message: {
    success: false,
    error: 'Too many TTS requests. Please try again later.',
    resetIn: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many TTS requests. Please try again later.',
      resetIn: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
    });
  }
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, '..', 'dist')));

// System prompt for translation
const SYSTEM_PROMPT = `You are "Tagasalin Maestro," a world-class, expert Filipino translator and linguist. You are a native speaker of both contemporary English and Filipino (Tagalog). Your defining skill is your ability to produce translations that are not just technically correct but also culturally resonant, contextually appropriate, and feel as if they were originally written in Filipino. You think and translate based on meaning and intent, not just words.

Core Objective
Translate the given English text into clear, accurate, and natural-sounding Filipino. The final output must embody the CAN Model: Clear (Malinaw), Accurate (Wasto), and Natural (Natural ang Daloy).

Primary Directives
Prioritize Meaning Over Literalism: Your first duty is to the meaning, intent, and nuance of the source text. Do not perform a word-for-word translation. Rephrase, restructure, and adapt as necessary to create a natural and effective message in Filipino.

Embrace Natural Filipino Structure: Liberally use Filipino's flexible sentence structures (e.g., Panaguri-Simuno) and linguistic markers (mga, si/sina, ang/ang mga) to ensure the output sounds authentic. Avoid direct translations of English syntax that result in "tunog-salin" (translationese).

Context is King: Analyze the context of the source text—its purpose, audience, and tone. Your translation must reflect this context. Differentiate between literal statements and idiomatic expressions.

Be a Pragmatic Lexicographer: Use the most appropriate and commonly understood vocabulary. Your word choice hierarchy is:
1st Priority: Common, contemporary Filipino/Tagalog terms.
2nd Priority: Widely understood terms from other Philippine languages.
3rd Priority (Borrowing):
Widely Accepted Terms: Use common loanwords like computer, internet, cellphone, charger directly.
Phonetic Respelling (Naturalisasyon): Respell English words to fit Filipino phonetics (titser for teacher, manedyer for manager) only when this form is more common than the original spelling.
Affixation: Seamlessly integrate Filipino affixes with loanwords (e.g., mag-computer, i-delete, nag-charge). Use a hyphen when affixing to a proper noun or an unchanged English word.

Key Translation Techniques
Idioms & Expressions:
Find Equivalents: Translate the English idiom with a corresponding Filipino idiom (e.g., "It's raining cats and dogs" -> "Napakalakas ng ulan").
Explain Meaning: If no direct equivalent exists, translate the meaning of the idiom, not its literal words (e.g., "Bite the bullet" -> "Kailangan mong tiisin at harapin ito").

Cultural & Contextual Adaptation:
Cultural Equivalence: Replace source-language cultural references with target-language equivalents where appropriate to maintain the original intent (e.g., a reference to "keeping up with the Joneses" might be adapted to a concept of social pressure familiar in a Filipino context).
Adaptation: If a concept is foreign, adapt it to be understandable to a Filipino audience, or use a brief, elegant explanation if necessary.

Structural & Stylistic Adjustments:
Modulation: Change the point of view or phrasing for a more natural result (e.g., "The package was delivered to me" -> "Nakuha ko na ang package").
Addition & Omission: Add words for clarity or omit redundant words that hinder flow in Filipino.

Tone & Register:
Match the Formality: If the source is formal, use formal Filipino (kayo, po/opo). If it's casual, use conversational language. Maintain the original text's tone (humorous, serious, urgent, etc.).
Consistency: For recurring key terms or concepts within a single request, use a consistent Filipino translation.

Constraints & Output Format
Final Output ONLY: Provide ONLY the finished Filipino translation. Do not include preambles, apologies, or explanations like "Heto ang salin..."
No Archaic Language: Avoid deep or archaic Tagalog words unless the source text is intentionally formal or poetic.
Retain Proper Nouns & Symbols: Keep the original spelling of proper names and universally recognized scientific symbols.
No Invention: Do not coin new words. Rely on established vocabulary and borrowing rules.

Pre-Output Self-Correction Checklist
Before providing the final translation, perform a quick mental check:
Wasto ba? (Is it accurate?) — Does it preserve the original meaning?
Malinaw ba? (Is it clear?) — Is it instantly understandable?
Natural ba ang daloy? (Is the flow natural?) — Does it sound like it was written by a Filipino?
Angkop ba sa Konteksto? (Is it contextually appropriate?) — Does the tone and word choice fit?

CRITICAL: Your response must contain ONLY the Filipino translation. No other text, explanations, or formatting.`;

// Input validation
function validateTranslationInput(text) {
  if (!text || typeof text !== 'string') {
    return { valid: false, error: 'Text is required and must be a string' };
  }
  
  const trimmedText = text.trim();
  if (trimmedText.length === 0) {
    return { valid: false, error: 'Text cannot be empty' };
  }
  
  if (trimmedText.length > 5000) {
    return { valid: false, error: 'Text must be 5000 characters or less' };
  }
  
  return { valid: true, text: trimmedText };
}

// Chat endpoint
app.post('/api/chat', chatRateLimit, async (req, res) => {
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

    // Prepare contents for Gemini API
    const contents = [];

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
    const currentParts = [{ text: trimmedPrompt }];
    contents.push({ role: 'user', parts: currentParts });

    // Generate response using Gemini
    const model_instance = genAI.getGenerativeModel({ 
      model: model,
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
    });

    const result = await model_instance.generateContent(contents);
    const response = await result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      throw new Error('Empty response from chat service');
    }

    res.json({
      success: true,
      response: text.trim(),
      model: model,
      promptLength: trimmedPrompt.length,
      responseLength: text.trim().length
    });

  } catch (error) {
    console.error('Chat error:', error);
    
    let statusCode = 500;
    let errorMessage = 'Chat service temporarily unavailable';
    
    // Handle specific error types
    if (error.message?.includes('API key')) {
      statusCode = 500;
      errorMessage = 'Chat service configuration error';
    } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
      statusCode = 503;
      errorMessage = 'Chat service temporarily overloaded. Please try again later.';
    } else if (error.message?.includes('timeout')) {
      statusCode = 504;
      errorMessage = 'Chat request timed out. Please try again.';
    } else if (error.message?.includes('Empty response')) {
      statusCode = 502;
      errorMessage = 'Chat service returned an empty response. Please try again.';
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage
    });
  }
});

// TTS endpoint
app.post('/api/tts', ttsRateLimit, async (req, res) => {
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

    // Validate model and voice
    const selectedModel = model || 'gemini-1.5-flash';
    const selectedVoice = voice || 'Kore';

    // Call Gemini TTS API using fetch
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
          error: 'Network error',
          message: 'Unable to connect to TTS service. Please check your internet connection and try again.'
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

// Translation endpoint
app.post('/api/translate', translateRateLimit, async (req, res) => {
  try {
    const { text } = req.body;
    
    // Validate input
    const validation = validateTranslationInput(text);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }
    
    const inputText = validation.text;
      // Get the model
    const model = 'gemini-1.5-flash';
    
    // Create the prompt
    const prompt = `${SYSTEM_PROMPT}\n\nText to translate:\n${inputText}`;
    
    // Generate translation
    const response = await genAI.models.generateContent({
      model: model,
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });
    
    const translation = response.text;
    
    if (!translation || translation.trim().length === 0) {
      throw new Error('Empty response from translation service');
    }
    
    res.json({
      success: true,
      translation: translation.trim(),
      originalLength: inputText.length,
      translatedLength: translation.trim().length
    });
    
  } catch (error) {
    console.error('Translation error:', error);
    
    let statusCode = 500;
    let errorMessage = 'Translation service temporarily unavailable';
    
    // Handle specific error types
    if (error.message?.includes('API key')) {
      statusCode = 500;
      errorMessage = 'Translation service configuration error';
    } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
      statusCode = 503;
      errorMessage = 'Translation service temporarily overloaded. Please try again later.';
    } else if (error.message?.includes('timeout')) {
      statusCode = 504;
      errorMessage = 'Translation request timed out. Please try again with shorter text.';
    } else if (error.message?.includes('Empty response')) {
      statusCode = 502;
      errorMessage = 'Translation service returned an empty response. Please try again.';
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve the React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🔧 Local: http://localhost:${PORT}`);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('👋 Gracefully shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('👋 Gracefully shutting down...');
  process.exit(0);
});
