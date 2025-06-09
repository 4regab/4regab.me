/**
 * API Configuration for 4regab.me
 * Handles backend API endpoints for Render deployment
 */

// DIAGNOSTIC LOGGING - Disabled while using direct translation service
const DEBUG_API = false;

function debugLog(message: string, data?: unknown) {
  if (DEBUG_API) {
    console.log(`[API DEBUG] ${message}`, data);
  }
}

// Use relative URLs to work with both development (via Vite proxy) and production (Vercel functions)
export const API_BASE_URL = '';

debugLog(`Using relative API URLs for Vercel functions`);

// API Endpoints - relative URLs that work with Vercel functions
export const API_ENDPOINTS = {
  HEALTH: `/api/health`,
  TRANSLATE: `/api/translate`,
  CHAT: `/api/chat`,
  TTS: `/api/tts`,
} as const;

debugLog('API Endpoints configured:', API_ENDPOINTS);

// Request timeout (30 seconds)
export const REQUEST_TIMEOUT = 30000;

// Default headers for API requests
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
} as const;

interface ApiResponse {
  status?: string;
  [key: string]: unknown;
}

/**
 * Enhanced fetch with timeout and error handling
 */
export async function apiRequest<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  debugLog(`Making API request to: ${url}`, { method: options.method || 'GET', headers: options.headers });
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...DEFAULT_HEADERS,
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    debugLog(`Response received:`, { 
      status: response.status, 
      statusText: response.statusText,
      url: response.url,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as Record<string, unknown>;
      
      debugLog(`API Error Response:`, { 
        status: response.status, 
        errorData,
        url 
      });
      
      throw new Error(
        (errorData.message as string) || 
        (errorData.error as string) || 
        `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const jsonResponse = await response.json();
      debugLog(`JSON Response:`, jsonResponse);
      return jsonResponse;
    }

    const textResponse = await response.text();
    debugLog(`Text Response:`, textResponse);
    return textResponse as T;
  } catch (error) {
    clearTimeout(timeoutId);
    
    debugLog(`API Request failed:`, { 
      error: error instanceof Error ? error.message : 'Unknown error',
      url,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please try again');
      }
      throw error;
    }
    
    throw new Error('An unexpected error occurred');
  }
}

/**
 * Test backend connectivity
 */
export async function testBackendConnection(): Promise<boolean> {
  try {
    const response = await apiRequest<ApiResponse>(API_ENDPOINTS.HEALTH);
    return response.status === 'ok';
  } catch (error) {
    console.error('Backend connection test failed:', error);
    return false;
  }
}

/**
 * Get backend status and info
 */
export async function getBackendStatus() {
  try {
    return await apiRequest(API_ENDPOINTS.HEALTH);
  } catch (error) {
    throw new Error(`Backend is unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
