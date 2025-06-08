import type { Content } from '@google/genai';
import { GeminiFile, GeminiModel } from '@/types/helper';
declare class GeminiService {
    private geminiApiKey;
    private openRouterApiKey;
    private client;
    private currentModel;
    /**
     * Initialize the service with API keys
     */
    initialize(geminiApiKey: string, openRouterApiKey?: string, model?: GeminiModel): void; /**
     * Initialize a specific model with grounding configuration
     */
    private initializeModel;
    /**
     * Set the current model
     */
    setModel(model: GeminiModel): void;
    /**
     * Get the current model
     */
    getCurrentModel(): GeminiModel;
    /**
     * Check if the service is initialized
     */
    isInitialized(): boolean;
    /**
     * Get the current Gemini API key (for validation purposes)
     */
    getGeminiApiKey(): string | null;
    /**
     * Get the current OpenRouter API key (for validation purposes)
     */
    getOpenRouterApiKey(): string | null;
    /**
     * Ensure the service is initialized before use
     */
    private ensureInitialized;
    /**
     * Ensure the correct API key is available for the current model
     */
    private ensureModelApiKey; /**
     * Upload a file to Gemini Files API
     */
    uploadFile(file: File): Promise<GeminiFile>;
    /**
     * Get file metadata
     */
    getFile(fileName: string): Promise<GeminiFile>;
    /**
     * Wait for file to be processed
     */
    waitForFileProcessing(fileName: string, maxAttempts?: number): Promise<GeminiFile>;
    /**
     * Delete a file
     */
    deleteFile(fileName: string): Promise<void>;
    /**
     * List all uploaded files
     */
    listFiles(): Promise<GeminiFile[]>; /**
     * Generate content with optional file attachments
     */
    generateContent(prompt: string, systemPrompt: string, files?: GeminiFile[], model?: GeminiModel, rawFiles?: File[], enableThinking?: boolean, abortSignal?: AbortSignal): Promise<string>;
    /**
     * Check if a file type is supported by Gemini
     */
    isSupportedFileType(file: File): boolean; /**
     * Generate content with conversation history
     */
    generateContentWithHistory(prompt: string, systemPrompt: string, conversationHistory: Content[], files?: GeminiFile[], model?: GeminiModel, rawFiles?: File[], enableThinking?: boolean, abortSignal?: AbortSignal): Promise<string>;
    /**
     * Generate content using OpenRouter API
     */
    private generateContentOpenRouter;
    /**
     * Format response with images for display
     */
    private formatResponseWithImages;
    /**
     * Fetch image from URI
     */
    private fetchImageFromUri;
    /**
     * Process image candidates for image generation models
     */ private processImageCandidates;
    /**
     * Process text candidates for regular text models
     */
    private processTextCandidates;
    /**
     * Check if the current model supports thinking mode
     */
    private supportsThinking;
    /**
     * Process response with thinking parts
     */
    private processThinkingResponse;
    /**
     * Check if a file is a video file
     */
    isVideoFile(file: File): boolean;
}
declare const _default: GeminiService;
export default _default;
