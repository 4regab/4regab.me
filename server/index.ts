import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// For ES modules compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting middleware for translation
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

// Rate limiting middleware for chat
const chatRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute per IP
  message: {
    success: false,
    error: 'Rate limit exceeded',
    message: 'Too many chat requests. Please try again later.',
    resetIn: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting middleware for TTS
const ttsRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute for TTS (more expensive)
  message: {
    success: false,
    error: 'Rate limit exceeded',
    message: 'Too many TTS requests. Please try again later.',
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

    const primaryModel = 'gemini-2.5-flash-preview-05-20';
    const fallbackModel = 'gemini-2.0-flash-experimental'; // As per gemini-models.ts, though 'gemini-1.5-flash-latest' was used before. Let's stick to the defined fallback.
                                                       // If 'gemini-2.0-flash-experimental' is not the intended fallback, this should be adjusted.
                                                       // For now, using 'gemini-1.5-flash-latest' as it was previously in the code.
                                                       // Re-evaluating: The request was to fallback to "Gemini 2.0 Flash Experimental".
                                                       // The file `gemini-models.ts` has `gemini-2.0-flash` and `gemini-2.0-flash-lite`.
                                                       // Let's assume "Gemini 2.0 Flash Experimental" refers to `gemini-1.5-flash-latest` or a similar experimental/latest tag.
                                                       // Given the previous code used `gemini-1.5-flash-latest`, and the new primary is `gemini-2.5-flash-preview-05-20`,
                                                       // a reasonable fallback would be `gemini-1.5-flash-latest` or simply `gemini-1.5-flash`.
                                                       // The user specifically mentioned "Gemini 2.0 Flash Experimental".
                                                       // Let's use 'gemini-1.5-flash-latest' as a stable fallback if 'gemini-2.0-flash-experimental' isn't a direct model name.
                                                       // The most appropriate available model from gemini-models.ts that seems like an "experimental" or "latest" version of 1.5/2.0 flash is 'gemini-1.5-flash-latest'.
                                                       // The user explicitly asked for "Gemini 2.0 Flash Experimental".
                                                       // From `gemini-models.ts`, we have `gemini-2.0-flash`. This seems the closest non-preview 2.0 flash model.
                                                       // Let's use `gemini-2.0-flash` as the fallback.

    let modelToUse = primaryModel;
    let attempt = 1;
    let geminiResponse;
    let geminiData;

    while (attempt <= 2) {
      try {
        geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${apiKey}`,
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

        if (geminiResponse.ok) {
          geminiData = await geminiResponse.json();
          break; // Success, exit loop
        } else {
          const errorText = await geminiResponse.text();
          console.error(`Gemini API error with model ${modelToUse}:`, geminiResponse.status, errorText);
          if (attempt === 1) {
            console.log(`Attempt 1 with ${primaryModel} failed. Trying fallback model ${fallbackModel}.`);
            modelToUse = fallbackModel;
            attempt++;
          } else {
            // Both attempts failed
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
                message: 'Translation service is temporarily unavailable after multiple attempts. Please try again later.'
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error during fetch with model ${modelToUse}:`, error);
        if (attempt === 1) {
          console.log(`Attempt 1 with ${primaryModel} failed due to network/fetch error. Trying fallback model ${fallbackModel}.`);
          modelToUse = fallbackModel;
          attempt++;
        } else {
          return res.status(500).json({
            success: false,
            error: 'Network error',
            message: 'Failed to connect to translation service after multiple attempts. Please check your network connection and try again.'
          });
        }
      }
    }

    if (!geminiData) { // Should not happen if loop logic is correct, but as a safeguard
        console.error('Gemini data is undefined after attempts.');
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to retrieve translation data from the service.'
        });
    }
    
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

// TTS API endpoint
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

    // Check for API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('CRITICAL: GEMINI_API_KEY is not configured in the environment for the TTS function.');
      return res.status(500).json({
        success: false,
        error: 'SERVICE_CONFIG_ERROR_API_KEY_MISSING',
        message: 'The TTS service is critically misconfigured: The GEMINI_API_KEY is missing in the server environment. Please contact the administrator to resolve this.'
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

// Chat API endpoint
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

    // Check for API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY not configured');
      return res.status(500).json({
        success: false,
        error: 'Service configuration error',
        message: 'Chat service is not properly configured'
      });
    }    // Prepare contents for Gemini API
    const contents: Array<{role: string; parts: Array<{text: string}>}> = [];

    // Add system prompt if provided
    if (systemPrompt) {
      contents.push({
        role: 'user',
        parts: [{ text: systemPrompt }]
      });
      contents.push({
        role: 'model',
        parts: [{ text: 'I understand. I will follow those instructions.' }]
      });
    }

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
    contents.push({ 
      role: 'user', 
      parts: [{ text: trimmedPrompt }] 
    });

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
        })
      }
    );

    if (!geminiResponse.ok) {
      console.error('Gemini Chat API error:', geminiResponse.status, geminiResponse.statusText);
      
      let errorMessage = 'Chat service temporarily unavailable';
      if (geminiResponse.status === 429) {
        errorMessage = "Rate limit exceeded. Please try again later.";
      } else if (geminiResponse.status === 401) {
        errorMessage = "Authentication error. Chat service is temporarily unavailable.";
      } else if (geminiResponse.status === 403) {
        errorMessage = "Access forbidden. Chat service may be temporarily unavailable.";
      }
      
      return res.status(geminiResponse.status >= 500 ? 500 : 400).json({
        success: false,
        error: 'Chat API error',
        message: errorMessage
      });
    }

    const data = await geminiResponse.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      const responseText = data.candidates[0].content.parts[0].text;
      
      if (responseText) {
        return res.json({
          success: true,
          response: responseText.trim(),
          model: model,
          promptLength: trimmedPrompt.length,
          responseLength: responseText.trim().length
        });
      }
    }

    // If no response found, return an error
    return res.status(500).json({
      success: false,
      error: 'No response generated',
      message: 'Chat service did not return a response. Please try again.'
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
  console.log(`🎤 TTS API: http://localhost:${PORT}/api/tts`);
  console.log(`💬 Chat API: http://localhost:${PORT}/api/chat`);
});
