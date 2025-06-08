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
