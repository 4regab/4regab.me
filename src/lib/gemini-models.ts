import { GeminiModel } from '@/types/helper';

/**
 * Available Gemini models for the Helper tool
 * Google grounding search availability varies by model
 */
export const GEMINI_MODELS: GeminiModel[] = [
  {
    id: 'gemini-2.5-flash-preview',
    name: 'Gemini 2.5 Flash Preview 05-20',
    description: 'Latest preview model with enhanced capabilities and speed',
    modelName: 'gemini-2.5-flash-preview-05-20',
    isDefault: true,
    supportsGrounding: true,
    supportsVision: true,
    provider: 'google',
  },  {
    id: 'gemini-2.0-flash-image-generation',
    name: 'Gemini 2.0 Flash Image Generation',
    description: 'Advanced model with image generation capabilities. Supports text-to-image and image editing with multimodal input/output. Note: Does not support web search/grounding.',
    modelName: 'gemini-2.0-flash-preview-image-generation',
    isDefault: false,
    supportsGrounding: false,
    supportsVision: true,
    supportsImageGeneration: true,
    provider: 'google',
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    description: 'High-performance model with balanced speed and accuracy',
    modelName: 'gemini-2.0-flash',
    isDefault: false,
    supportsGrounding: true,
    supportsVision: true,
    provider: 'google',
  },
  {
    id: 'gemini-2.0-flash-lite',
    name: 'Gemini 2.0 Flash-Lite',
    description: 'Lightweight model optimized for speed and efficiency',
    modelName: 'gemini-2.0-flash-lite',
    isDefault: false,
    supportsGrounding: true,    supportsVision: true,
    provider: 'google',
  },
  
  // OpenRouter vision-capable models
  {
    id: 'internvl3-14b-free',
    name: 'InternVL3 14B ⚡ Vision',
    description: 'OpenGVLab InternVL3 14B vision-language model via OpenRouter. Supports images and text. Note: Does not support web search.',
    modelName: 'opengvlab/internvl3-14b:free',
    isDefault: false,
    supportsGrounding: false,
    supportsVision: true,
    provider: 'openrouter',
    apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
  },
  // OpenRouter text-only models 
  {
    id: 'qwen3-32b-free',
    name: 'Qwen 3 32B 📝 Text Only',
    description: 'Qwen 3 32B text-only model via OpenRouter. Note: Does not support images or web search.',
    modelName: 'qwen/qwen3-32b:free',
    isDefault: false,
    supportsGrounding: false,
    supportsVision: false,
    provider: 'openrouter',
    apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
  },
  {
    id: 'deepseek-v3-base-free',
    name: 'DeepSeek V3 Base 📝 Text Only',
    description: 'DeepSeek V3 Base text-only model via OpenRouter. Note: Does not support images or web search.',
    modelName: 'deepseek/deepseek-v3-base:free',
    isDefault: false,
    supportsGrounding: false,
    supportsVision: false,
    provider: 'openrouter',
    apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
  },
  {
    id: 'deepcoder-14b-preview-free',
    name: 'DeepCoder 14B Preview 📝 Text Only',
    description: 'Agentica DeepCoder 14B Preview text-only model via OpenRouter. Note: Does not support images or web search.',
    modelName: 'agentica-org/deepcoder-14b-preview:free',
    isDefault: false,
    supportsGrounding: false,
    supportsVision: false,
    provider: 'openrouter',
    apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
  },
  {
    id: 'deepseek-r1-0528-free',
    name: 'DeepSeek R1 0528 📝 Text Only',
    description: 'DeepSeek R1 0528 text-only model via OpenRouter. Note: Does not support images or web search.',
    modelName: 'deepseek/deepseek-r1-0528:free',
    isDefault: false,
    supportsGrounding: false,
    supportsVision: false,
    provider: 'openrouter',
    apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
  },
  {
    id: 'devstral-small-free',
    name: 'Devstral Small 📝 Text Only',
    description: 'Mistral AI Devstral Small text-only model via OpenRouter. Note: Does not support images or web search.',
    modelName: 'mistralai/devstral-small:free',
    isDefault: false,
    supportsGrounding: false,
    supportsVision: false,
    provider: 'openrouter',
    apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
  },
  {
    id: 'deepseek-prover-v2-free',
    name: 'DeepSeek Prover V2 📝 Text Only',
    description: 'DeepSeek Prover V2 text-only model via OpenRouter. Note: Does not support images or web search.',
    modelName: 'deepseek/deepseek-prover-v2:free',
    isDefault: false,
    supportsGrounding: false,
    supportsVision: false,
    provider: 'openrouter',
    apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
  },
  {
    id: 'deepseek-r1t-chimera-free',
    name: 'DeepSeek R1T Chimera 📝 Text Only',
    description: 'TNG Tech DeepSeek R1T Chimera text-only model via OpenRouter. Note: Does not support images or web search.',
    modelName: 'tngtech/deepseek-r1t-chimera:free',
    isDefault: false,
    supportsGrounding: false,
    supportsVision: false,
    provider: 'openrouter',
    apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
  },
  {
    id: 'mai-ds-r1-free',
    name: 'MAI DS R1 📝 Text Only',
    description: 'Microsoft MAI DS R1 text-only model via OpenRouter. Note: Does not support images or web search.',
    modelName: 'microsoft/mai-ds-r1:free',
    isDefault: false,
    supportsGrounding: false,
    supportsVision: false,
    provider: 'openrouter',
    apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
  },
  {
    id: 'sarvam-m-free',
    name: 'Sarvam M 📝 Text Only',
    description: 'Sarva AI Sarvam M text-only model via OpenRouter. Note: Does not support images or web search.',
    modelName: 'sarvamai/sarvam-m:free',
    isDefault: false,
    supportsGrounding: false,
    supportsVision: false,
    provider: 'openrouter',
    apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
  },  {
    id: 'llama-3.1-nemotron-ultra-253b-free',
    name: 'Llama 3.1 Nemotron Ultra 253B 📝 Text Only',
    description: 'NVIDIA Llama 3.1 Nemotron Ultra 253B text-only model via OpenRouter. Note: Does not support images or web search.',
    modelName: 'nvidia/llama-3.1-nemotron-ultra-253b-v1:free',
    isDefault: false,
    supportsGrounding: false,
    supportsVision: false,
    provider: 'openrouter',
    apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
  },
  {
    id: 'llama-3.3-nemotron-super-49b-free',
    name: 'Llama 3.3 Nemotron Super 49B 📝 Text Only',
    description: 'NVIDIA Llama 3.3 Nemotron Super 49B text-only model via OpenRouter. Note: Does not support images or web search.',
    modelName: 'nvidia/llama-3.3-nemotron-super-49b-v1:free',
    isDefault: false,
    supportsGrounding: false,
    supportsVision: false,
    provider: 'openrouter',
    apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
  },
  {
    id: 'qwen3-235b-a22b-free',
    name: 'Qwen 3 235B A22B 📝 Text Only',
    description: 'Qwen 3 235B A22B text-only model via OpenRouter. Note: Does not support images or web search.',
    modelName: 'qwen/qwen3-235b-a22b:free',
    isDefault: false,
    supportsGrounding: false,
    supportsVision: false,
    provider: 'openrouter',
    apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
  },
  {
    id: 'deepseek-r1-0528-qwen3-8b-free',
    name: 'DeepSeek R1 0528 Qwen3 8B 📝 Text Only',
    description: 'DeepSeek R1 0528 Qwen3 8B text-only model via OpenRouter. Note: Does not support images or web search.',
    modelName: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
    isDefault: false,
    supportsGrounding: false,
    supportsVision: false,    provider: 'openrouter',
    apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
  },
];

/**
 * Get the default model
 */
export function getDefaultModel(): GeminiModel {
  return GEMINI_MODELS.find(model => model.isDefault) || GEMINI_MODELS[0];
}

/**
 * Get model by ID
 */
export function getModelById(id: string): GeminiModel | undefined {
  return GEMINI_MODELS.find(model => model.id === id);
}

/**
 * Get model configuration for Google Generative AI or OpenRouter
 */
export function getModelConfig(model: GeminiModel) {
  // OpenRouter models don't use the same config structure
  if (model.provider === 'openrouter') {
    return {
      model: model.modelName,
      provider: 'openrouter',
      apiUrl: model.apiUrl,
    };
  }

  // Google Gemini models configuration
  const config: any = {
    model: model.modelName,
  };  // Enable Google Search grounding for all supported models (except image generation models)
  if (model.supportsGrounding && !model.supportsImageGeneration) {
    // For Gemini 2.0+ models (including 2.5), use googleSearch tool
    if (model.modelName.includes('2.0') || model.modelName.includes('2.5')) {
      config.tools = [
        {
          googleSearch: {}
        }
      ];
    } else {
      // Fallback for other models - use Google Search retrieval
      config.tools = [
        {
          googleSearchRetrieval: {
            dynamicRetrievalConfig: {
              mode: 'MODE_DYNAMIC',
              dynamicThreshold: 0.3 // Lower threshold = more grounding
            }
          }
        }
      ];
    }
  }

  // Configure image generation for supported models
  if (model.supportsImageGeneration) {
    config.generationConfig = {
      ...config.generationConfig,
      responseModalities: ["TEXT", "IMAGE"]
    };
  }

  console.log(`Model ${model.name} (${model.modelName}) configuration:`, JSON.stringify(config, null, 2));
  return config;
}
