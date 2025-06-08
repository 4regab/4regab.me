import { GeminiModel } from '@/types/helper';
/**
 * Available Gemini models for the Helper tool
 * Google grounding search availability varies by model
 */
export declare const GEMINI_MODELS: GeminiModel[];
/**
 * Get the default model
 */
export declare function getDefaultModel(): GeminiModel;
/**
 * Get model by ID
 */
export declare function getModelById(id: string): GeminiModel | undefined;
/**
 * Get model configuration for Google Generative AI or OpenRouter
 */
export declare function getModelConfig(model: GeminiModel): any;
