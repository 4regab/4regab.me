/**
 * API Configuration for 4regab.me
 * Handles backend API endpoints for Render deployment
 */

// Backend API Base URLs
const BACKEND_URLS = {
  development: 'http://localhost:3000',
  production: 'https://4regab-ai-backend.onrender.com', // Update this with your actual Render URL
} as const;

// Get the current environment
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const environment = isDevelopment ? 'development' : 'production';

// Current backend URL
export const API_BASE_URL = BACKEND_URLS[environment];

// API Endpoints
export const API_ENDPOINTS = {
  HEALTH: `${API_BASE_URL}/api/health`,
  TRANSLATE: `${API_BASE_URL}/api/translate`,
  CHAT: `${API_BASE_URL}/api/chat`,
  TTS: `${API_BASE_URL}/api/tts`,
} as const;

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

    clearTimeout(timeoutId);    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as Record<string, unknown>;
      throw new Error(
        (errorData.message as string) || 
        (errorData.error as string) || 
        `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return await response.text() as T;
  } catch (error) {
    clearTimeout(timeoutId);
    
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
