import { GoogleGenAI } from '@google/genai';
import type { Content } from '@google/genai';
import { GeminiFile, GeminiModel } from '@/types/helper';
import { getDefaultModel, getModelConfig } from './gemini-models';

class GeminiService {
  private geminiApiKey: string | null = null;
  private openRouterApiKey: string | null = null;
  private client: GoogleGenAI | null = null;
  private currentModel: GeminiModel = getDefaultModel();
  /**
   * Initialize the service with API keys
   */
  initialize(geminiApiKey: string, openRouterApiKey?: string, model?: GeminiModel): void {
    if (!geminiApiKey || !geminiApiKey.trim()) {
      throw new Error('Gemini API key is required');
    }
    
    this.geminiApiKey = geminiApiKey.trim();
    this.openRouterApiKey = openRouterApiKey?.trim() || null;
    this.client = new GoogleGenAI({ apiKey: this.geminiApiKey });
    
    // Set the current model
    if (model) {
      this.currentModel = model;
    }
  }  /**
   * Initialize a specific model with grounding configuration
   */
  private initializeModel(model: GeminiModel): void {
    // OpenRouter models don't need Google AI initialization
    if (model.provider === 'openrouter') {
      console.log(`OpenRouter model ${model.name} ready for use`);
      return;
    }

    console.log(`Model ${model.name} configured for use with new GoogleGenAI client`);
  }

  /**
   * Set the current model
   */
  setModel(model: GeminiModel): void {
    this.currentModel = model;
    // Initialize the model if needed
    this.initializeModel(model);
  }

  /**
   * Get the current model
   */
  getCurrentModel(): GeminiModel {
    return this.currentModel;
  }

  /**
   * Check if the service is initialized
   */
  isInitialized(): boolean {
    return this.geminiApiKey !== null && this.client !== null;
  }

  /**
   * Get the current Gemini API key (for validation purposes)
   */
  getGeminiApiKey(): string | null {
    return this.geminiApiKey;
  }

  /**
   * Get the current OpenRouter API key (for validation purposes)
   */
  getOpenRouterApiKey(): string | null {
    return this.openRouterApiKey;
  }
  /**
   * Ensure the service is initialized before use
   */
  private ensureInitialized(): void {
    if (!this.geminiApiKey) {
      throw new Error('GeminiService not initialized. Please call initialize() with valid API keys first.');
    }
  }

  /**
   * Ensure the correct API key is available for the current model
   */
  private ensureModelApiKey(): void {
    if (this.currentModel.provider === 'openrouter') {
      if (!this.openRouterApiKey) {
        throw new Error('OpenRouter API key is required for OpenRouter models. Please configure it in the API settings.');
      }
    } else if (!this.geminiApiKey) {
      throw new Error('Gemini API key is required for Google models. Please configure it in the API settings.');
    }
  }/**
   * Upload a file to Gemini Files API
   */
  async uploadFile(file: File): Promise<GeminiFile> {
    this.ensureInitialized();
    
    try {
      console.log(`Starting upload for file: ${file.name}, size: ${file.size}, type: ${file.type}`);
      
      // Step 1: Start resumable upload
      const uploadMetadata = {
        file: {
          display_name: file.name,
        }
      };

      const startResponse = await fetch(`https://generativelanguage.googleapis.com/upload/v1beta/files?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'X-Goog-Upload-Protocol': 'resumable',
          'X-Goog-Upload-Command': 'start',
          'X-Goog-Upload-Header-Content-Length': file.size.toString(),
          'X-Goog-Upload-Header-Content-Type': file.type,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(uploadMetadata),
      });

      if (!startResponse.ok) {
        const errorText = await startResponse.text();
        console.error('Start upload failed:', startResponse.status, startResponse.statusText, errorText);
        throw new Error(`Failed to start upload: ${startResponse.status} ${startResponse.statusText}`);
      }

      const uploadUrl = startResponse.headers.get('X-Goog-Upload-URL');
      if (!uploadUrl) {
        console.error('No upload URL received in response headers');
        throw new Error('No upload URL received');
      }

      console.log('Upload URL received:', uploadUrl);

      // Step 2: Upload the file data
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Length': file.size.toString(),
          'X-Goog-Upload-Offset': '0',
          'X-Goog-Upload-Command': 'upload, finalize',
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('File upload failed:', uploadResponse.status, uploadResponse.statusText, errorText);
        throw new Error(`Failed to upload file: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }

      const result = await uploadResponse.json();
      console.log('Upload successful, received result:', result);

      // The result should contain the file data directly, not nested under "file"
      const fileData = result.file || result;
      
      if (!fileData.name) {
        console.error('Invalid file data received:', fileData);
        throw new Error('Invalid file data received from upload');
      }

      console.log('File uploaded successfully:', fileData.name);
      return fileData as GeminiFile;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  /**
   * Get file metadata
   */
  async getFile(fileName: string): Promise<GeminiFile> {
    this.ensureInitialized();
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/files/${fileName}?key=${this.geminiApiKey}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get file: ${response.statusText}`);
      }

      return await response.json() as GeminiFile;
    } catch (error) {
      console.error('Error getting file:', error);
      throw new Error(`Failed to get file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Wait for file to be processed
   */
  async waitForFileProcessing(fileName: string, maxAttempts: number = 30): Promise<GeminiFile> {
    for (let i = 0; i < maxAttempts; i++) {
      const file = await this.getFile(fileName);
      
      if (file.state === 'ACTIVE') {
        return file;
      }
      
      if (file.state === 'FAILED') {
        throw new Error('File processing failed');
      }
      
      // Wait 1 second before checking again
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    throw new Error('File processing timeout');
  }
  /**
   * Delete a file
   */
  async deleteFile(fileName: string): Promise<void> {
    this.ensureInitialized();
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/files/${fileName}?key=${this.geminiApiKey}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete file: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  /**
   * List all uploaded files
   */
  async listFiles(): Promise<GeminiFile[]> {
    this.ensureInitialized();
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/files?key=${this.geminiApiKey}`);
      
      if (!response.ok) {
        throw new Error(`Failed to list files: ${response.statusText}`);
      }

      const result = await response.json();
      return result.files || [] as GeminiFile[];
    } catch (error) {
      console.error('Error listing files:', error);
      throw new Error(`Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }  /**
   * Generate content with optional file attachments
   */  async generateContent(
    prompt: string,
    systemPrompt: string,
    files?: GeminiFile[],
    model?: GeminiModel,
    rawFiles?: File[],
    enableThinking?: boolean
  ): Promise<string> {
    this.ensureInitialized();
    
    try {
      // Set the model if specified
      if (model) {
        this.setModel(model);
      }

      const currentModel = model || this.currentModel;
      
      // Ensure we have the right API key for this model type
      this.ensureModelApiKey();      // Handle OpenRouter models
      if (currentModel.provider === 'openrouter') {
        return await this.generateContentOpenRouter(prompt, systemPrompt, currentModel, undefined, files, rawFiles);
      }
      
      // Clean the system prompt of any potential problematic characters
      const cleanedSystemPrompt = systemPrompt?.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim() || '';
        console.log('System instruction being sent:', {
        systemPrompt: cleanedSystemPrompt,
        length: cleanedSystemPrompt.length,
        hasSpecialChars: /[\u0000-\u001F\u007F-\u009F]/.test(systemPrompt || ''),
        modelSupportsImageGeneration: this.currentModel.supportsImageGeneration,
        willUseSystemInstruction: cleanedSystemPrompt && !this.currentModel.supportsImageGeneration
      });

      // Prepare the content array for the current message
      const contents: any[] = [];

      // Add files if provided
      if (files && files.length > 0) {
        for (const file of files) {
          // Ensure file is processed
          if (file.state !== 'ACTIVE') {
            await this.waitForFileProcessing(file.name);
          }
          
          contents.push({
            fileData: {
              fileUri: file.uri,
              mimeType: file.mimeType,
            },
          });
        }
      }

      // Combine system prompt with user prompt for a single message
      const combinedPrompt = cleanedSystemPrompt 
        ? `${cleanedSystemPrompt}\n\nUser: ${prompt}`
        : prompt;

      // Add the combined prompt
      contents.push({ text: combinedPrompt });      // Use the new GoogleGenAI client API
      if (!this.client) {
        throw new Error('GoogleGenAI client not initialized');
      }        const modelConfig = getModelConfig(this.currentModel);      // Prepare the request configuration
      const requestConfig: any = {
        model: this.currentModel.modelName,
        contents: [{ parts: contents }],
        config: {
          generationConfig: modelConfig.generationConfig,
          // Apply grounding tools if configured
          ...(modelConfig.tools && { tools: modelConfig.tools }),
          // Only include systemInstruction if the model supports it
          // Image generation models don't support system instructions
          ...(cleanedSystemPrompt && !this.currentModel.supportsImageGeneration && { systemInstruction: cleanedSystemPrompt }),
          // For image generation models, specify response modalities
          ...(this.currentModel.supportsImageGeneration && {
            responseModalities: ["TEXT", "IMAGE"]
          }),
          // Add thinking configuration if enabled and supported
          ...(enableThinking && this.supportsThinking(this.currentModel) && {
            thinkingConfig: {
              includeThoughts: true
            }
          })
        }
      };      console.log('Request configuration:', {
        modelName: this.currentModel.modelName,
        supportsImageGeneration: this.currentModel.supportsImageGeneration,
        supportsGrounding: this.currentModel.supportsGrounding,
        supportsThinking: this.supportsThinking(this.currentModel),
        enableThinking: enableThinking,
        hasTools: !!requestConfig.config.tools,
        tools: requestConfig.config.tools,
        hasSystemInstruction: !!requestConfig.config.systemInstruction,
        hasResponseModalities: !!requestConfig.config.responseModalities,
        hasThinkingConfig: !!requestConfig.config.thinkingConfig,        responseModalities: requestConfig.config.responseModalities
      });// Use different API methods based on model capabilities
      let response;      if (this.currentModel.supportsImageGeneration) {
        // For image generation models, use the requestConfig that already has correct responseModalities
        console.log('🔍 IMAGE GENERATION REQUEST:', JSON.stringify(requestConfig, null, 2));
        response = await this.client.models.generateContent(requestConfig);
      } else {
        // For regular text models, use generateContent method  
        response = await this.client.models.generateContent(requestConfig);
      }

      console.log('=== DEBUGGING RESPONSE ===');
      console.log('Full response object:', response);
      console.log('Response constructor:', response.constructor.name);
      console.log('Response keys:', Object.keys(response));
      
      // Try to access response.text directly first
      console.log('Direct response.text:', response.text);
      console.log('Response.text type:', typeof response.text);
      
      // Check different possible response formats using any casting for debugging
      const responseAny = response as any;
      console.log('Has response.response?', !!responseAny.response);
      console.log('Has response.candidates?', !!response.candidates);
      console.log('Has response.content?', !!responseAny.content);
      console.log('Has response.data?', !!responseAny.data);
      
      // Check for dedicated image generation response format
      console.log('Has response.generatedImages?', !!responseAny.generatedImages);
      if (responseAny.generatedImages) {
        console.log('Generated images:', responseAny.generatedImages);
        console.log('Generated images length:', responseAny.generatedImages.length);
        if (responseAny.generatedImages[0]) {
          console.log('First generated image:', responseAny.generatedImages[0]);
          console.log('First generated image keys:', Object.keys(responseAny.generatedImages[0]));
          if (responseAny.generatedImages[0].image) {
            console.log('Image object:', responseAny.generatedImages[0].image);
            console.log('Image object keys:', Object.keys(responseAny.generatedImages[0].image));
          }
        }
      }
      
      if (response.candidates) {
        console.log('Candidates structure:', response.candidates);
        console.log('Candidates length:', response.candidates.length);
        if (response.candidates[0]) {
          console.log('First candidate:', response.candidates[0]);
          console.log('First candidate keys:', Object.keys(response.candidates[0]));
        }
      }        console.log('=== END DEBUGGING ===');
        
        // Check for thinking mode first
        if (enableThinking && this.supportsThinking(this.currentModel)) {
          console.log('🧠 THINKING MODE ENABLED - Processing thinking response');
          const thinkingResult = this.processThinkingResponse(response, enableThinking);
          
          if (thinkingResult.thoughts || thinkingResult.answer) {
            // Format thinking response with special markers for the Helper component to parse
            const formattedResponse = thinkingResult.thoughts 
              ? `<thinking>\n${thinkingResult.thoughts}\n</thinking>\n\n${thinkingResult.answer}`
              : thinkingResult.answer;
            
            console.log('🧠 Returning thinking response:', {
              hasThoughts: !!thinkingResult.thoughts,
              thoughtsLength: thinkingResult.thoughts.length,
              answerLength: thinkingResult.answer.length,
              formattedLength: formattedResponse.length
            });
            
            return formattedResponse;
          }
        }
        
        // Handle different response types based on model capabilities
      if (this.currentModel.supportsImageGeneration) {
        console.log('🖼️ PROCESSING IMAGE GENERATION RESPONSE');
          // First check for candidates with inline_data (official docs format)
        const imageCandidates = response.candidates;        if (imageCandidates && imageCandidates.length > 0) {
          const candidate = imageCandidates[0];
          if (candidate.content && candidate.content.parts) {
            console.log('Processing candidate parts for images');
            let textContent = '';
            const imageData: string[] = [];
            
            for (const part of candidate.content.parts) {
              console.log('Processing part:', Object.keys(part));
              
              if (part.text) {
                textContent += part.text;
              } else if (part.inline_data || part.inlineData) {
                const inlineData = part.inline_data || part.inlineData;
                console.log('Found inline image data:', {
                  mimeType: inlineData.mimeType,
                  hasData: !!inlineData.data,
                  dataLength: inlineData.data ? inlineData.data.length : 0
                });
                  if (inlineData.data) {
                  const mimeType = inlineData.mimeType || 'image/png';
                  const dataUrl = `data:${mimeType};base64,${inlineData.data}`;
                  imageData.push(dataUrl);
                  console.log('✅ Added image to imageData array:', {
                    index: imageData.length - 1,
                    mimeType,
                    dataUrlLength: dataUrl.length,
                    dataUrlPrefix: dataUrl.substring(0, 50) + '...'
                  });
                } else {
                  console.log('❌ No data found in inlineData:', inlineData);
                }
              }
            }
              if (imageData.length > 0) {
              const finalText = textContent || `I've generated ${imageData.length} image(s) for you.`;
              console.log('🎯 CALLING formatResponseWithImages with:', {
                textLength: finalText.length,
                imageCount: imageData.length,
                firstImagePrefix: imageData[0] ? imageData[0].substring(0, 50) + '...' : 'none'
              });
              const formattedResponse = this.formatResponseWithImages(finalText, imageData);
              console.log('🎯 formatResponseWithImages returned:', {
                length: formattedResponse.length,
                containsImg: formattedResponse.includes('<img'),
                preview: formattedResponse.substring(0, 200) + '...'
              });
              return formattedResponse;            } else if (textContent) {
              console.log('📄 Returning text content only (no images found):', textContent.substring(0, 100) + '...');
              return textContent;
            } else {
              console.log('❌ No text content and no images found in candidate.content.parts');
            }
          } else {
            console.log('❌ No candidate.content.parts found');
          }
        } else {
          console.log('❌ No candidates found for image generation');
        }
        
        // Check for images array in response (dedicated generateImages response)
        const responseAny = response as any;
        if (responseAny.images && Array.isArray(responseAny.images)) {
          console.log('Found images array:', responseAny.images.length);
          
          let textContent = `I've generated ${responseAny.images.length} image(s) for you:\n\n`;
          const imageData: string[] = [];
          
          for (const image of responseAny.images) {
            console.log('Processing image:', {
              keys: Object.keys(image),
              hasData: !!image.data,
              hasInlineData: !!image.inlineData,
              hasUrl: !!image.url,
              hasUri: !!image.uri
            });
            
            if (image.data) {
              // Direct base64 data
              const mimeType = image.mimeType || 'image/png';
              imageData.push(`data:${mimeType};base64,${image.data}`);
            } else if (image.inlineData && image.inlineData.data) {
              // Inline data format
              const mimeType = image.inlineData.mimeType || 'image/png';
              imageData.push(`data:${mimeType};base64,${image.inlineData.data}`);
            } else if (image.url || image.uri) {
              // External URL/URI
              try {
                const imageUrl = image.url || image.uri;
                const fetchedImage = await this.fetchImageFromUri(imageUrl);
                if (fetchedImage) {
                  imageData.push(fetchedImage);
                }
              } catch (error) {
                console.error('Failed to fetch image from URI:', error);
              }
            }
          }
            if (imageData.length > 0) {
            console.log('🎯 CALLING formatResponseWithImages with images array:', {
              textLength: textContent.length,
              imageCount: imageData.length,
              firstImagePrefix: imageData[0] ? imageData[0].substring(0, 50) + '...' : 'none'
            });
            const formattedResponse = this.formatResponseWithImages(textContent, imageData);
            console.log('🎯 formatResponseWithImages returned from images array:', {
              length: formattedResponse.length,
              containsImg: formattedResponse.includes('<img'),
              preview: formattedResponse.substring(0, 200) + '...'
            });
            return formattedResponse;
          }
        }
          // Fallback to candidates format for image generation
        console.log('🔄 FALLBACK: Trying processImageCandidates');
        const candidates = response.candidates;
        if (candidates && candidates.length > 0) {
          console.log('Image response in candidates format');
          return this.processImageCandidates(candidates);
        }
        
        // If no images found, return text response or error
        return (response as any).text || 'I attempted to generate an image, but no image data was returned in the response.';
      } else {
        // Handle regular text generation responses
        console.log('📝 PROCESSING TEXT GENERATION RESPONSE');
        
        const candidates = response.candidates;
        if (!candidates || candidates.length === 0) {
          console.log('No candidates in response, using response.text');        
          return response.text;
        }

        const candidate = candidates[0];
        if (!candidate.content || !candidate.content.parts) {        
          console.log('No content parts in candidate, using response.text');
          return response.text;
        }

        // Process text content normally
        return this.processTextCandidates(candidates);      }
    } catch (error) {
      console.error('Error generating content:', error);
      throw new Error(`Content generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if a file type is supported by Gemini
   */
  isSupportedFileType(file: File): boolean {
    const supportedTypes = [
      // Text files
      'text/plain',
      'text/markdown',
      'text/csv',
      'text/html',
      'text/css',
      'text/javascript',
      'application/json',
      'application/xml',
      
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      
      // Images
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      
      // Code files
      'application/x-python-code',
      'text/x-python',
      'application/x-javascript',
      'text/x-typescript',
      'text/x-java-source',
      'text/x-c',
      'text/x-c++',
      'text/x-php',
      'text/x-ruby',
      'text/x-go',
      'text/x-swift',
      'text/x-kotlin'
    ];
    
    // Check MIME type
    if (supportedTypes.includes(file.type)) {
      return true;
    }
    
    // Check file extension as fallback
    const fileName = file.name.toLowerCase();
    const supportedExtensions = [
      '.txt', '.md', '.csv', '.json', '.xml', '.html', '.css', '.js', '.ts', 
      '.py', '.java', '.c', '.cpp', '.php', '.rb', '.go', '.swift', '.kt',
      '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
      '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'
    ];
    
    return supportedExtensions.some(ext => fileName.endsWith(ext));
  }
  /**
   * Generate content with conversation history
   */
  async generateContentWithHistory(
    prompt: string,
    systemPrompt: string,
    conversationHistory: Content[],
    files?: GeminiFile[],
    model?: GeminiModel,
    rawFiles?: File[],
    enableThinking?: boolean
  ): Promise<string> {
    this.ensureInitialized();
    
    try {
      // Set the model if specified
      if (model) {
        this.setModel(model);
      }

      const currentModel = model || this.currentModel;
      
      // Ensure we have the right API key for this model type
      this.ensureModelApiKey();

      // Handle OpenRouter models
      if (currentModel.provider === 'openrouter') {
        return await this.generateContentOpenRouter(prompt, systemPrompt, currentModel, conversationHistory, files, rawFiles);
      }
      
      // Clean the system prompt of any potential problematic characters
      const cleanedSystemPrompt = systemPrompt?.replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim() || '';
      
      console.log('System instruction being sent:', {
        systemPrompt: cleanedSystemPrompt,
        length: cleanedSystemPrompt.length,
        hasSpecialChars: /[\u0000-\u001F\u007F-\u009F]/.test(systemPrompt || ''),
        modelSupportsImageGeneration: this.currentModel.supportsImageGeneration,
        willUseSystemInstruction: cleanedSystemPrompt && !this.currentModel.supportsImageGeneration
      });

      // Prepare the conversation contents
      const contents: any[] = [];

      // Add conversation history
      if (conversationHistory && conversationHistory.length > 0) {
        contents.push(...conversationHistory);
      }

      // Prepare the current message parts
      const currentParts: any[] = [];

      // Add files if provided
      if (files && files.length > 0) {
        for (const file of files) {
          // Ensure file is processed
          if (file.state !== 'ACTIVE') {
            await this.waitForFileProcessing(file.name);
          }
          
          currentParts.push({
            fileData: {
              fileUri: file.uri,
              mimeType: file.mimeType,
            },
          });
        }
      }

      // For image generation models, combine system prompt with user prompt
      const combinedPrompt = this.currentModel.supportsImageGeneration && cleanedSystemPrompt 
        ? `${cleanedSystemPrompt}\n\nUser: ${prompt}`
        : prompt;

      // Add the user prompt
      currentParts.push({ text: combinedPrompt });

      // Add the current message to contents
      contents.push({ role: 'user', parts: currentParts });

      // Use the new GoogleGenAI client API
      if (!this.client) {
        throw new Error('GoogleGenAI client not initialized');
      }
      
      const modelConfig = getModelConfig(this.currentModel);      // Prepare the request configuration
      const requestConfig: any = {
        model: this.currentModel.modelName,
        contents: contents,
        config: {
          generationConfig: modelConfig.generationConfig,
          // Apply grounding tools if configured
          ...(modelConfig.tools && { tools: modelConfig.tools }),
          // Only include systemInstruction if the model supports it
          // Image generation models don't support system instructions
          ...(cleanedSystemPrompt && !this.currentModel.supportsImageGeneration && { systemInstruction: cleanedSystemPrompt }),
          // For image generation models, specify response modalities
          ...(this.currentModel.supportsImageGeneration && {
            responseModalities: ["TEXT", "IMAGE"]
          }),
          // Add thinking configuration if enabled and supported
          ...(enableThinking && this.supportsThinking(this.currentModel) && {
            thinkingConfig: {
              includeThoughts: true
            }
          })
        }
      };      console.log('Request configuration for history:', {
        modelName: this.currentModel.modelName,
        supportsImageGeneration: this.currentModel.supportsImageGeneration,
        supportsGrounding: this.currentModel.supportsGrounding,
        supportsThinking: this.supportsThinking(this.currentModel),
        enableThinking: enableThinking,
        hasTools: !!requestConfig.config.tools,
        tools: requestConfig.config.tools,
        hasSystemInstruction: !!requestConfig.config.systemInstruction,
        hasResponseModalities: !!requestConfig.config.responseModalities,
        hasThinkingConfig: !!requestConfig.config.thinkingConfig,
        responseModalities: requestConfig.config.responseModalities,
        contentsLength: contents.length
      });

      // Use generateContent with the new API
      const response = await this.client.models.generateContent(requestConfig);      console.log('=== DEBUGGING HISTORY IMAGE GENERATION RESPONSE ===');
      console.log('Full response object:', response);
      console.log('Response constructor:', response.constructor.name);
      console.log('Response keys:', Object.keys(response));
      
      // Try to access response.text directly first
      console.log('Direct response.text:', response.text);
      console.log('Response.text type:', typeof response.text);
      
      // Check for thinking mode first
      if (enableThinking && this.supportsThinking(this.currentModel)) {
        console.log('🧠 THINKING MODE ENABLED FOR HISTORY - Processing thinking response');
        const thinkingResult = this.processThinkingResponse(response, enableThinking);
        
        if (thinkingResult.thoughts || thinkingResult.answer) {
          // Format thinking response with special markers for the Helper component to parse
          const formattedResponse = thinkingResult.thoughts 
            ? `<thinking>\n${thinkingResult.thoughts}\n</thinking>\n\n${thinkingResult.answer}`
            : thinkingResult.answer;
          
          console.log('🧠 Returning thinking response for history:', {
            hasThoughts: !!thinkingResult.thoughts,
            thoughtsLength: thinkingResult.thoughts.length,
            answerLength: thinkingResult.answer.length,
            formattedLength: formattedResponse.length
          });
          
          return formattedResponse;
        }
      }
      
      // Handle both text and image responses for models like Gemini 2.0 Flash Image Generation
      const candidates = response.candidates;
      if (!candidates || candidates.length === 0) {
        console.log('No candidates in response, using response.text');
        return response.text;
      }

      const candidate = candidates[0];
      if (!candidate.content || !candidate.content.parts) {
        console.log('No content parts in candidate, using response.text');
        return response.text;
      }

      console.log('Processing response parts with history:', {
        partsCount: candidate.content.parts.length,
        modelSupportsImageGen: this.currentModel.supportsImageGeneration,
        parts: candidate.content.parts.map(part => ({
          hasText: !!part.text,
          hasInlineData: !!part.inlineData,
          hasInline_data: !!(part as any).inline_data,
          keys: Object.keys(part),
          allProperties: Object.getOwnPropertyNames(part)
        }))
      });

      let textContent = '';
      const imageData: string[] = [];

      // Process all parts in the response
      for (const part of candidate.content.parts) {
        console.log('Processing part with history:', {
          hasText: !!part.text,
          hasInlineData: !!part.inlineData,
          hasInline_data: !!(part as any).inline_data,
          hasImageData: !!(part as any).imageData,
          hasImage_data: !!(part as any).image_data,
          hasBlob: !!(part as any).blob,
          hasExecutableCode: !!(part as any).executableCode,
          keys: Object.keys(part),
          fullPart: JSON.stringify(part, null, 2)
        });
        
        if (part.text) {
          textContent += part.text;
        } else { // Handle non-text parts (e.g., images)
          // Prioritize inline_data (snake_case) as per documentation
          if ((part as any).inline_data && (part as any).inline_data.data) {
            console.log('Found inline_data part (snake_case):', {
              mimeType: (part as any).inline_data.mimeType,
              dataLength: (part as any).inline_data.data?.length || 0,
            });
            const base64Image = (part as any).inline_data.data;
            const mimeType = (part as any).inline_data.mimeType || 'image/png';
            if (base64Image) {
              imageData.push(`data:${mimeType};base64,${base64Image}`);
            }
          } else if (part.inlineData && part.inlineData.data) { // Fallback to inlineData (camelCase)
            console.log('Found inlineData part (camelCase):', {
              mimeType: part.inlineData.mimeType,
              dataLength: part.inlineData.data?.length || 0,
            });
            const base64Image = part.inlineData.data;
            const mimeType = part.inlineData.mimeType || 'image/png';
            if (base64Image) {
              imageData.push(`data:${mimeType};base64,${base64Image}`);
            }
          } else if ((part as any).imageData && (part as any).imageData.data) {
            // Handle imageData format
            console.log('Found imageData part:', {
              mimeType: (part as any).imageData.mimeType,
              dataLength: (part as any).imageData.data?.length || 0
            });
            const base64Image = (part as any).imageData.data;
            const mimeType = (part as any).imageData.mimeType || 'image/png';
            if (base64Image) {
              imageData.push(`data:${mimeType};base64,${base64Image}`);
            }
          } else if ((part as any).image_data && (part as any).image_data.data) {
            // Handle image_data format
            console.log('Found image_data part:', {
              mimeType: (part as any).image_data.mimeType,
              dataLength: (part as any).image_data.data?.length || 0
            });
            const base64Image = (part as any).image_data.data;
            const mimeType = (part as any).image_data.mimeType || 'image/png';
            if (base64Image) {
              imageData.push(`data:${mimeType};base64,${base64Image}`);
            }
          } else if ((part as any).blob && (part as any).blob.data) {
            // Handle blob format
            console.log('Found blob part:', {
              mimeType: (part as any).blob.mimeType,
              dataLength: (part as any).blob.data?.length || 0
            });
            const base64Image = (part as any).blob.data;
            const mimeType = (part as any).blob.mimeType || 'image/png';
            if (base64Image) {
              imageData.push(`data:${mimeType};base64,${base64Image}`);
            }
          } else {
            console.log('Unknown part type - Full inspection:', {
              keys: Object.keys(part),
              allProperties: Object.getOwnPropertyNames(part),
              partContent: part,
              stringified: JSON.stringify(part, null, 2)
            });
          }
        }
      }      // If we have images, format the response to include them
      if (imageData.length > 0) {
        let formattedResponse = textContent;
        imageData.forEach((imgData, index) => {
          formattedResponse += `\n\n![Generated Image ${index + 1}](${imgData})`;
        });
        return formattedResponse;
      }
        
      return textContent || response.text;
    } catch (error) {
      console.error('Error generating content with history:', error);
      throw new Error(`Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate content using OpenRouter API
   */
  private async generateContentOpenRouter(
    prompt: string,
    systemPrompt: string,
    model: GeminiModel,
    conversationHistory?: Content[],
    files?: GeminiFile[],
    rawFiles?: File[]
  ): Promise<string> {
    if (!this.openRouterApiKey) {
      throw new Error('OpenRouter API key is required for OpenRouter models');
    }
    
    if (!model.apiUrl) {
      throw new Error('OpenRouter API URL not configured');
    }

    // Prepare messages for OpenRouter API
    const messages: any[] = [];

    // Add system message if provided
    if (systemPrompt.trim()) {
      messages.push({
        role: 'system',
        content: systemPrompt.trim()
      });
    }

    // Add conversation history if provided
    if (conversationHistory && conversationHistory.length > 0) {
      for (const historyItem of conversationHistory) {
        const role = historyItem.role === 'user' ? 'user' : 'assistant';
        const content = historyItem.parts.map(part => part.text).join(' ').trim();
        if (content) {
          messages.push({
            role,
            content
          });
        }
      }
    }

    // Prepare the current message content
    let currentContent = prompt;

    // Handle raw files for OpenRouter (since Gemini Files don't work with OpenRouter)
    if (rawFiles && rawFiles.length > 0) {
      const fileDescriptions = rawFiles.map(file => 
        `File: ${file.name} (${file.type}, ${file.size} bytes)`
      ).join('\n');
      
      currentContent = `${currentContent}\n\nAttached files:\n${fileDescriptions}\n\nNote: File contents are not directly accessible in this OpenRouter model. Please provide the relevant content in your message.`;
    }

    // Add the current user message
    messages.push({
      role: 'user',
      content: currentContent
    });

    try {
      const response = await fetch(model.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://4regab.com',
          'X-Title': '4REGAB AI Assistant'
        },
        body: JSON.stringify({
          model: model.modelName,
          messages,
          temperature: 0.7,
          max_tokens: 4000,
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter API error:', response.status, response.statusText, errorText);
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response choices from OpenRouter API');
      }      return data.choices[0].message?.content || 'No content received from OpenRouter API';

    } catch (error) {
      console.error('Error calling OpenRouter API:', error);
      throw new Error(`OpenRouter API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Format response with images for display
   */
  private formatResponseWithImages(textContent: string, imageData: string[]): string {
    const imageHtml = imageData.map((data, index) => 
      `<img src="${data}" alt="Generated image ${index + 1}" style="max-width: 100%; height: auto; margin: 10px 0;" />`
    ).join('');
    
    return `${textContent}\n\n${imageHtml}`;
  }

  /**
   * Fetch image from URI
   */
  private async fetchImageFromUri(uri: string): Promise<string | null> {
    try {
      const response = await fetch(uri);
      if (!response.ok) {
        console.error('Failed to fetch image:', response.status, response.statusText);
        return null;
      }
      
      const blob = await response.blob();
      const buffer = await blob.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      const mimeType = blob.type || 'image/png';
      
      return `data:${mimeType};base64,${base64}`;
    } catch (error) {
      console.error('Error fetching image from URI:', error);
      return null;
    }
  }

  /**
   * Process image candidates for image generation models
   */  private processImageCandidates(candidates: any[]): string {
    console.log('🔍 PROCESSING IMAGE CANDIDATES (fallback method)');
    const candidate = candidates[0];
    if (!candidate.content || !candidate.content.parts) {
      console.log('❌ No candidate.content.parts in fallback method');
      return 'No image content received.';
    }

    let textContent = '';
    const imageData: string[] = [];

    for (const part of candidate.content.parts) {
      console.log('🔍 Processing part in fallback:', Object.keys(part));
      if (part.text) {
        textContent += part.text;
        console.log('📄 Added text content:', part.text.substring(0, 50) + '...');
      } else {
        // Handle image parts
        if ((part as any).inline_data && (part as any).inline_data.data) {
          const base64Image = (part as any).inline_data.data;
          const mimeType = (part as any).inline_data.mimeType || 'image/png';
          const dataUrl = `data:${mimeType};base64,${base64Image}`;
          imageData.push(dataUrl);
          console.log('✅ Added image via inline_data in fallback:', {
            mimeType,
            dataLength: base64Image.length,
            dataUrlLength: dataUrl.length
          });
        } else if (part.inlineData && part.inlineData.data) {
          const base64Image = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/png';
          const dataUrl = `data:${mimeType};base64,${base64Image}`;
          imageData.push(dataUrl);
          console.log('✅ Added image via inlineData in fallback:', {
            mimeType,
            dataLength: base64Image.length,
            dataUrlLength: dataUrl.length
          });
        } else {
          console.log('❌ No image data found in part:', part);
        }
      }
    }
    
    console.log('🔍 Fallback final imageData check:', {
      arrayLength: imageData.length,
      hasImages: imageData.length > 0,
      textContentLength: textContent.length
    });
    
    if (imageData.length > 0) {
      console.log('🎯 CALLING formatResponseWithImages from fallback method');
      const formattedResponse = this.formatResponseWithImages(textContent || 'Generated image(s):', imageData);
      console.log('🎯 formatResponseWithImages returned from fallback:', {
        length: formattedResponse.length,
        containsImg: formattedResponse.includes('<img'),
        preview: formattedResponse.substring(0, 200) + '...'
      });
      return formattedResponse;
    }

    console.log('❌ No images found in fallback method, returning text only');
    return textContent || 'No image content received.';
  }

  /**
   * Process text candidates for regular text models
   */
  private processTextCandidates(candidates: any[]): string {
    const candidate = candidates[0];
    if (!candidate.content || !candidate.content.parts) {
      return 'No content received.';
    }

    let textContent = '';
    for (const part of candidate.content.parts) {
      if (part.text) {
        textContent += part.text;
      }
    }

    return textContent || 'No content received.';
  }

  /**
   * Check if the current model supports thinking mode
   */
  private supportsThinking(model: GeminiModel): boolean {
    // Only Gemini 2.5 series models support thinking
    return model.provider === 'google' && 
           (model.modelName.includes('2.5') || model.modelName.includes('gemini-2.5'));
  }

  /**
   * Process response with thinking parts
   */
  private processThinkingResponse(response: any, enableThinking: boolean): { thoughts: string; answer: string } {
    if (!enableThinking || !response.candidates || response.candidates.length === 0) {
      return { thoughts: '', answer: '' };
    }

    const candidate = response.candidates[0];
    if (!candidate.content || !candidate.content.parts) {
      return { thoughts: '', answer: '' };
    }

    let thoughts = '';
    let answer = '';

    console.log('🧠 PROCESSING THINKING RESPONSE');
    console.log('Parts count:', candidate.content.parts.length);

    for (const part of candidate.content.parts) {
      if (!part.text) continue;
      
      console.log('Part keys:', Object.keys(part));
      console.log('Has thought field:', 'thought' in part);
      console.log('Thought value:', (part as any).thought);
      
      if ((part as any).thought === true) {
        console.log('📝 Adding to thoughts:', part.text.substring(0, 100) + '...');
        thoughts += part.text;
      } else {
        console.log('💬 Adding to answer:', part.text.substring(0, 100) + '...');
        answer += part.text;
      }
    }

    console.log('🧠 Final thinking result:', {
      thoughtsLength: thoughts.length,
      answerLength: answer.length,
      hasThoughts: thoughts.length > 0,
      hasAnswer: answer.length > 0
    });

    return { thoughts: thoughts.trim(), answer: answer.trim() };
  }
}

export default new GeminiService();
