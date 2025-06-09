/**
 * Secure Translation Service
 * Uses secure backend serverless functions to handle all Gemini API calls
 * Never exposes API keys to the frontend
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

/**
 * Secure translation service that proxies all requests through backend serverless functions
 * All API keys are kept secure on the backend and never exposed to the frontend
 */
export class DirectTranslationService {
  /**
   * Translate text using secure backend API
   * @param request Translation request parameters
   * @returns Promise with translation response
   */
  static async translate(request: DirectTranslationRequest): Promise<DirectTranslationResponse> {
    console.log('[SECURE TRANSLATION] Request:', request);
    
    const { text, targetLanguage = 'Filipino', sourceLanguage = 'auto' } = request;
    
    // Validate input
    if (!text || !text.trim()) {
      throw new Error('Text is required for translation');
    }

    if (text.trim().length > 5000) {
      throw new Error('Text is too long for translation (max 5000 characters)');
    }
    
    try {
      // Call our secure serverless function instead of direct API call
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          targetLanguage,
          sourceLanguage
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle specific error types
        if (response.status === 429) {
          throw new Error('Translation service is temporarily overloaded. Please try again in a few moments.');
        } else if (response.status === 401) {
          throw new Error('Translation service authentication failed. Please check configuration.');
        } else if (response.status === 403) {
          throw new Error('Translation service access denied. Please check your permissions.');
        } else if (response.status >= 500) {
          throw new Error('Translation service is temporarily unavailable. Please try again later.');
        }
        
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Translation failed');
      }      // Extract the translation result
      const translatedText = data.translatedText || '';
      
      if (!translatedText.trim()) {
        throw new Error('Translation service returned empty result. Please try again.');
      }

      const result: DirectTranslationResponse = {
        translatedText: translatedText.trim(),
        sourceLanguage: data.sourceLanguage || sourceLanguage,
        targetLanguage: data.targetLanguage || targetLanguage,
        originalText: data.originalText || text.trim(),
        timestamp: new Date().toISOString()
      };

      console.log('[SECURE TRANSLATION] Success:', result);
      return result;

    } catch (error) {
      console.error('[SECURE TRANSLATION] Error:', error);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('An unexpected error occurred during translation');
    }
  }
}

// Export for easy import
export const { translate } = DirectTranslationService;
