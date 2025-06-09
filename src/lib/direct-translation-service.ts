/**
 * Direct Gemini Translation Service
 * Bypasses backend issues by calling Gemini API directly from frontend
 * This is a temporary solution until API deployment issues are resolved
 */

export interface DirectTranslationRequest {
  text: string;
  targetLanguage?: string;
  sourceLanguage?: string;
}

export interface DirectTranslationResponse {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  originalText: string;
  timestamp: string;
}

// IMPORTANT: In production, this should be moved to a secure backend
// This is a temporary client-side solution
const GEMINI_API_KEY = 'AIzaSyDcGWQ6aRGPO8rLw8X6V6F6CJKx6CcfKzU'; // Replace with your actual key

export class DirectTranslationService {
  /**
   * Translate text directly using Gemini API
   */
  static async translate(request: DirectTranslationRequest): Promise<DirectTranslationResponse> {
    console.log('[DIRECT TRANSLATION] Request:', request);
    
    const { text, targetLanguage = 'Filipino', sourceLanguage = 'auto' } = request;
    
    if (!text || !text.trim()) {
      throw new Error('Text is required for translation');
    }

    if (text.trim().length > 5000) {
      throw new Error('Text is too long for translation (max 5000 characters)');
    }

    try {
      // Construct translation prompt
      const sourceText = sourceLanguage === 'auto' 
        ? `Detect the language and translate the following text to ${targetLanguage}:`
        : `Translate the following text from ${sourceLanguage} to ${targetLanguage}:`;

      const prompt = `${sourceText}\n\n"${text.trim()}"\n\nProvide only the translation without any additional explanation or formatting.`;

      console.log('[DIRECT TRANSLATION] Calling Gemini API...');

      // Call Gemini API directly
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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

      if (!response.ok) {
        console.error('[DIRECT TRANSLATION] API Error:', response.status, response.statusText);
        
        let errorMessage = `Translation failed: ${response.status} ${response.statusText}`;
        
        if (response.status === 429) {
          errorMessage = 'Translation service is temporarily overloaded. Please try again in a few moments.';
        } else if (response.status === 401) {
          errorMessage = 'Translation service authentication failed. Please check configuration.';
        } else if (response.status === 403) {
          errorMessage = 'Translation service access denied. Please check your permissions.';
        } else if (response.status >= 500) {
          errorMessage = 'Translation service is temporarily unavailable. Please try again later.';
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('[DIRECT TRANSLATION] Gemini response:', data);

      // Extract translation from Gemini response
      if (!data.candidates || 
          !data.candidates[0] || 
          !data.candidates[0].content || 
          !data.candidates[0].content.parts || 
          !data.candidates[0].content.parts[0]) {
        console.error('[DIRECT TRANSLATION] Unexpected response structure:', data);
        throw new Error('Unable to process translation. Please try again.');
      }

      const translatedText = data.candidates[0].content.parts[0].text || '';

      if (!translatedText.trim()) {
        throw new Error('Translation service returned empty result. Please try again.');
      }

      const result: DirectTranslationResponse = {
        translatedText: translatedText.trim(),
        sourceLanguage: sourceLanguage,
        targetLanguage: targetLanguage,
        originalText: text.trim(),
        timestamp: new Date().toISOString()
      };

      console.log('[DIRECT TRANSLATION] Success:', result);
      return result;

    } catch (error) {
      console.error('[DIRECT TRANSLATION] Error:', error);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('An unexpected error occurred during translation');
    }
  }
}

// Export for easy import
export const { translate } = DirectTranslationService;
