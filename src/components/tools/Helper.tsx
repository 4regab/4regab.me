import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast as sonnerToast } from 'sonner';
import { useToast } from '@/hooks/use-toast';
import { Paperclip, Send, Trash2, Settings2, Info, X, Bot, User, AlertTriangle, CheckCircle2, Loader2, FileType, Copy, Upload, Brain, Zap, Square, Download, FileText, RotateCcw } from 'lucide-react';
import { GEMINI_MODELS, getDefaultModel, getModelById, getModelConfig } from '@/lib/gemini-models';
import { HELPER_AGENTS, getAgentById, getAgentIcon } from '@/lib/helper-agents';
import { BackendService } from '@/lib/backend-service';
import { ExportService } from '@/lib/export-service';
import { isSupportedFileType, isVideoFile, validateFileSize, formatFileSize } from '@/lib/file-utils';
import MessageContent from '@/components/ui/message-content';
// import { ragService, type DocumentChunk, type RAGContext } from '@/lib/rag-service'; // Removed RAG
import { type AgentPrompt, type GeminiModel, type GeminiFile, type HelperTask, type ExportOptions } from '@/types/helper';
import { cn } from '@/lib/utils';

// SECURITY NOTE: GeminiService import removed - all AI operations now use secure backend endpoints
// import geminiService from '@/lib/gemini-service'; // REMOVED FOR SECURITY

// Chat message interface
interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  agent?: AgentPrompt;
  model?: GeminiModel;
  files?: File[]; // Files attached to the user's message
  geminiResponseFiles?: GeminiFile[]; // Files returned by Gemini
  rawFiles?: File[]; // Raw files for OpenRouter compatibility
  isLoading?: boolean;
  error?: string;  // Thinking mode fields (updated for official API)
  isThinkingMode?: boolean;
  thinkingProcess?: string;
  finalAnswer?: string;
  isThinking?: boolean;
}

const LOCAL_STORAGE_CHAT_HISTORY_KEY = 'gemini_helper_chat_history';

// Helper function to check if a model supports thinking mode
function supportsThinking(model: GeminiModel): boolean {
  return model.provider === 'google' && 
         (model.modelName.includes('2.0') || 
          model.modelName.includes('2.5') || 
          model.modelName.includes('gemini-2.0') || 
          model.modelName.includes('gemini-2.5'));
}

// Helper function to parse thinking mode response (official API format)
function parseThinkingResponse(response: string): { thinkingProcess: string; finalAnswer: string } {
  // Look for <thinking> tags from the official API
  const thinkingMatch = response.match(/<thinking>(.*?)<\/thinking>/s);
  if (thinkingMatch) {
    const thinkingProcess = cleanResponseFormatting(thinkingMatch[1].trim());
    // Everything after </thinking> is the final answer
    let finalAnswer = response.replace(/<thinking>.*?<\/thinking>/s, '').trim();
    
    // Clean the final answer of any unwanted headers or markers
    finalAnswer = cleanFinalAnswer(finalAnswer);
    
    return {
      thinkingProcess: thinkingProcess,
      finalAnswer: finalAnswer || 'Based on the reasoning above.'
    };
  }
  
  // If no thinking tags found, treat entire response as final answer
  return {
    thinkingProcess: '',
    finalAnswer: cleanFinalAnswer(response)
  };
}

// Helper function to simulate streaming text display
const streamText = async (
  text: string, 
  messageId: string, 
  fieldName: 'thinkingProcess' | 'finalAnswer',
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  onComplete?: () => void
) => {
  const words = text.split(' ');
  let currentText = '';
  
  for (let i = 0; i < words.length; i++) {
    currentText += (i > 0 ? ' ' : '') + words[i];
    
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, [fieldName]: currentText }
        : msg
    ));
    
    // Random delay between 30-80ms to simulate natural typing
    await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 30));
  }
  
  if (onComplete) {
    onComplete();
  }
};

// Helper function to clean final answer of unwanted headers and markers
function cleanFinalAnswer(answer: string): string {
  let cleaned = answer;
  
  // Remove specific unwanted headers and markers
  cleaned = cleaned.replace(/✅\s*\*\*Final Answer:\*\*/gi, '');
  cleaned = cleaned.replace(/\*\*Final Answer:\*\*/gi, '');
  cleaned = cleaned.replace(/^Final Answer:\s*/gi, '');
  cleaned = cleaned.replace(/^Conclusion:\s*/gi, '');
  cleaned = cleaned.replace(/^In essence,?\s*/gi, '');
  cleaned = cleaned.replace(/^In summary,?\s*/gi, '');
  cleaned = cleaned.replace(/✅/g, '');
  
  // Remove markdown headers like ##, ###, etc. at the beginning of lines
  cleaned = cleaned.replace(/^#{1,6}\s*/gm, '');
  
  // Apply aggressive formatting cleanup to make it plain text
  cleaned = cleanResponseFormatting(cleaned);
  
  return cleaned.trim();
}

// Helper function to clean unnecessary asterisks and formatting
// IMPORTANT: This function should be conservative and NOT damage code content
function cleanResponseFormatting(response: string): string {
  let cleaned = response;
  
  // First, preserve code blocks by temporarily replacing them with placeholders
  const codeBlocks: string[] = [];
  const codeBlockPlaceholders: string[] = [];
  
  // Preserve markdown code blocks
  cleaned = cleaned.replace(/```[\s\S]*?```/g, (match) => {
    const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
    codeBlocks.push(match);
    codeBlockPlaceholders.push(placeholder);
    return placeholder;
  });
  
  // Preserve inline code
  const inlineCode: string[] = [];
  const inlineCodePlaceholders: string[] = [];
  cleaned = cleaned.replace(/`([^`]+)`/g, (match) => {
    const placeholder = `__INLINE_CODE_${inlineCode.length}__`;
    inlineCode.push(match);
    inlineCodePlaceholders.push(placeholder);
    return placeholder;
  });
  
  // Now apply conservative cleaning to non-code content
  // Remove only clearly markdown formatting (not code-related symbols)
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1'); // Remove bold formatting
  cleaned = cleaned.replace(/(?<!\w)\*([^*\n]+)\*(?!\w)/g, '$1'); // Remove italic formatting (word boundaries)
  cleaned = cleaned.replace(/~~([^~]+)~~/g, '$1'); // Remove strikethrough
  
  // Clean up bullet points - convert to simple dashes
  cleaned = cleaned.replace(/^\s*[-*+]\s+/gm, '- ');
  
  // Remove numbered list formatting (but preserve line numbers in code)
  cleaned = cleaned.replace(/^\s*\d+\.\s+/gm, '');
  
  // Remove markdown links but keep the text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  
  // Remove cursor and special formatting characters (but preserve code symbols)
  cleaned = cleaned.replace(/[▊│]/g, ''); // Remove cursor and special chars
  
  // Clean up excessive spacing
  cleaned = cleaned.replace(/[ \t]{3,}/g, ' ');
  
  // Clean up excessive newlines but preserve paragraph breaks
  cleaned = cleaned.replace(/\n{4,}/g, '\n\n');
  cleaned = cleaned.replace(/\n{3}/g, '\n\n');
  
  // Remove trailing whitespace from lines
  cleaned = cleaned.replace(/[ \t]+$/gm, '');
  
  // Restore code blocks
  codeBlockPlaceholders.forEach((placeholder, index) => {
    cleaned = cleaned.replace(placeholder, codeBlocks[index]);
  });
  
  // Restore inline code
  inlineCodePlaceholders.forEach((placeholder, index) => {
    cleaned = cleaned.replace(placeholder, inlineCode[index]);
  });
  
  return cleaned.trim();
}

const Helper = () => {
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  // Configuration state
  const [selectedAgent, setSelectedAgent] = useState<AgentPrompt>(HELPER_AGENTS[0]);
  const [selectedModel, setSelectedModel] = useState<GeminiModel>(() => {
    // Load persisted model from localStorage on initialization
    const savedModelId = localStorage.getItem('selected_model_id');
    if (savedModelId) {
      const savedModel = getModelById(savedModelId);
      if (savedModel) {
        return savedModel;
      }
    }
    return getDefaultModel();
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]); // Files staged for the next message
  const [geminiUploadedFiles, setGeminiUploadedFiles] = useState<GeminiFile[]>([]); // Files uploaded to Gemini service
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  // Service state (no longer needs API key management)
  const [isServiceInitialized] = useState(true); // Always initialized since we use serverless functions
  
  // Reasoning Mode
  const [isThinkingMode, setIsThinkingMode] = useState(false);

  // RAG state - REMOVED
  // const [ragDocuments, setRagDocuments] = useState<DocumentChunk[]>([]);
  // const [isProcessingRAG, setIsProcessingRAG] = useState(false);
  // const [ragStats, setRagStats] = useState<{ totalChunks: number; totalSources: number; sources: string[] }>({
  //   totalChunks: 0,
  //   totalSources: 0,
  //   sources: []
  // });  // Load chat history from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem(LOCAL_STORAGE_CHAT_HISTORY_KEY);
    if (savedMessages) {
      try {
        const parsedMessages: ChatMessage[] = JSON.parse(savedMessages).map((msg: ChatMessage) => ({
          ...msg,
          timestamp: new Date(msg.timestamp) // Ensure timestamp is a Date object
        }));
        setMessages(parsedMessages);
      } catch (e) {
        console.error("Failed to parse chat history from localStorage", e);
        localStorage.removeItem(LOCAL_STORAGE_CHAT_HISTORY_KEY);
      }
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_CHAT_HISTORY_KEY, JSON.stringify(messages));
    } else {
      // If messages are cleared (e.g. by clearConversation), remove from storage
      const storedHistory = localStorage.getItem(LOCAL_STORAGE_CHAT_HISTORY_KEY);
      if (storedHistory) {
        localStorage.removeItem(LOCAL_STORAGE_CHAT_HISTORY_KEY);
      }
    }  }, [messages]);
  
  // Save selected model to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('selected_model_id', selectedModel.id);
  }, [selectedModel]);
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);  // SECURE FILE UPLOAD: Uses backend service instead of exposing API keys
  const uploadFilesToGemini = useCallback(async (filesToUpload: File[]): Promise<GeminiFile[]> => {
    setIsUploading(true);
    setUploadProgress(0);
    const successfullyUploaded: GeminiFile[] = [];

    try {
      // Use secure file validation functions instead of geminiService
      const supportedFiles = filesToUpload.filter(file => isSupportedFileType(file));
      const unsupportedFiles = filesToUpload.filter(file => !isSupportedFileType(file));

      if (unsupportedFiles.length > 0) {
        toast({
          title: "Unsupported Files",
          description: `${unsupportedFiles.length} file(s) are not supported and were skipped.`,
          variant: "default"
        });
      }

      // Check for video files and provide guidance
      const videoFiles = supportedFiles.filter(file => isVideoFile(file));
      if (videoFiles.length > 0) {
        const largeVideos = videoFiles.filter(file => file.size > 20 * 1024 * 1024); // > 20MB
        if (largeVideos.length > 0) {
          toast({
            title: "Large Video Files Detected",
            description: `${largeVideos.length} video file(s) are larger than 20MB. Upload may take longer and will use the Files API for optimal processing.`,
            variant: "default"
          });
        }
      }

      // Validate file sizes
      for (const file of supportedFiles) {
        const sizeValidation = validateFileSize(file);
        if (!sizeValidation.valid) {
          toast({
            title: "File Too Large",
            description: sizeValidation.message,
            variant: "destructive"
          });
          return [];
        }
      }
      
      if (supportedFiles.length === 0 && filesToUpload.length > 0) {
         toast({ title: "No supported files", description: "None of the selected files can be uploaded.", variant: "destructive" });
         setIsUploading(false);
         return [];
      }
      if (supportedFiles.length === 0) {
        setIsUploading(false);
        return [];
      }

      // SECURITY: File upload now happens via secure backend during chat
      // Files are staged locally and uploaded when needed for AI processing
      for (let i = 0; i < supportedFiles.length; i++) {
        const file = supportedFiles[i];
        try {
          // Create a mock GeminiFile object for staging
          // Actual upload will happen via BackendService during chat
          const stagedFile: GeminiFile = {
            name: `staged_${Date.now()}_${file.name}`,
            displayName: file.name,
            mimeType: file.type,
            sizeBytes: file.size,
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString(),
            expirationTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
            sha256Hash: '', // Will be set by backend
            uri: '', // Will be set by backend
            state: 'PROCESSING', // Staged for upload
            error: undefined,
            videoMetadata: isVideoFile(file) ? { videoDuration: '' } : undefined
          };
          
          successfullyUploaded.push(stagedFile);
          setGeminiUploadedFiles(prev => [...prev, stagedFile]);
          
          console.log(`[SECURE UPLOAD] Staged file for secure upload: ${file.name}`);
        } catch (error) {
          console.error(`Failed to stage ${file.name}:`, error);
          toast({ title: `Staging Failed: ${file.name}`, description: (error as Error).message, variant: "destructive" });
        }
        setUploadProgress(((i + 1) / supportedFiles.length) * 100);
      }
        if (successfullyUploaded.length > 0) {
        const videoCount = successfullyUploaded.filter(file => file.mimeType.startsWith('video/')).length;
        const fileTypeMessage = videoCount > 0 
          ? `${successfullyUploaded.length} files prepared for AI (including ${videoCount} video file${videoCount > 1 ? 's' : ''}).`
          : `${successfullyUploaded.length} files prepared for AI.`;
        
        toast({ 
          title: "Files Uploaded", 
          description: fileTypeMessage
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: "Upload Error", description: "An unexpected error occurred during file upload.", variant: "destructive" });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
    return successfullyUploaded;
  }, [toast]);  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newLocalFiles = [...uploadedFiles, ...acceptedFiles];
    setUploadedFiles(newLocalFiles); // Add to staging files for the input area

    // Upload files immediately to Gemini
    if (acceptedFiles.length > 0) {
      await uploadFilesToGemini(acceptedFiles);
    }
  }, [uploadedFiles, uploadFilesToGemini]);

  const { getRootProps, getInputProps, isDragActive, open: openFileDialog } = useDropzone({
    onDrop,
    accept: {
      'text/*': ['.txt', '.md', '.csv', '.json', '.xml', '.html', '.css', '.js', '.ts', '.py', '.java', '.c', '.cpp', '.php', '.rb', '.go', '.swift', '.kt'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif', '.svg', '.gif', '.bmp', '.tiff'],
      'audio/*': ['.wav', '.mp3', '.m4a', '.aiff', '.aac', '.ogg', '.flac'],
      'video/*': ['.mp4', '.mpeg', '.mov', '.avi', '.webm', '.mkv', '.flv', '.wmv'],
    },
    maxSize: 2 * 1024 * 1024 * 1024, // 2GB limit
    noClick: true, // We use a custom button to trigger file dialog
  });

  const removeStagedFile = useCallback((index: number) => {
    const fileToRemove = uploadedFiles[index];
    if (!fileToRemove) {
      console.warn(`File at index ${index} not found in uploadedFiles for removal.`);
      return;
    }
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    
    // If this file was already uploaded to Gemini, we might want to remove it from geminiUploadedFiles too
    // and potentially delete it from Gemini service if it\'s not part of any message yet.
    // For simplicity now, we only remove from the staging list.
    // If it was uploaded, its GeminiFile representation is in \`geminiUploadedFiles\`.
    const correspondingGeminiFile = geminiUploadedFiles.find(gf => gf.displayName === fileToRemove.name);
    if (correspondingGeminiFile) {
        setGeminiUploadedFiles(prev => prev.filter(gf => gf.name !== correspondingGeminiFile.name));
        // Optionally, delete from Gemini service if not yet used in a message
        // geminiService.deleteFile(correspondingGeminiFile.name).catch(console.error);
    }
  }, [uploadedFiles, geminiUploadedFiles]);

  // RAG processing functions - REMOVED
  // const processFilesForRAG = useCallback(async (files: File[]) => {
  //   if (files.length === 0) return;
    
  //   setIsProcessingRAG(true);
  //   try {
  //     console.log(`Processing ${files.length} files for RAG...`);
  //     const chunks = await ragService.processFiles(files);
  //     setRagDocuments(prev => [...prev, ...chunks]);
      
  //     const stats = ragService.getStats();
  //     setRagStats(stats);
      
  //     toast({
  //       title: "Documents Processed for RAG",
  //       description: `${chunks.length} text chunks created from ${files.length} files`,
  //     });
  //   } catch (error) {
  //     console.error('RAG processing error:', error);
  //     toast({
  //       title: "RAG Processing Failed",
  //       description: error instanceof Error ? error.message : "Failed to process documents for RAG",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsProcessingRAG(false);
  //   }
  // }, [toast]);

  // const clearRAGDocuments = useCallback(() => {
  //   ragService.clearDocuments();
  //   setRagDocuments([]);
  //   setRagStats({ totalChunks: 0, totalSources: 0, sources: [] });
  //   toast({ title: "RAG Documents Cleared", description: "All processed documents have been removed from memory." });
  // }, [toast]);

  // const getRAGContext = useCallback(async (query: string): Promise<RAGContext | null> => {
  //   if (ragDocuments.length === 0) return null;
      //   try {
  //     const searchResults = await ragService.searchRelevantChunks(query, 5);
  //     if (searchResults.length === 0) return null;
      
  //     return ragService.buildRAGContext(searchResults);
  //   } catch (error) {
  //     console.error('RAG context generation error:', error);
  //     return null;  //   }
  // }, [ragDocuments]);
  const sendMessage = useCallback(async () => {
    if (!currentMessage.trim() && uploadedFiles.length === 0) return;
    if (isProcessing) return;

    // Check if we're trying to send images or videos to a text-only model
    const hasMediaFiles = uploadedFiles.some(file => 
      file.type.startsWith('image/') || 
      file.type.startsWith('video/') ||
      /\.(jpg|jpeg|png|gif|webp|svg|mp4|mpeg|mov|avi|webm|mkv|flv|wmv)$/i.test(file.name)
    );
    
    if (hasMediaFiles && selectedModel.supportsVision === false) {
      const mediaTypes = [];
      const hasImages = uploadedFiles.some(file => 
        file.type.startsWith('image/') || 
        /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name)
      );
      const hasVideos = uploadedFiles.some(file => 
        file.type.startsWith('video/') || 
        /\.(mp4|mpeg|mov|avi|webm|mkv|flv|wmv)$/i.test(file.name)
      );
      
      if (hasImages) mediaTypes.push('images');
      if (hasVideos) mediaTypes.push('videos');
      
      toast({
        title: "Model Limitation",
        description: `⚠️ ${selectedModel.name} doesn't support ${mediaTypes.join(' or ')}. Please select a vision-capable model (marked with ⚡ Vision) or remove the ${mediaTypes.join('/')} files.`,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Create abort controller for this generation
    const controller = new AbortController();
    setAbortController(controller);
    
    const messageContent = currentMessage.trim();
    const filesForThisMessage = [...uploadedFiles]; // Files staged in the input bar
    
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      type: 'user',
      content: messageContent || (filesForThisMessage.length > 0 ? `Analyzing ${filesForThisMessage.length} file(s)...` : '...'),
      timestamp: new Date(),
      files: filesForThisMessage.length > 0 ? filesForThisMessage : undefined,
      rawFiles: filesForThisMessage.length > 0 ? filesForThisMessage : undefined,
    };

    const assistantMessageId = crypto.randomUUID();
    const assistantMessagePlaceholder: ChatMessage = {
      id: assistantMessageId,
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      agent: selectedAgent,
      model: selectedModel,
      isLoading: true,
      isThinkingMode: isThinkingMode,
      isThinking: isThinkingMode,
      thinkingProcess: '',
      finalAnswer: '',
    };
    
    setMessages(prev => [...prev, userMessage, assistantMessagePlaceholder]);
    setCurrentMessage('');
    setUploadedFiles([]); // Clear staged files from input bar
    
    try {
      // Build conversation history for multi-turn conversations
      const MAX_HISTORY_MESSAGES = 20;
      const recentMessages = messages
        .filter(msg => 
          !msg.isLoading && 
          !msg.error && 
          !msg.isThinking && 
          msg.content.trim() && 
          msg.id !== assistantMessageId
        ) 
        .slice(-MAX_HISTORY_MESSAGES)
        .map(msg => {
          const contentToUse = msg.isThinkingMode && msg.finalAnswer 
            ? msg.finalAnswer 
            : msg.content;
          
          return {
            role: msg.type === 'user' ? 'user' : 'model',
            parts: [{ text: contentToUse }]
          };
        })
        .filter(msg => msg.parts[0].text.trim());
      
      // Ensure the conversation alternates properly and starts with 'user'
      const cleanedHistory = [];
      let lastRole = null;
      
      for (const msg of recentMessages) {
        if (msg.role !== lastRole) {
          cleanedHistory.push(msg);
          lastRole = msg.role;
        }
      }
      
      if (cleanedHistory.length > 0 && cleanedHistory[0].role !== 'user') {
        while (cleanedHistory.length > 0 && cleanedHistory[0].role !== 'user') {
          cleanedHistory.shift();
        }
      }

      const currentPrompt = messageContent || `Please analyze the ${filesForThisMessage.length > 0 ? 'uploaded files' : 'previous context'} and provide insights.`;
      
      // Call the serverless function instead of direct API
      const requestBody = {
        prompt: currentPrompt,
        systemPrompt: selectedAgent.systemPrompt,
        conversationHistory: cleanedHistory.length > 0 ? cleanedHistory : undefined,
        model: selectedModel.modelName || 'gemini-2.5-flash-preview-05-20',
        enableThinking: isThinkingMode
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to generate response');
      }

      const responseText = data.content || data.response || '';

      // Process response based on thinking mode
      if (isThinkingMode) {
        // Parse thinking mode response to separate thinking process from final answer
        const parsed = parseThinkingResponse(responseText);
        
        // First, stop the loading state and start showing thinking process
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { 
                ...msg, 
                isLoading: false,
                isThinking: true,
                isThinkingMode: true,
                thinkingProcess: '',
                finalAnswer: ''
              }
            : msg
        ));
        
        // Small delay to ensure state update is processed
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Stream the thinking process if it exists
        if (parsed.thinkingProcess) {
          await streamText(
            parsed.thinkingProcess, 
            assistantMessageId, 
            'thinkingProcess', 
            setMessages,
            () => {
              // After thinking is complete, clear thinking process and show final answer
              setMessages(prev => prev.map(msg => 
                msg.id === assistantMessageId 
                  ? { 
                      ...msg, 
                      isThinking: false,
                      content: parsed.finalAnswer,
                      finalAnswer: parsed.finalAnswer,
                      thinkingProcess: '' // Clear the thinking process
                    }
                  : msg
              ));
            }
          );
        } else {
          // No thinking process, just show final answer
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId 
              ? { 
                  ...msg, 
                  isThinking: false,
                  content: parsed.finalAnswer,
                  finalAnswer: parsed.finalAnswer,
                  thinkingProcess: '' // Ensure no residual thinking process
                }
              : msg
          ));
        }
      } else {
        // Clean up unnecessary asterisks in regular mode
        const cleanedResponse = cleanResponseFormatting(responseText);
        
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: cleanedResponse, isLoading: false }
            : msg
        ));
      }

    } catch (error) {
      console.error('Processing error:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { 
              ...msg, 
              content: 'Sorry, I encountered an error while processing your request. Please try again.',
              isLoading: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          : msg
      ));
      
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast({
        title: "Processing Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setAbortController(null);
    }
  }, [
    currentMessage, 
    uploadedFiles, 
    selectedAgent, 
    selectedModel,
    isProcessing, 
    toast, 
    isThinkingMode, 
    messages  ]);
  // Function to regenerate the last response
  const regenerateLastResponse = useCallback(() => {
    if (isProcessing) return;
    
    // Find the last user message to regenerate response for
    let lastUserMessage: ChatMessage | null = null;
    let lastAssistantIndex = -1;
    
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].type === 'assistant') {
        lastAssistantIndex = i;
        break;
      }
    }
    
    // Find the user message that preceded the last assistant message
    for (let i = lastAssistantIndex - 1; i >= 0; i--) {
      if (messages[i].type === 'user') {
        lastUserMessage = messages[i];
        break;
      }
    }
    
    if (!lastUserMessage) {
      toast({
        title: "Cannot regenerate",
        description: "No previous user message found to regenerate response for.",
        variant: "destructive",
      });
      return;
    }

    // Remove the last assistant message
    const newMessages = messages.slice(0, lastAssistantIndex);
    setMessages(newMessages);
      // Set up the regeneration
    const regenerateMessage = async () => {
      setIsProcessing(true);
      
      // Create abort controller for this regeneration
      const controller = new AbortController();
      setAbortController(controller);
      
      // Create new assistant message placeholder
      const assistantMessageId = crypto.randomUUID();
      const assistantMessagePlaceholder: ChatMessage = {
        id: assistantMessageId,
        type: 'assistant',
        content: '',
        timestamp: new Date(),
        agent: lastUserMessage.agent || selectedAgent,        model: lastUserMessage.model || selectedModel,
        isLoading: true,
        isThinkingMode: isThinkingMode,
        isThinking: isThinkingMode,
        thinkingProcess: '',
        finalAnswer: '',
      };

      setMessages(prev => [...prev, assistantMessagePlaceholder]);

      try {
        // Build conversation history using the messages before the regeneration
        const MAX_HISTORY_MESSAGES = 20;
        const recentMessages = newMessages
          .filter(msg => 
            !msg.isLoading && 
            !msg.error && 
            !msg.isThinking && 
            msg.content.trim()
          ) 
          .slice(-MAX_HISTORY_MESSAGES)
          .map(msg => {            const contentToUse = msg.isThinkingMode && msg.finalAnswer 
              ? msg.finalAnswer 
              : msg.content;
            
            return {
              role: msg.type === 'user' ? 'user' : 'model',
              parts: [{ text: contentToUse }]
            };
          })
          .filter(msg => msg.parts[0].text.trim());
        
        // Ensure the conversation alternates properly and starts with 'user'
        const cleanedHistory = [];
        let lastRole = null;
        
        for (const msg of recentMessages) {
          if (msg.role !== lastRole) {
            cleanedHistory.push(msg);
            lastRole = msg.role;
          }
        }
        
        if (cleanedHistory.length > 0 && cleanedHistory[0].role !== 'user') {
          while (cleanedHistory.length > 0 && cleanedHistory[0].role !== 'user') {
            cleanedHistory.shift();
          }
        }

        // Get files for Gemini (if any)
        let filesForGemini: GeminiFile[] = [];
        if (lastUserMessage.files && lastUserMessage.files.length > 0) {
          filesForGemini = geminiUploadedFiles.filter(gf => 
            lastUserMessage.files!.some(lf => lf.name === gf.displayName)
          );
        }        const currentPrompt = lastUserMessage.content || `Please analyze the ${filesForGemini.length > 0 ? 'uploaded files' : 'previous context'} and provide insights.`;
        const systemPrompt = (lastUserMessage.agent || selectedAgent).systemPrompt; // Use normal agent prompt - thinking handled by API
        const modelToUse = lastUserMessage.model || selectedModel;        // SECURE AI GENERATION: Use backend service instead of exposing API keys
        // IMPORTANT: Image generation models don't support conversation history, so always use generateContent for them
        const chatRequest = {
          message: currentPrompt,
          conversationHistory: cleanedHistory.length > 0 && !modelToUse.supportsImageGeneration ? cleanedHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
            content: msg.parts[0].text
          })) : undefined,
          model: modelToUse.modelName,
          agent: (lastUserMessage.agent || selectedAgent).id,
          files: lastUserMessage.files,
          systemPrompt: systemPrompt,
          thinkingMode: isThinkingMode
        };

        console.log('[SECURE CHAT] Sending request to backend:', chatRequest);
        
        const response = await BackendService.chat(chatRequest);// Process response based on thinking mode
        if (isThinkingMode) {
          const parsed = parseThinkingResponse(response);
          
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId 
              ? { 
                  ...msg, 
                  isLoading: false,
                  isThinking: true,
                  isThinkingMode: true,
                  thinkingProcess: '',
                  finalAnswer: ''
                }
              : msg
          ));
          
          await new Promise(resolve => setTimeout(resolve, 100));
          
          if (parsed.thinkingProcess) {
            await streamText(
              parsed.thinkingProcess, 
              assistantMessageId, 
              'thinkingProcess', 
              setMessages,
              () => {
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { 
                        ...msg, 
                        isThinking: false,
                        content: parsed.finalAnswer,
                        finalAnswer: parsed.finalAnswer,
                        thinkingProcess: ''
                      }
                    : msg
                ));
              }
            );
          } else {
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessageId 
                ? { 
                    ...msg, 
                    isThinking: false,
                    content: parsed.finalAnswer,
                    finalAnswer: parsed.finalAnswer,
                    thinkingProcess: ''
                  }
                : msg
            ));
          }
        } else {
          const cleanedResponse = cleanResponseFormatting(response);
          
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: cleanedResponse, isLoading: false }
              : msg
          ));
        }

      } catch (error) {
        console.error('Regeneration error:', error);
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { 
                ...msg, 
                content: 'Sorry, I encountered an error during regeneration. Please try again.',
                isLoading: false,
                error: error instanceof Error ? error.message : 'Unknown error'
              }
            : msg
        ));        toast({
          title: "Regeneration Failed",
          description: error instanceof Error ? error.message : "An error occurred during regeneration.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
        setAbortController(null);
      }
    };

    // Execute regeneration
    regenerateMessage();
    
  }, [messages, isProcessing, selectedAgent, selectedModel, toast, isThinkingMode, geminiUploadedFiles]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const copyMessage = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: "Copied to clipboard" });
  }, [toast]);
  const clearConversation = useCallback(() => {
    setMessages([]);
    setUploadedFiles([]); // Clear staged files
    setGeminiUploadedFiles([]); // Clear files uploaded to Gemini
    // SECURITY: File deletion now handled securely by backend
    // Files are automatically cleaned up by the backend after expiration
    
    localStorage.removeItem(LOCAL_STORAGE_CHAT_HISTORY_KEY);
    toast({ title: "Conversation Cleared", description: "All messages and chat history have been removed." });
  }, [toast]);
  const triggerFileInput = () => {
    // Try both approaches to ensure file dialog opens
    if (fileInputRef.current) {
      fileInputRef.current.click();    } else {
      openFileDialog();
    }
  };
  
  // Helper to truncate filename
  const truncateFilename = (filename: string): string => {
    if (filename.length <= 8) return filename;
    const extension = filename.split('.').pop();
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
    if (nameWithoutExt.length <= 6) return filename;
    return `${nameWithoutExt.substring(0, 6)}...${extension ? '.' + extension : ''}`;
  };
  const getFileTypeBadge = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toUpperCase();
    return extension || 'FILE';
  };

  // Function to stop generation
  const stopGeneration = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    setIsProcessing(false);
    
    // Update the last message to indicate it was stopped
    setMessages(prev => {
      const newMessages = [...prev];
      const lastMessage = newMessages[newMessages.length - 1];
      if (lastMessage && lastMessage.type === 'assistant' && lastMessage.isLoading) {
        lastMessage.isLoading = false;
        lastMessage.content = (lastMessage.content || '') + '\n\n[Generation stopped by user]';
      }
      return newMessages;
    });
    
    toast({
      title: "Generation stopped",
      description: "Response generation has been stopped.",
    });
  }, [abortController, toast]);
  // Export latest response as PDF
  const exportLatestResponseAsPDF = useCallback(async () => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.type !== 'assistant') {
      toast({
        title: "Nothing to export",
        description: "No assistant response found to export.",
        variant: "destructive"
      });
      return;
    }

    try {      const contentToExport = lastMessage.isThinkingMode 
        ? (lastMessage.finalAnswer || lastMessage.content)
        : lastMessage.content;
      
      const task: HelperTask = {
        id: lastMessage.id,
        title: "AI Response",
        content: contentToExport,
        selectedAgent: selectedAgent,
        selectedModel: selectedModel,
        response: "",
        status: 'completed',
        createdAt: lastMessage.timestamp
      };
      
      const options: ExportOptions = {
        format: 'pdf',
        fileName: ExportService.generateFileName('AI_Response', 'pdf', true),
        includeTimestamp: true,
        includeBranding: false
      };
      
      await ExportService.exportToPDF(task, options);
      
      toast({
        title: "Export successful",
        description: "Response exported as PDF.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export response as PDF.",
        variant: "destructive"
      });
    }
  }, [messages, toast, selectedAgent, selectedModel]);

  // Export latest response as DOCX
  const exportLatestResponseAsDOCX = useCallback(async () => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.type !== 'assistant') {
      toast({
        title: "Nothing to export",
        description: "No assistant response found to export.",
        variant: "destructive"
      });
      return;
    }

    try {      const contentToExport = lastMessage.isThinkingMode 
        ? (lastMessage.finalAnswer || lastMessage.content)
        : lastMessage.content;
      
      const task: HelperTask = {
        id: lastMessage.id,
        title: "AI Response",
        content: contentToExport,
        selectedAgent: selectedAgent,
        selectedModel: selectedModel,
        response: "",
        status: 'completed',
        createdAt: lastMessage.timestamp
      };
      
      const options: ExportOptions = {
        format: 'docx',
        fileName: ExportService.generateFileName('AI_Response', 'docx', true),
        includeTimestamp: true,
        includeBranding: false
      };
      
      await ExportService.exportToDOCX(task, options);
      
      toast({
        title: "Export successful",
        description: "Response exported as DOCX.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export response as DOCX.",
        variant: "destructive"
      });
    }  }, [messages, toast, selectedAgent, selectedModel]);
  return (
    <div className="min-h-screen bg-background relative overflow-hidden" {...getRootProps()}>
      {/* Advanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 via-transparent to-neon-blue/5" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-neon-green/3 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-neon-orange/3 rounded-full blur-3xl animate-pulse-slow delay-1000" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-neon-purple/2 rounded-full blur-2xl" />
      
      {/* Glassmorphic Container */}
      <div className="relative z-10 min-h-screen">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Modern Hero Section */}
          <div className="relative mb-8">
            <div className="glass-card border border-white/10 backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/[0.02] rounded-3xl p-8 text-center shadow-2xl">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-neon-purple/30 rounded-2xl blur-lg animate-pulse" />
                  <div className="relative p-4 rounded-2xl bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 border border-neon-purple/30">
                    <Brain className="text-neon-purple w-8 h-8 sm:w-10 sm:h-10" />
                  </div>
                </div>
                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-neon-purple via-neon-blue to-neon-green bg-clip-text text-transparent">
                  AI Assistant
                </h1>
              </div>
              <p className="text-lg sm:text-xl text-foreground/80 leading-relaxed max-w-3xl mx-auto mb-6">
                Your intelligent companion for analysis, research, coding, writing, and creative tasks
              </p>
              
              {/* Feature Pills */}
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                <div className="glass-pill bg-neon-green/10 border border-neon-green/20 text-neon-green">
                  <Zap className="w-4 h-4" />
                  <span>Smart Analysis</span>
                </div>
                <div className="glass-pill bg-neon-purple/10 border border-neon-purple/20 text-neon-purple">
                  <Bot className="w-4 h-4" />
                  <span>AI Powered</span>
                </div>
                <div className="glass-pill bg-neon-blue/10 border border-neon-blue/20 text-neon-blue">
                  <FileText className="w-4 h-4" />
                  <span>File Support</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Chat Interface Card */}
          <div className="glass-card border border-white/10 backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/[0.02] rounded-3xl overflow-hidden shadow-2xl">            <div className="flex flex-col h-[70vh] min-h-[600px]">
              {/* Modern Header with Controls */}
              <div className="border-b border-white/10 bg-gradient-to-r from-neon-purple/5 via-neon-blue/5 to-neon-green/5 p-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Agent Select */}
                    <div className="relative">
                      <Select
                        value={selectedAgent.id}
                        onValueChange={(value) => {
                          const agent = HELPER_AGENTS.find(a => a.id === value);
                          if (agent) setSelectedAgent(agent);
                        }}
                      >
                        <SelectTrigger className="glass-input min-w-[160px] h-10">
                          <div className="flex items-center gap-2 truncate">
                            {React.createElement(getAgentIcon(selectedAgent.icon), { className: "h-4 w-4 flex-shrink-0 text-neon-purple"})}
                            <span className="truncate font-medium">{selectedAgent.name}</span>
                          </div>
                        </SelectTrigger>
                        <SelectContent className="glass-dropdown">
                          {HELPER_AGENTS.map((agent) => {
                            const IconComponent = getAgentIcon(agent.icon);
                            return (
                              <SelectItem key={agent.id} value={agent.id} className="hover:bg-neon-purple/10">
                                <div className="flex items-center gap-2">
                                  <IconComponent className="w-4 h-4 text-neon-purple" />
                                  <span>{agent.name}</span>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Model Select */}
                    <div className="relative">
                      <Select
                        value={selectedModel.id}
                        onValueChange={(value) => {
                          const model = getModelById(value);
                          if (model) {
                            setSelectedModel(model);
                            if (isThinkingMode && !supportsThinking(model)) {
                              setIsThinkingMode(false);
                              toast({
                                title: "Thinking mode disabled",
                                description: `${model.name} doesn't support thinking mode. Switched to regular mode.`,
                                variant: "default"
                              });
                            }
                          }
                        }}
                      >
                        <SelectTrigger className="glass-input min-w-[180px] h-10">
                          <div className="flex items-center gap-2 truncate">
                            <Bot className="h-4 w-4 flex-shrink-0 text-neon-blue" />
                            <span className="truncate font-medium">{selectedModel.name}</span>
                          </div>
                        </SelectTrigger>
                        <SelectContent className="glass-dropdown">
                          {GEMINI_MODELS.map((model) => (
                            <SelectItem key={model.id} value={model.id} className="hover:bg-neon-blue/10">
                              <div className="flex items-center gap-2 w-full">
                                <span className="font-medium">{model.name}</span>
                                {model.provider === 'openrouter' ? (
                                  <Badge variant="outline" className="neon-badge-purple">
                                    No Search
                                  </Badge>
                                ) : model.supportsGrounding ? (
                                  <Badge variant="outline" className="neon-badge-blue">
                                    Web Search
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="neon-badge-purple">
                                    No Search
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Thinking Mode Toggle - Only show for compatible models */}
                    {supportsThinking(selectedModel) && (
                      <Button
                        variant={isThinkingMode ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsThinkingMode(!isThinkingMode)}
                        disabled={isProcessing}
                        className={cn(
                          "glass-button h-10 px-4",
                          isThinkingMode 
                            ? "bg-neon-purple/20 border-neon-purple/30 text-neon-purple hover:bg-neon-purple/30" 
                            : "hover:bg-neon-purple/10 hover:border-neon-purple/20"
                        )}
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Thinking Mode</span>
                        <span className="sm:hidden">Think</span>
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearConversation}
                      className="glass-button hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 h-10"
                      title="Clear conversation"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline ml-2">Clear</span>
                    </Button>
                  </div>
                </div>              </div>

              {/* Messages Area with Modern Design */}
              <ScrollArea className="flex-1 p-0">
                <div className="p-6">
                  {messages.length === 0 && uploadedFiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                      <div className="relative mb-8">
                        <div className="absolute inset-0 bg-neon-blue/20 rounded-full blur-xl animate-pulse" />
                        <div className="relative p-6 rounded-full bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 border border-neon-blue/30">
                          <Bot className="h-12 w-12 text-neon-blue" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-3">Ready to Assist</h3>
                      <p className="text-lg text-foreground/70 max-w-lg leading-relaxed mb-8">
                        Ask questions, upload files for analysis, or get help with any task
                      </p>
                      
                      {/* Capability Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
                        <div className="glass-card p-6 text-center border border-neon-green/20 hover:border-neon-green/40 transition-all duration-300 hover:shadow-lg hover:shadow-neon-green/10">
                          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-neon-green/20 flex items-center justify-center">
                            <Zap className="w-6 h-6 text-neon-green" />
                          </div>
                          <h4 className="font-semibold text-neon-green mb-2">Smart Analysis</h4>
                          <p className="text-sm text-foreground/60">Data analysis, research, and insights from any content</p>
                        </div>
                        
                        <div className="glass-card p-6 text-center border border-neon-purple/20 hover:border-neon-purple/40 transition-all duration-300 hover:shadow-lg hover:shadow-neon-purple/10">
                          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-neon-purple/20 flex items-center justify-center">
                            <Bot className="w-6 h-6 text-neon-purple" />
                          </div>
                          <h4 className="font-semibold text-neon-purple mb-2">Code & Development</h4>
                          <p className="text-sm text-foreground/60">Programming help, code review, and technical guidance</p>
                        </div>
                        
                        <div className="glass-card p-6 text-center border border-neon-orange/20 hover:border-neon-orange/40 transition-all duration-300 hover:shadow-lg hover:shadow-neon-orange/10 sm:col-span-2 lg:col-span-1">
                          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-neon-orange/20 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-neon-orange" />
                          </div>
                          <h4 className="font-semibold text-neon-orange mb-2">Content Creation</h4>
                          <p className="text-sm text-foreground/60">Writing, editing, and creative content assistance</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {messages.map((message) => (
                        <div key={message.id} className="group">
                          <div className={`flex gap-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'} items-start`}>
                            {/* Assistant Avatar */}
                            {message.type === 'assistant' && (
                              <div className="flex-shrink-0">
                                {message.isLoading || message.isThinking ? (
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 border border-neon-purple/30 flex items-center justify-center">
                                    <Bot className="h-5 w-5 text-neon-purple animate-pulse" />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 border border-neon-blue/30 flex items-center justify-center">
                                    <Bot className="h-5 w-5 text-neon-blue" />
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Message Content */}
                            <div className={`max-w-[85%] ${message.type === 'user' ? 'order-1' : ''}`}>
                              <div className={cn(
                                "rounded-2xl p-4 shadow-lg backdrop-blur-sm",
                                message.type === 'user' 
                                  ? 'bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 border border-neon-purple/30 ml-auto text-foreground' 
                                  : 'glass-card border border-white/10'
                              )}>
                                {message.isLoading ? (
                                  <div className="flex items-center gap-3">
                                    <div className="relative">
                                      <Bot className="h-5 w-5 text-neon-purple animate-spin" style={{ animationDuration: '2s' }} />
                                      <div className="absolute inset-0 bg-neon-purple/20 rounded-full blur animate-pulse" />
                                    </div>
                                    <span className="text-foreground/80">
                                      {message.isThinkingMode ? 'Thinking deeply...' : 'Generating response...'}
                                    </span>
                                  </div>
                                ) : message.isThinking ? (
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                      <Brain className="h-5 w-5 text-neon-purple animate-pulse" />
                                      <span className="text-sm font-medium text-neon-purple">Thinking Process</span>
                                    </div>
                                    <div className="glass-card bg-neon-purple/5 border border-neon-purple/20 rounded-xl p-4">
                                      <div className="whitespace-pre-wrap text-sm leading-relaxed break-words text-foreground/80">
                                        {cleanResponseFormatting(message.thinkingProcess)}
                                        <span className="animate-pulse text-neon-purple">▊</span>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    {/* Show completed thinking process if available */}
                                    {message.isThinkingMode && message.thinkingProcess && !message.isThinking && (
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                          <Brain className="h-5 w-5 text-neon-purple" />
                                          <span className="text-sm font-medium text-neon-purple">Reasoning</span>
                                        </div>
                                        <div className="glass-card bg-neon-purple/5 border border-neon-purple/20 rounded-xl p-4">
                                          <div className="whitespace-pre-wrap text-sm leading-relaxed break-words text-foreground/80">
                                            {cleanResponseFormatting(message.thinkingProcess)}
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Main content */}
                                    <div className="space-y-2">
                                      {(() => {
                                        const contentToRender = message.isThinkingMode ? (message.finalAnswer || message.content) : message.content;
                                        return (
                                          <MessageContent 
                                            content={contentToRender}
                                          />
                                        );
                                      })()}
                                    </div>
                                    
                                    {/* Attached files display */}
                                    {message.files && message.files.length > 0 && (
                                      <div className="space-y-2 border-t border-white/10 pt-3 mt-3">
                                        <p className="text-xs text-foreground/60">Attached files:</p>
                                        <div className="flex flex-wrap gap-2">
                                          {message.files.map((file, index) => (
                                            <div key={index} className="glass-pill bg-neon-blue/10 border border-neon-blue/20 text-neon-blue">
                                              <FileType className="h-3 w-3" />
                                              <span className="text-xs truncate max-w-[100px]" title={file.name}>
                                                {truncateFilename(file.name)}
                                              </span>
                                              <span className="text-xs text-foreground/50">({formatFileSize(file.size)})</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              {/* Message Actions */}
                              <div className={`flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-foreground/60 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}</span>
                                {message.type === 'assistant' && !message.isLoading && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const contentToCopy = message.isThinkingMode 
                                          ? (message.finalAnswer || message.content)
                                          : message.content;
                                        copyMessage(contentToCopy);
                                      }}
                                      className="h-6 w-6 p-0 hover:bg-neon-blue/10"
                                      title="Copy message"
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                    
                                    {/* Show actions only for the last assistant message */}
                                    {message.id === messages[messages.length - 1]?.id && (
                                      <>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={regenerateLastResponse}
                                          disabled={isProcessing}
                                          className="h-6 w-6 p-0 hover:bg-neon-green/10"
                                          title="Regenerate response"
                                        >
                                          {isProcessing ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                          ) : (
                                            <RotateCcw className="h-3 w-3" />
                                          )}
                                        </Button>
                                        
                                        {/* Export buttons */}
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={exportLatestResponseAsPDF}
                                          className="h-6 w-6 p-0 hover:bg-neon-orange/10"
                                          title="Export as PDF"
                                        >
                                          <Download className="h-3 w-3" />
                                        </Button>
                                      </>
                                    )}
                                  </>
                                )}
                                {message.agent && (
                                  <Badge variant="outline" className="neon-badge-purple text-xs px-2 py-0.5">
                                    {React.createElement(getAgentIcon(message.agent.icon), { className: "h-3 w-3 mr-1 inline-block" })}
                                    {message.agent.name}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* User Avatar */}
                            {message.type === 'user' && (
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-green/20 to-neon-blue/20 border border-neon-green/30 flex items-center justify-center">
                                  <User className="h-5 w-5 text-neon-green" />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>              </ScrollArea>

              {/* Modern Input Area */}
              <div className="border-t border-white/10 bg-gradient-to-r from-white/5 to-white/[0.02] backdrop-blur-sm p-6">
                {/* Staged Files Display */}
                {uploadedFiles.length > 0 && (
                  <div className="mb-4 p-4 glass-card border border-neon-blue/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <FileType className="h-4 w-4 text-neon-blue" />
                      <span className="text-sm font-medium text-neon-blue">Attached Files</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="glass-pill bg-neon-blue/10 border border-neon-blue/20 text-neon-blue pr-1">
                          <FileType className="h-3 w-3" />
                          <span className="text-sm truncate max-w-[120px]" title={file.name}>
                            {truncateFilename(file.name)}
                          </span>
                          <span className="text-xs text-foreground/50">({formatFileSize(file.size)})</span>
                          <button
                            onClick={() => removeStagedFile(index)}
                            className="ml-2 p-1 rounded-full hover:bg-red-500/20 hover:text-red-400 transition-colors"
                            title={`Remove ${file.name}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    {isUploading && (
                      <div className="flex items-center gap-2 mt-3 text-sm text-neon-blue">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Uploading... ({uploadProgress.toFixed(0)}%)</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Thinking Mode Indicator */}
                {isThinkingMode && (
                  <div className="mb-4 p-4 glass-card border border-neon-purple/20 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Brain className="h-5 w-5 text-neon-purple animate-pulse" />
                      <div>
                        <span className="text-sm font-medium text-neon-purple">Thinking Mode Active</span>
                        <p className="text-xs text-foreground/60">AI will show step-by-step reasoning process</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Input Container */}
                <div className="relative">
                  <div className="glass-card border border-white/20 rounded-2xl p-3 bg-gradient-to-r from-white/5 to-white/[0.02]">
                    <div className="flex items-end gap-3">
                      {/* File Upload Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={triggerFileInput}
                        disabled={isUploading || isProcessing}
                        className="glass-button h-10 w-10 p-0 hover:bg-neon-blue/10 hover:border-neon-blue/20"
                        title="Attach files"
                      >
                        {isUploading ? (
                          <Loader2 className="h-5 w-5 animate-spin text-neon-blue" />
                        ) : (
                          <Paperclip className="h-5 w-5 text-foreground/70 hover:text-neon-blue transition-colors" />
                        )}
                      </Button>
                      
                      {/* Text Input */}
                      <Textarea
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isThinkingMode ? "Ask anything... (thinking mode will show reasoning)" : "Ask anything..."}
                        className="flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-[40px] max-h-[120px] py-2 px-3 text-base placeholder:text-foreground/50"
                        disabled={isProcessing || isUploading}
                        rows={1}
                      />
                      
                      {/* Send/Stop Button */}
                      <Button
                        onClick={isProcessing && abortController ? stopGeneration : sendMessage}
                        disabled={!isProcessing && ((!currentMessage.trim() && uploadedFiles.length === 0) || !isServiceInitialized || isUploading)}
                        size="sm"
                        className={cn(
                          "h-10 w-10 p-0 rounded-xl transition-all duration-200",
                          isProcessing && abortController 
                            ? 'bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30' 
                            : 'glass-button bg-neon-purple/20 border-neon-purple/30 text-neon-purple hover:bg-neon-purple/30'
                        )}
                        title={isProcessing && abortController ? "Stop generation" : "Send message"}
                      >
                        {isProcessing && abortController ? (
                          <Square className="h-5 w-5" />
                        ) : isProcessing ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Send className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Help Text */}
                  <div className="text-center mt-3">
                    <p className="text-xs text-foreground/50">
                      AI can make mistakes, so double-check important information.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Drag and Drop Overlay */}
      {isDragActive && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
          <div className="glass-card border border-neon-blue/30 rounded-3xl p-12 text-center shadow-2xl max-w-md bg-gradient-to-br from-neon-blue/10 to-neon-purple/10">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-neon-blue/20 rounded-full blur-xl animate-pulse" />
              <div className="relative p-6 rounded-full bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 border border-neon-blue/30">
                <Upload className="h-12 w-12 text-neon-blue" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-neon-blue mb-2">Drop Files to Upload</h3>
            <p className="text-foreground/70">Release to add files to your conversation</p>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input {...getInputProps()} ref={fileInputRef} className="hidden" />
    </div>
  );
};

export default Helper;
