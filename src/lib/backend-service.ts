/**
 * Backend Service for 4regab.me
 * Handles all API calls to the Render backend
 */

import { apiRequest, API_ENDPOINTS } from './api-config';

// DIAGNOSTIC LOGGING - Remove after fixing
const DEBUG_BACKEND = true;

function debugLog(message: string, data?: unknown) {
  if (DEBUG_BACKEND) {
    console.log(`[BACKEND DEBUG] ${message}`, data);
  }
}

export interface TranslationRequest {
  text: string;
  targetLanguage?: string;
  sourceLanguage?: string;
}

export interface TranslationResponse {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  originalText: string;
  timestamp: string;
}

export interface ChatRequest {
  message: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  model?: string;
  agent?: string;
}

export interface ChatResponse {
  reply: string;
  conversationId: string;
  timestamp: string;
}

export interface TTSRequest {
  text: string;
  voice?: string;
  rate?: number;
  pitch?: number;
}

export interface TTSResponse {
  message: string;
  clientSide: boolean;
  supportedVoices: string;
}

/**
 * Backend Service Class
 */
export class BackendService {  /**
   * Translate text using the backend API
   */
  static async translate(request: TranslationRequest): Promise<TranslationResponse> {
    debugLog('Translation request started:', request);
    
    try {
      const requestBody = {
        text: request.text,
        targetLanguage: request.targetLanguage || 'Filipino',
        sourceLanguage: request.sourceLanguage || 'auto'
      };
        debugLog('Sending translation request:', { 
        endpoint: API_ENDPOINTS.TRANSLATE, 
        body: requestBody 
      });
      
      // Call Vercel API function
      const response = await apiRequest<{
        success: boolean;
        translatedText: string;
        sourceLanguage: string;
        targetLanguage: string;
        originalText: string;
      }>(
        API_ENDPOINTS.TRANSLATE,
        {
          method: 'POST',
          body: JSON.stringify(requestBody)
        }
      );

      debugLog('Raw translation response:', response);

      // Response already matches expected interface from Vercel API
      const result = {
        translatedText: response.translatedText,
        sourceLanguage: response.sourceLanguage,
        targetLanguage: response.targetLanguage,
        originalText: response.originalText,
        timestamp: new Date().toISOString()
      };
      
      debugLog('Transformed translation result:', result);
      
      return result;
    } catch (error) {
      debugLog('Translation error occurred:', error);
      console.error('Translation error:', error);
      throw new Error(
        error instanceof Error 
          ? `Translation failed: ${error.message}`
          : 'Translation failed: Unknown error'
      );
    }
  }
  /**
   * Send chat message using the backend API
   */
  static async chat(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await apiRequest<{
        success: boolean;
        response: string;
        model: string;
        promptLength: number;
        responseLength: number;
      }>(
        API_ENDPOINTS.CHAT,
        {
          method: 'POST',
          body: JSON.stringify({
            prompt: request.message,
            conversationHistory: request.conversationHistory || [],
            model: request.model || 'gemini-1.5-flash',
            systemPrompt: request.agent ? `You are ${request.agent}. Please assist the user accordingly.` : undefined
          })
        }
      );      // Transform server response to match expected interface
      return {
        reply: response.response,
        conversationId: `chat_${Date.now()}`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Chat error:', error);
      throw new Error(
        error instanceof Error 
          ? `Chat failed: ${error.message}`
          : 'Chat failed: Unknown error'
      );
    }
  }

  /**
   * Get TTS information (handled client-side)
   */
  static async getTTSInfo(request: TTSRequest): Promise<TTSResponse> {
    try {
      const response = await apiRequest<TTSResponse>(
        API_ENDPOINTS.TTS,
        {
          method: 'POST',
          body: JSON.stringify(request)
        }
      );

      return response;
    } catch (error) {
      console.error('TTS error:', error);
      throw new Error(
        error instanceof Error 
          ? `TTS failed: ${error.message}`
          : 'TTS failed: Unknown error'
      );
    }
  }

  /**
   * Check backend health
   */
  static async checkHealth(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await apiRequest<{ status: string; timestamp: string }>(
        API_ENDPOINTS.HEALTH
      );

      return response;
    } catch (error) {
      console.error('Health check error:', error);
      throw new Error(
        error instanceof Error 
          ? `Health check failed: ${error.message}`
          : 'Health check failed: Unknown error'
      );
    }
  }
}

// Export individual functions for easier import
export const { translate, chat, getTTSInfo, checkHealth } = BackendService;
