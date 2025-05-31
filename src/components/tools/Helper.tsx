import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast as sonnerToast } from 'sonner';
import { useToast } from '@/hooks/use-toast';
import { Paperclip, Send, Trash2, Settings2, Info, X, Bot, User, AlertTriangle, CheckCircle2, ExternalLink, Key, Settings, Loader2, FileType, Copy, Upload, Brain, Zap, Square, Download, FileText, RotateCcw } from 'lucide-react';
import { GEMINI_MODELS, getDefaultModel, getModelById, getModelConfig } from '@/lib/gemini-models';
import { HELPER_AGENTS, getAgentById, getAgentIcon } from '@/lib/helper-agents';
import geminiService from '@/lib/gemini-service';
import { ExportService } from '@/lib/export-service';
// import { ragService, type DocumentChunk, type RAGContext } from '@/lib/rag-service'; // Removed RAG
import { type AgentPrompt, type GeminiModel, type GeminiFile, type HelperTask, type ExportOptions } from '@/types/helper';
import { cn } from '@/lib/utils';

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
  error?: string;
  // Reasoning mode fields
  isReasoningMode?: boolean;
  thinkingProcess?: string;
  finalAnswer?: string;
  isThinking?: boolean;
}

const LOCAL_STORAGE_CHAT_HISTORY_KEY = 'gemini_helper_chat_history';

// Helper function to parse reasoning mode response (new cleaner format)
function parseReasoningResponse(response: string): { thinkingProcess: string; finalAnswer: string } {
  // Look for <thinking> tags
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
  
  // Enhanced fallback: Look for explicit "Final answer:" markers first
  const finalAnswerRegex = /(?:final answer:|conclusion:|in essence,|in summary,)\s*/i;
  const finalAnswerMatch = response.search(finalAnswerRegex);
    if (finalAnswerMatch !== -1) {
    const thinkingProcess = cleanResponseFormatting(response.substring(0, finalAnswerMatch).trim());
    const finalAnswer = response.substring(finalAnswerMatch).trim();
    
    return {
      thinkingProcess: thinkingProcess || "Let me analyze this question step by step.",
      finalAnswer: cleanFinalAnswer(finalAnswer)
    };
  }
  
  // Enhanced fallback: try to identify reasoning patterns more aggressively
  const lines = response.split('\n');
  let thinkingSection = '';
  let answerSection = '';
  let inThinking = true; // Start in thinking mode
  let foundReasoningPattern = false;
  let transitionFound = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lowerLine = line.toLowerCase();
    
    // Check for transition markers that indicate final answer
    if (lowerLine.includes('final answer') || lowerLine.includes('conclusion') ||
        lowerLine.includes('in summary') || lowerLine.includes('therefore, the answer') ||
        lowerLine.includes('based on this analysis') || lowerLine.includes('so the answer') ||
        lowerLine.includes('in essence') || (lowerLine.startsWith('*') && i > lines.length * 0.5)) {
      inThinking = false;
      transitionFound = true;
      answerSection += line + '\n';
      continue;
    }
    
    // More aggressive indicators of reasoning/thinking (only if not already transitioned)
    if (inThinking && (lowerLine.includes('let me') || lowerLine.includes('first,') || 
        lowerLine.includes('step 1') || lowerLine.includes('step by step') ||
        lowerLine.includes('analyzing') || lowerLine.includes('considering') ||
        lowerLine.includes('to answer this') || lowerLine.includes('breaking down') ||
        lowerLine.includes('i need to') || lowerLine.includes('let\'s consider') ||
        lowerLine.match(/^\d+\./) || lowerLine.includes('here\'s a summary'))) {
      foundReasoningPattern = true;
    }
    
    if (inThinking) {
      thinkingSection += line + '\n';
    } else {
      answerSection += line + '\n';
    }
  }
    // If no clear transition found, split at around 60% mark
  if (!transitionFound && foundReasoningPattern) {
    const splitPoint = Math.floor(lines.length * 0.6);
    thinkingSection = cleanResponseFormatting(lines.slice(0, splitPoint).join('\n'));
    answerSection = lines.slice(splitPoint).join('\n');
  }
  
  // If no reasoning pattern found, create a basic thinking process
  if (!foundReasoningPattern || thinkingSection.trim().length < 20) {
    thinkingSection = cleanResponseFormatting("Let me analyze this question step by step.\n\n" + 
                     lines.slice(0, Math.max(1, Math.floor(lines.length * 0.4))).join('\n'));
    answerSection = lines.slice(Math.floor(lines.length * 0.4)).join('\n');
  }
    // Only format as reasoning if we found or created thinking content
  if (thinkingSection.trim()) {
    return {
      thinkingProcess: cleanResponseFormatting(thinkingSection.trim()),
      finalAnswer: cleanFinalAnswer(answerSection.trim()) || cleanFinalAnswer(response)
    };
  }
  
  // Last fallback: treat entire response as final answer
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
function cleanResponseFormatting(response: string): string {
  let cleaned = response;
  
  // Remove markdown formatting FIRST (before removing all asterisks)
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1'); // Remove bold formatting
  cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1'); // Remove italic formatting
  cleaned = cleaned.replace(/~~([^~]+)~~/g, '$1'); // Remove strikethrough
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1'); // Remove inline code formatting
  cleaned = cleaned.replace(/```[\s\S]*?```/g, (match) => {
    // Remove code block formatting but keep content
    return match.replace(/```[^\n]*\n?/g, '').replace(/```/g, '');
  });
    // Clean up bullet points - convert to simple dashes (before removing asterisks)
  cleaned = cleaned.replace(/^\s*[-*+]\s+/gm, '- ');
  
  // Remove numbered list formatting
  cleaned = cleaned.replace(/^\s*\d+\.\s+/gm, '');
    // NOW remove any remaining asterisks for completely plain text output
  cleaned = cleaned.replace(/\*/g, '');
  
  // Remove any remaining underscore emphasis
  cleaned = cleaned.replace(/_([^_]+)_/g, '$1');
  cleaned = cleaned.replace(/__([^_]+)__/g, '$1');    // Remove any emoji-asterisk combinations that might slip through
  cleaned = cleaned.replace(/[\u{1F600}-\u{1F64F}][\u{1F300}-\u{1F5FF}][\u{1F680}-\u{1F6FF}][\u{1F1E0}-\u{1F1FF}]\s*\*/gu, '');
  
  // Remove markdown headers
  cleaned = cleaned.replace(/^#{1,6}\s*/gm, '');
    // Remove markdown links but keep the text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  
  // Remove HTML tags if any, but preserve image tags
  cleaned = cleaned.replace(/<(?!\/?img\b)[^>]*>/g, '');
  
  // Remove any remaining special formatting characters
  cleaned = cleaned.replace(/[▊│]/g, ''); // Remove cursor and special chars
  
  // Clean up excessive spacing
  cleaned = cleaned.replace(/[ \t]{3,}/g, ' ');
  
  // Clean up excessive newlines but preserve paragraph breaks
  cleaned = cleaned.replace(/\n{4,}/g, '\n\n');
  cleaned = cleaned.replace(/\n{3}/g, '\n\n');
  
  // Remove trailing whitespace from lines
  cleaned = cleaned.replace(/[ \t]+$/gm, '');
  
  return cleaned.trim();
}

// Reasoning Mode System Prompt
const REASONING_MODE_SYSTEM_PROMPT = `You are an expert AI assistant in reasoning mode. You MUST always show your step-by-step thinking process for every response, no matter how simple the question.

Your primary objective is to deliver responses that are not only accurate but also demonstrate a clear, step-by-step reasoning process.

**Core Instructions & Reasoning Framework:**

1.  **Understand the Request:**
    *   Carefully analyze the user's query to fully grasp the underlying intent and all explicit and implicit requirements.
    *   If the query is ambiguous or lacks necessary information, identify the ambiguities and request clarification before proceeding. Do not make assumptions.

2.  **Chain-of-Thought Process (Mandatory):**
    *   For every query, you MUST generate a detailed, step-by-step thought process that leads to your final answer. 
    *   Clearly articulate each reasoning step. Explain *why* you are taking a particular step and *how* it contributes to the overall solution. 
    *   Use leading words like "First, I will...", "Next, I need to consider...", "Therefore, based on the previous step...", to structure your thought process. 

3.  **Information Analysis & Synthesis (If Applicable):**
    *   If the query involves analyzing provided data or documents:
        *   Identify the key pieces of information relevant to the query.
        *   Explain how you are interpreting this information.
        *   Synthesize the information logically to build your argument or solution.

4.  **Constraint Adherence:**
    *   Strictly adhere to all constraints mentioned in the user's query (e.g., output format, length restrictions, specific knowledge domains to include or exclude). 
    *   If constraints are conflicting or impossible to meet, state this clearly and explain why.

5.  **Accuracy and Fact-Checking (If Applicable for your use case):**
    *   Strive for the highest degree of accuracy.
    *   If external knowledge is required and you have access to it, verify your information.
    *   If you are making an inference or an assumption, clearly state it as such.

6.  **Output Formatting:**
    *   Present your final answer clearly and concisely after the chain-of-thought reasoning.
    *   If a specific output format is requested (e.g., JSON, list, summary), adhere to it strictly. 
    *   Use delimiters like '### Thought Process ###' and '### Final Answer ###' to clearly separate the reasoning from the final output. 


**Key Directives:**

*   **Decompose Complex Tasks:** Break down complex questions into smaller, manageable sub-problems. Address each sub-problem systematically. 
*   **Affirmative Directives:** Use "do" instead of "don't" where possible. For example, instead of "Don't be vague," use "Be specific and provide details." *   **Step-Back Questioning (Consider if useful for your tasks):** Before diving into a solution, ask yourself "What is the core question here?" or "What underlying principle is at play?"
*   **Self-Correction/Refinement (Consider for iterative tasks):** After generating an initial thought process, review it. Ask: "Is this logic sound? Are there any gaps? Can this be explained more clearly?" Some advanced techniques even involve asking the LLM to self-critique its output.

**Example of How to Use Delimiters (Illustrative):**

User Query: [User's Question]

### Thought Process ###
1.  [Step 1 of reasoning]
2.  [Step 2 of reasoning]
3.  [And so on...]


Even for simple questions, show some thinking process.]
</thinking>

[Your final answer only - no headers, no "Final Answer:", no special formatting]

CRITICAL RULES:
- ALWAYS include <thinking> tags with actual reasoning content
- Never leave <thinking> section empty
- Show your actual step-by-step thought process
- Final answer comes after </thinking> with no special formatting
- No "✅", "Final Answer:", or "##" markers in the final answer`;

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
  const [selectedModel, setSelectedModel] = useState<GeminiModel>(getDefaultModel());
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]); // Files staged for the next message
  const [geminiUploadedFiles, setGeminiUploadedFiles] = useState<GeminiFile[]>([]); // Files uploaded to Gemini service
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
    // API Key Management
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [openRouterApiKey, setOpenRouterApiKey] = useState<string>('');
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [geminiApiKeyInput, setGeminiApiKeyInput] = useState('');
  const [openRouterApiKeyInput, setOpenRouterApiKeyInput] = useState('');
  const [isServiceInitialized, setIsServiceInitialized] = useState(false);
  
  // Reasoning Mode
  const [isReasoningMode, setIsReasoningMode] = useState(false);

  // RAG state - REMOVED
  // const [ragDocuments, setRagDocuments] = useState<DocumentChunk[]>([]);
  // const [isProcessingRAG, setIsProcessingRAG] = useState(false);
  // const [ragStats, setRagStats] = useState<{ totalChunks: number; totalSources: number; sources: string[] }>({
  //   totalChunks: 0,
  //   totalSources: 0,
  //   sources: []
  // });
  // Load chat history and API keys from localStorage on component mount
  useEffect(() => {
    const savedGeminiApiKey = localStorage.getItem('gemini_api_key');
    const savedOpenRouterApiKey = localStorage.getItem('openrouter_api_key');
    
    if (savedGeminiApiKey) {
      setGeminiApiKey(savedGeminiApiKey);
      try {
        geminiService.initialize(savedGeminiApiKey, savedOpenRouterApiKey || '');
        setIsServiceInitialized(true);
      } catch (error) {
        console.error('Failed to initialize service with saved API keys:', error);
        localStorage.removeItem('gemini_api_key');
      }
    }
    
    if (savedOpenRouterApiKey) {
      setOpenRouterApiKey(savedOpenRouterApiKey);
    }

    const savedMessages = localStorage.getItem(LOCAL_STORAGE_CHAT_HISTORY_KEY);
    if (savedMessages) {
      try {
        const parsedMessages: ChatMessage[] = JSON.parse(savedMessages).map((msg: any) => ({
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
    }
  }, [messages]);
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  // Handle API key submission
  const handleApiKeySubmit = useCallback(() => {
    // Validate API keys based on selected model
    const needsGemini = selectedModel.provider === 'google' || !selectedModel.provider;
    const needsOpenRouter = selectedModel.provider === 'openrouter';
    
    if (needsGemini && !geminiApiKeyInput.trim()) {
      toast({
        title: "Gemini API Key Required",
        description: "Please enter a valid Gemini API key for Google models.",
        variant: "destructive",
      });
      return;
    }
    
    if (needsOpenRouter && !openRouterApiKeyInput.trim()) {
      toast({
        title: "OpenRouter API Key Required", 
        description: "Please enter a valid OpenRouter API key for OpenRouter models.",
        variant: "destructive",
      });
      return;
    }

    try {
      const geminiKey = geminiApiKeyInput.trim();
      const openRouterKey = openRouterApiKeyInput.trim();
      
      geminiService.initialize(geminiKey, openRouterKey);
      
      if (geminiKey) {
        setGeminiApiKey(geminiKey);
        localStorage.setItem('gemini_api_key', geminiKey);
      }
      
      if (openRouterKey) {
        setOpenRouterApiKey(openRouterKey);
        localStorage.setItem('openrouter_api_key', openRouterKey);
      }
      
      setIsServiceInitialized(true);
      setShowApiKeyDialog(false);
      setGeminiApiKeyInput('');
      setOpenRouterApiKeyInput('');
      
      toast({
        title: "API Keys Saved",
        description: "API keys have been saved successfully.",
      });
    } catch (error) {
      console.error('Failed to initialize service:', error);
      toast({
        title: "Invalid API Keys",
        description: "Failed to initialize with the provided API keys. Please check and try again.",
        variant: "destructive",
      });
    }
  }, [geminiApiKeyInput, openRouterApiKeyInput, selectedModel.provider, toast]);
  
  // Function to upload files to Gemini (can be called from onDrop or before sending message)
  const uploadFilesToGemini = useCallback(async (filesToUpload: File[]): Promise<GeminiFile[]> => {
    setIsUploading(true);
    setUploadProgress(0);
    const successfullyUploaded: GeminiFile[] = [];

    try {
      const supportedFiles = filesToUpload.filter(file => geminiService.isSupportedFileType(file));
      const unsupportedFiles = filesToUpload.filter(file => !geminiService.isSupportedFileType(file));

      if (unsupportedFiles.length > 0) {
        toast({
          title: "Unsupported Files",
          description: `${unsupportedFiles.length} file(s) are not supported and were skipped.`,
          variant: "default"
        });
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


      for (let i = 0; i < supportedFiles.length; i++) {
        const file = supportedFiles[i];
        try {
          const geminiFile = await geminiService.uploadFile(file);
          successfullyUploaded.push(geminiFile);
          setGeminiUploadedFiles(prev => [...prev, geminiFile]); // Add to the list of Gemini-uploaded files
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          toast({ title: `Upload Failed: ${file.name}`, description: (error as Error).message, variant: "destructive" });
        }
        setUploadProgress(((i + 1) / supportedFiles.length) * 100);
      }
      
      if (successfullyUploaded.length > 0) {
        toast({ title: "Files Uploaded", description: `${successfullyUploaded.length} files prepared for AI.` });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: "Upload Error", description: "An unexpected error occurred during file upload.", variant: "destructive" });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
    return successfullyUploaded;
  }, [toast]);
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!isServiceInitialized) {
      toast({ title: "API Key Required", description: "Please set up your API keys first.", variant: "destructive" });
      setGeminiApiKeyInput(geminiApiKey); // Populate with current API keys
      setOpenRouterApiKeyInput(openRouterApiKey);
      setShowApiKeyDialog(true);
      return;
    }

    const newLocalFiles = [...uploadedFiles, ...acceptedFiles];
    setUploadedFiles(newLocalFiles); // Add to staging files for the input area

    // Upload files immediately to Gemini
    if (acceptedFiles.length > 0) {
      await uploadFilesToGemini(acceptedFiles);
    }
  }, [uploadedFiles, toast, isServiceInitialized, geminiApiKey, openRouterApiKey, uploadFilesToGemini]);

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

    if (!isServiceInitialized) {
      setGeminiApiKeyInput(geminiApiKey); // Populate with current API keys
      setOpenRouterApiKeyInput(openRouterApiKey);
      setShowApiKeyDialog(true);
      return;
    }
    if (isProcessing) return;    // Check if we're trying to send images to a text-only model
    const hasImages = uploadedFiles.some(file => 
      file.type.startsWith('image/') || 
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name)
    );
    
    if (hasImages && selectedModel.supportsVision === false) {
      toast({
        title: "Model Limitation",
        description: `⚠️ ${selectedModel.name} doesn't support images. Please select a vision-capable model (marked with ⚡ Vision) or remove the image files.`,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    const messageContent = currentMessage.trim();
    const filesForThisMessage = [...uploadedFiles]; // Files staged in the input bar
    
    // Get files that are already uploaded to Gemini for this message
    let filesForGemini: GeminiFile[] = [];
    if (filesForThisMessage.length > 0) {
        // Filter gemini files to only include those relevant to this message
        filesForGemini = geminiUploadedFiles.filter(gf => 
            filesForThisMessage.some(lf => lf.name === gf.displayName)
        );
    }    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      type: 'user',
      content: messageContent || (filesForThisMessage.length > 0 ? `Analyzing ${filesForThisMessage.length} file(s)...` : '...'),
      timestamp: new Date(),
      files: filesForThisMessage.length > 0 ? filesForThisMessage : undefined,
      rawFiles: filesForThisMessage.length > 0 ? filesForThisMessage : undefined, // Add raw files for OpenRouter
    };

    const assistantMessageId = crypto.randomUUID();    const assistantMessagePlaceholder: ChatMessage = {
      id: assistantMessageId,
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      agent: selectedAgent,
      model: selectedModel,
      isLoading: true,
      isReasoningMode: isReasoningMode,
      isThinking: isReasoningMode,
      thinkingProcess: '',
      finalAnswer: '',
    };    setMessages(prev => [...prev, userMessage, assistantMessagePlaceholder]);
    setCurrentMessage('');
    setUploadedFiles([]); // Clear staged files from input bar
    
    try {
      // Build conversation history for multi-turn conversations
      // Use the messages before adding the current user message
      const MAX_HISTORY_MESSAGES = 20; // Adjust based on your needs
      const recentMessages = messages
        .filter(msg => 
          !msg.isLoading && 
          !msg.error && 
          !msg.isThinking && 
          msg.content.trim() && 
          msg.id !== assistantMessageId // Exclude the placeholder assistant message we just added
        ) 
        .slice(-MAX_HISTORY_MESSAGES) // Take only the most recent messages
        .map(msg => {
          // For reasoning mode messages, use the final answer in history
          const contentToUse = msg.isReasoningMode && msg.finalAnswer 
            ? msg.finalAnswer 
            : msg.content;
          
          return {
            role: msg.type === 'user' ? 'user' : 'model',
            parts: [{ text: contentToUse }]
          };
        })
        .filter(msg => msg.parts[0].text.trim()); // Ensure no empty content
      
      // Ensure the conversation alternates properly and starts with 'user'
      const cleanedHistory = [];
      let lastRole = null;
      
      for (const msg of recentMessages) {
        // Skip consecutive messages from the same role to maintain alternation
        if (msg.role !== lastRole) {
          cleanedHistory.push(msg);
          lastRole = msg.role;
        }
      }
      
      // Ensure the first message in history is from 'user' if history exists
      if (cleanedHistory.length > 0 && cleanedHistory[0].role !== 'user') {
        // Remove messages from the beginning until we find a user message or have no messages left
        while (cleanedHistory.length > 0 && cleanedHistory[0].role !== 'user') {
          cleanedHistory.shift();
        }
      }      // Debug: log conversation history state

      // Use the enhanced prompt as current message
      const currentPrompt = messageContent || `Please analyze the ${filesForGemini.length > 0 ? 'uploaded files' : 'previous context'} and provide insights.`;
        // Choose system prompt based on reasoning mode
      const systemPrompt = isReasoningMode ? REASONING_MODE_SYSTEM_PROMPT : selectedAgent.systemPrompt;
        // Use the new conversation history method if there's history, otherwise fall back to the original method
      // IMPORTANT: Image generation models don't support conversation history, so always use generateContent for them
      const response = (cleanedHistory.length > 0 && !selectedModel.supportsImageGeneration) 
        ? await geminiService.generateContentWithHistory(
            currentPrompt,
            systemPrompt,
            cleanedHistory,
            filesForGemini.length > 0 ? filesForGemini : undefined,
            selectedModel,
            filesForThisMessage.length > 0 ? filesForThisMessage : undefined // Pass raw files for OpenRouter
          )
        : await geminiService.generateContent(
            currentPrompt,
            systemPrompt,
            filesForGemini.length > 0 ? filesForGemini : undefined,
            selectedModel,
            filesForThisMessage.length > 0 ? filesForThisMessage : undefined // Pass raw files for OpenRouter
          );

      // Process response based on reasoning mode
      if (isReasoningMode) {
        // Parse reasoning mode response to separate thinking process from final answer
        const parsed = parseReasoningResponse(response);
        
        // First, stop the loading state and start showing thinking process
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { 
                ...msg, 
                isLoading: false,
                isThinking: true,
                isReasoningMode: true,
                thinkingProcess: '',
                finalAnswer: ''
              }
            : msg        ));
        
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
        const cleanedResponse = cleanResponseFormatting(response);
        
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: cleanedResponse, isLoading: false }
            : msg
        ));
      }
      
      // Clean up used files from geminiUploadedFiles
      if (filesForGemini.length > 0) {
        setGeminiUploadedFiles(prevGeminiFiles => 
            prevGeminiFiles.filter(gf => !filesForGemini.some(usedFile => usedFile.name === gf.name))        );
        // Delete them from Gemini service
        filesForGemini.forEach(gf => geminiService.deleteFile(gf.name).catch(console.error));
      }

    } catch (error) {
      console.error('Processing error:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { 
              ...msg, 
              content: 'Sorry, I encountered an error. Please check your API key, input, and try again.',
              isLoading: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          : msg
      ));
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [
    currentMessage, 
    uploadedFiles, 
    geminiUploadedFiles, 
    selectedAgent, 
    selectedModel, 
    isServiceInitialized, 
    isProcessing, 
    toast, 
    geminiApiKey, 
    openRouterApiKey, 
    isReasoningMode, 
    messages
  ]);
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
      
      // Create new assistant message placeholder
      const assistantMessageId = crypto.randomUUID();
      const assistantMessagePlaceholder: ChatMessage = {
        id: assistantMessageId,
        type: 'assistant',
        content: '',
        timestamp: new Date(),
        agent: lastUserMessage.agent || selectedAgent,
        model: lastUserMessage.model || selectedModel,
        isLoading: true,
        isReasoningMode: isReasoningMode,
        isThinking: isReasoningMode,
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
          .map(msg => {
            const contentToUse = msg.isReasoningMode && msg.finalAnswer 
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
        }

        const currentPrompt = lastUserMessage.content || `Please analyze the ${filesForGemini.length > 0 ? 'uploaded files' : 'previous context'} and provide insights.`;
        const systemPrompt = isReasoningMode ? REASONING_MODE_SYSTEM_PROMPT : (lastUserMessage.agent || selectedAgent).systemPrompt;
        const modelToUse = lastUserMessage.model || selectedModel;
          // Generate response
        // IMPORTANT: Image generation models don't support conversation history, so always use generateContent for them
        const response = (cleanedHistory.length > 0 && !modelToUse.supportsImageGeneration) 
          ? await geminiService.generateContentWithHistory(
              currentPrompt,
              systemPrompt,
              cleanedHistory,
              filesForGemini.length > 0 ? filesForGemini : undefined,
              modelToUse,
              lastUserMessage.files || undefined
            )
          : await geminiService.generateContent(
              currentPrompt,
              systemPrompt,
              filesForGemini.length > 0 ? filesForGemini : undefined,
              modelToUse,
              lastUserMessage.files || undefined
            );

        // Process response based on reasoning mode
        if (isReasoningMode) {
          const parsed = parseReasoningResponse(response);
          
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId 
              ? { 
                  ...msg, 
                  isLoading: false,
                  isThinking: true,
                  isReasoningMode: true,
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
        ));
        toast({
          title: "Regeneration Failed",
          description: error instanceof Error ? error.message : "An error occurred during regeneration.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    };

    // Execute regeneration
    regenerateMessage();
    
  }, [messages, isProcessing, selectedAgent, selectedModel, toast, isReasoningMode, geminiUploadedFiles]);

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
    // Delete all files from Gemini service that might be orphaned
    geminiUploadedFiles.forEach(gf => geminiService.deleteFile(gf.name).catch(console.error));

    localStorage.removeItem(LOCAL_STORAGE_CHAT_HISTORY_KEY);
    toast({ title: "Conversation Cleared", description: "All messages and chat history have been removed." });
  }, [toast, geminiUploadedFiles]);
  const triggerFileInput = () => {
    // Try both approaches to ensure file dialog opens
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      openFileDialog();
    }
  };
  
  // Helper to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    } else if (bytes >= 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    } else {
      return bytes + ' B';
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

    try {
      const contentToExport = lastMessage.isReasoningMode 
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

    try {
      const contentToExport = lastMessage.isReasoningMode 
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
    }
  }, [messages, toast, selectedAgent, selectedModel]);  // Helper function to parse content and extract images
  function parseContentWithImages(content: string): { text: string; images: string[] } {
    const images: string[] = [];
    let text = content;
    
    // Find markdown image patterns: ![alt text](data:image/...)
    const markdownImageRegex = /!\[([^\]]*)\]\((data:image\/[^;]+;base64,[^)]+)\)/g;
    let match;
    
    while ((match = markdownImageRegex.exec(content)) !== null) {
      images.push(match[2]); // Extract the data URL
      // Replace the markdown image with a placeholder
      text = text.replace(match[0], `[Image ${images.length}]`);
    }
    
    // Find HTML image patterns: <img src="data:image/..." ... />
    const htmlImageRegex = /<img[^>]+src="(data:image\/[^;]+;base64,[^"]+)"[^>]*\/?>/g;
    
    while ((match = htmlImageRegex.exec(content)) !== null) {
      images.push(match[1]); // Extract the data URL
      // Replace the HTML image with a placeholder
      text = text.replace(match[0], `[Image ${images.length}]`);
    }
    
    return { text: text.trim(), images };
  }

  // Component to render images
  function ImageDisplay({ images }: { images: string[] }) {
    if (images.length === 0) return null;
    
    return (
      <div className="mt-3 space-y-2">
        {images.map((imageData, index) => (
          <div key={index} className="border rounded-lg overflow-hidden bg-muted/50">
            <img 
              src={imageData}
              alt={`Generated Image ${index + 1}`}
              className="w-full max-w-md rounded-lg shadow-sm"
              style={{ maxHeight: '400px', objectFit: 'contain' }}
              onError={(e) => {
                console.error('Failed to load image:', e);
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <div className="p-2 text-xs text-muted-foreground bg-muted/30">
              Generated Image {index + 1}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background" {...getRootProps()}>
      {/* Header: Agent/Model Select, API Key, Clear Chat */}
      <header className="flex items-center justify-between p-3 border-b border-border sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Agent Select */}
          <Select
            value={selectedAgent.id}
            onValueChange={(value) => {
              const agent = HELPER_AGENTS.find(a => a.id === value);
              if (agent) setSelectedAgent(agent);
            }}
          >
            <SelectTrigger className="w-auto h-9 text-xs sm:text-sm px-2 sm:px-3 min-w-[120px] max-w-[200px]">
              <div className="flex items-center gap-1.5 truncate">
                {React.createElement(getAgentIcon(selectedAgent.icon), { className: "h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0"})}
                <span className="truncate hidden sm:inline">{selectedAgent.name}</span>
                <span className="truncate sm:hidden">Agent</span>

              </div>
            </SelectTrigger>
            <SelectContent>
              {HELPER_AGENTS.map((agent) => {
                const IconComponent = getAgentIcon(agent.icon);
                return (
                  <SelectItem key={agent.id} value={agent.id}>
                    <div className="flex items-center gap-2">
                      <IconComponent size={16} />
                      <span>{agent.name}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {/* Model Select */}
          <Select
            value={selectedModel.id}
            onValueChange={(value) => {
              const model = getModelById(value);
              if (model) setSelectedModel(model);
            }}
          >
            <SelectTrigger className="w-auto h-9 text-xs sm:text-sm px-2 sm:px-3 min-w-[120px] max-w-[200px]">
               <div className="flex items-center gap-1.5 truncate">
                <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate hidden sm:inline">{selectedModel.name}</span>
                <span className="truncate sm:hidden">Model</span>
              </div>
            </SelectTrigger>            <SelectContent>
              {GEMINI_MODELS.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center gap-2 w-full">
                    <span className="font-medium text-sm">{model.name}</span>                      {model.provider === 'openrouter' ? (
                        <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-purple-50 text-purple-700 border-purple-200">
                          No Search
                        </Badge>
                      ) : model.supportsGrounding ? (
                        <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 border-blue-200">
                          Web Search
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-purple-50 text-purple-700 border-purple-200">
                          No Search
                        </Badge>
                      )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-9 px-2 text-muted-foreground hover:text-foreground">
                        <Info className="h-4 w-4"/>
                    </Button>
                </PopoverTrigger>                <PopoverContent className="w-64 text-sm">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">{selectedModel.name}</h4>
                        <div className="flex items-center gap-1">
                          {selectedModel.supportsGrounding ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                              <span className="text-xs text-green-600">Google Search enabled</span>
                            </>
                          ) : (
                            <>
                              <Bot className="h-3.5 w-3.5 text-blue-500" />
                              <span className="text-xs text-blue-600">Standard AI model</span>
                            </>
                          )}
                        </div>
                    </div>
                </PopoverContent></Popover>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
          {!isServiceInitialized && (             <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setGeminiApiKeyInput(geminiApiKey); // Populate with current API keys
                  setOpenRouterApiKeyInput(openRouterApiKey);
                  setShowApiKeyDialog(true);
                }}
                className="h-9 px-2 sm:px-3 text-xs sm:text-sm border-yellow-500/50 text-yellow-600 hover:bg-yellow-500/10 hover:text-yellow-500"
              >
                <Key className="mr-0 sm:mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Set API Keys</span>
              </Button>
          )}          {isServiceInitialized && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setGeminiApiKeyInput(geminiApiKey); // Populate with current API keys
                  setOpenRouterApiKeyInput(openRouterApiKey);
                  setShowApiKeyDialog(true);
                }}
                className="h-9 w-9 text-muted-foreground hover:text-foreground"
                title="API Key Settings"
              >
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={clearConversation}
                className="h-9 w-9 text-muted-foreground hover:text-destructive"
                title="Delete Chat"
              >
                <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-0" id="messages-scroll-area">
         <div className="max-w-4xl mx-auto px-2 sm:px-4 pb-4"> {/* Added pb-4 for spacing from input */}
          {messages.length === 0 && uploadedFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full pt-16 text-center">
              <Bot className="h-16 w-16 text-muted-foreground/50 mb-6" />
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">What can I help with?</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Ask questions, upload files for analysis, or get assistance with various tasks.
                Start by typing a message or attaching files below.
              </p>
            </div>
          ) : (
            <div className="space-y-6 pt-6"> {/* Added pt-6 */}
              {messages.map((message) => (
                <div key={message.id} className="group">
                  <div className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.type === 'assistant' && (
                      <div className="flex-shrink-0 self-end mb-2"> {/* Align with bottom of message bubble */}
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                    )}
                    
                    <div className={`max-w-[85%] sm:max-w-[80%] ${message.type === 'user' ? 'order-1' : ''}`}>
                      <div className={cn(
                        "rounded-xl p-3 sm:p-4 shadow-sm",
                        message.type === 'user' 
                          ? 'bg-primary text-primary-foreground ml-auto' // Removed ml-12, rely on justify-end
                          : 'bg-muted'
                      )}>                        {message.isLoading ? (
                          <div className="flex items-center gap-2 text-sm">
                            {message.isReasoningMode ? (
                              <Brain className="h-4 w-4 animate-pulse" />
                            ) : (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            <span>{message.isReasoningMode ? 'Thinking...' : 'Processing...'}</span>
                          </div>
                        ) : message.isThinking ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Brain className="h-3 w-3 animate-pulse" />
                              <span>Thinking...</span>
                            </div>                            <div className="bg-muted/50 border border-border/30 rounded-lg p-3">
                              <div className="whitespace-pre-wrap text-sm leading-relaxed break-words text-muted-foreground">
                                {cleanResponseFormatting(message.thinkingProcess)}
                                <span className="animate-pulse">▊</span>
                              </div>
                            </div>
                          </div>                        ) : (
                          <div className="space-y-3">
                            {/* Show thinking process only when actively thinking */}
                            {message.isReasoningMode && message.thinkingProcess && message.isThinking && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Brain className="h-3 w-3" />
                                  <span>Thinking process</span>
                                </div>                                <div className="bg-muted/50 border border-border/30 rounded-lg p-3">
                                  <div className="whitespace-pre-wrap text-sm leading-relaxed break-words text-muted-foreground">
                                    {cleanResponseFormatting(message.thinkingProcess)}
                                  </div>
                                </div>
                              </div>
                            )}                              {/* Main content (final answer in reasoning mode, or full content otherwise) */}
                            <div className="space-y-2">
                              {(() => {
                                const contentToRender = message.isReasoningMode ? (message.finalAnswer || message.content) : message.content;
                                const { text, images } = parseContentWithImages(contentToRender);
                                
                                return (
                                  <>
                                    <div className="whitespace-pre-wrap text-sm leading-relaxed break-words">
                                      {cleanResponseFormatting(text)}
                                    </div>
                                    <ImageDisplay images={images} />
                                  </>
                                );
                              })()}
                            </div>
                              {/* Show reasoning mode indicator for assistant messages (legacy support) */}
                            {message.type === 'assistant' && !message.isReasoningMode && (message.content.includes('🧠 Reasoning Process:') || message.content.includes('🧠 AI Response (Reasoning Mode):')) && (
                              <div className="flex items-center gap-1.5 text-xs text-primary/70 bg-primary/5 px-2 py-1 rounded">
                                <Brain className="h-3 w-3" />
                                <span>Reasoning Mode Response</span>
                              </div>
                            )}
                            
                            {message.files && message.files.length > 0 && (
                              <div className="space-y-2 border-t border-border/50 pt-3 mt-3">
                                <p className="text-xs opacity-80">Attached files:</p>                                {message.files.map((file, index) => (
                                  <div key={index} className="flex items-center gap-2 text-xs bg-black/10 dark:bg-white/5 p-1.5 rounded">
                                    <FileType className="h-3.5 w-3.5 opacity-70" />
                                    <span className="truncate" title={file.name}>
                                      {truncateFilename(file.name)}
                                    </span>
                                    <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                                      {formatFileSize(file.size)}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className={`flex items-center gap-2 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-muted-foreground ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}</span>                        {message.type === 'assistant' && !message.isLoading && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {                              const contentToCopy = message.isReasoningMode 
                                ? (message.finalAnswer || message.content) // Only copy final answer for reasoning mode
                                : message.content;
                              copyMessage(contentToCopy);
                            }}
                              className="h-6 w-6"
                              title="Copy message"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>                            {/* Show regenerate and export buttons only for the last assistant message */}
                            {message.id === messages[messages.length - 1]?.id && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={regenerateLastResponse}
                                  disabled={isProcessing}
                                  className="h-6 w-6"                                  title="Regenerate response"
                                >
                                  {isProcessing ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <RotateCcw className="h-3 w-3" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={exportLatestResponseAsPDF}
                                  className="h-6 w-6"
                                  title="Export as PDF"
                                >
                                  <Download className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={exportLatestResponseAsDOCX}
                                  className="h-6 w-6"
                                  title="Export as DOCX"
                                >
                                  <FileText className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                          </>
                        )}{message.agent && (
                          <Badge variant="outline" className="text-xs px-1.5 py-0.5 font-normal">
                            {React.createElement(getAgentIcon(message.agent.icon), { className: "h-3 w-3 mr-1 inline-block" })}
                            {message.agent.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {message.type === 'user' && (
                       <div className="flex-shrink-0 self-end mb-2"> {/* Align with bottom of message bubble */}
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-4 w-4" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area - New Design */}
      <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky bottom-0 z-10">
        <div className="max-w-4xl mx-auto p-3 sm:p-4">
          {/* Staged Files Display */}
          {uploadedFiles.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2 items-center max-h-24 overflow-y-auto p-2 bg-muted/50 rounded-md">              {uploadedFiles.map((file, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1.5 pr-1 group text-xs sm:text-sm bg-muted/80 border-muted-foreground/20 text-foreground">
                  <FileType className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate max-w-[100px] sm:max-w-[150px]" title={file.name}>
                    {truncateFilename(file.name)}
                  </span>
                  <span className="text-muted-foreground/70">({formatFileSize(file.size)})</span>
                  <button
                    onClick={() => removeStagedFile(index)}
                    className="ml-1 opacity-50 group-hover:opacity-100 hover:text-destructive p-0.5 rounded-full hover:bg-destructive/10"
                    title={`Remove ${file.name}`}
                  >
                    <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </button>
                </Badge>
              ))}

               {isUploading && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Uploading... ({uploadProgress.toFixed(0)}%)</span>
                </div>
              )}
            </div>
          )}          {/* Reasoning Mode Indicator */}
          {isReasoningMode && (
            <div className="mb-2 flex items-center gap-2 p-2 bg-primary/10 rounded-md border border-primary/20">
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary font-medium">Reasoning Mode Active</span>
              <span className="text-xs text-primary/70">AI will show step-by-step thinking process</span>
            </div>
          )}

          <div className="relative flex items-end gap-2 bg-muted/70 rounded-xl p-1.5 sm:p-2 shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              onClick={triggerFileInput}
              disabled={isUploading || isProcessing}
              className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 text-muted-foreground hover:text-primary"
              title="Attach files"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              ) : (
                <Paperclip className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </Button>
            
            <Button
              variant={isReasoningMode ? "default" : "ghost"}
              size="icon"
              onClick={() => setIsReasoningMode(!isReasoningMode)}
              disabled={isProcessing}
              className={cn(
                "h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0",
                isReasoningMode 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : "text-muted-foreground hover:text-primary"
              )}
              title={isReasoningMode ? "Reasoning mode enabled - AI will show step-by-step thinking" : "Enable reasoning mode"}
            >
              <Brain className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            
            <Textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isReasoningMode ? "Ask anything... (reasoning mode will show step-by-step thinking)" : "Ask anything..."}
              className="flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-[24px] max-h-[120px] self-center py-2 sm:py-2.5 px-2 text-sm sm:text-base placeholder:text-muted-foreground/70"
              disabled={isProcessing || isUploading}
              rows={1}            />
            {isProcessing && abortController && (
              <Button
                onClick={stopGeneration}
                className="h-9 w-9 sm:h-10 sm:w-10 p-0 flex-shrink-0 rounded-lg mr-2"
                size="icon"
                variant="destructive"
                title="Stop generation"
              >
                <Square className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            )}
            <Button
              onClick={sendMessage}
              disabled={(!currentMessage.trim() && uploadedFiles.length === 0) || isProcessing || !isServiceInitialized || isUploading}
              className="h-9 w-9 sm:h-10 sm:w-10 p-0 flex-shrink-0 rounded-lg"
              size="icon"
              title="Send message"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              ) : (
                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
              )}            </Button>
          </div>
          
          {/* User Guidance Reminder */}
          <div className="text-center mt-2">
            <p className="text-xs text-muted-foreground/60">
              AI can make mistakes, so double-check it.
            </p>
          </div>
        </div>
      </div>

      {/* Drag and Drop Overlay */}
      {isDragActive && (
        <div className="fixed inset-0 bg-primary/10 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border-2 border-dashed border-primary rounded-xl p-8 text-center shadow-2xl max-w-md">
            <Upload className="h-12 w-12 sm:h-16 sm:w-16 text-primary mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-primary mb-2">Drop files to upload</h3>
            <p className="text-sm text-muted-foreground">Release to add files to your conversation</p>
          </div>
        </div>
      )}

      {/* Hidden file input for dropzone and direct click */}
      <input {...getInputProps()} ref={fileInputRef} className="hidden" />      {/* API Key Dialog */}
      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>API Key Configuration</DialogTitle>
            <DialogDescription>
              Configure your API keys for Google Gemini and OpenRouter models. Your keys are stored locally.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Gemini API Key Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-blue-500" />
                <h4 className="font-medium text-sm">Google Gemini API Key</h4>
                <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 border-blue-200">
                  Required for Google models
                </Badge>
              </div>
              <Input
                type="password"
                placeholder="Enter your Gemini API key"
                value={geminiApiKeyInput}
                onChange={(e) => setGeminiApiKeyInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleApiKeySubmit(); }}
              />
              <div className="text-xs text-muted-foreground">
                Get your API key from{' '}
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Google AI Studio
                </a>
                . Enable the Generative Language API.
              </div>
            </div>

            {/* OpenRouter API Key Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-purple-500" />
                <h4 className="font-medium text-sm">OpenRouter API Key</h4>
                <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-purple-50 text-purple-700 border-purple-200">
                  Required for OpenRouter models
                </Badge>
              </div>
              <Input
                type="password"
                placeholder="Enter your OpenRouter API key"
                value={openRouterApiKeyInput}
                onChange={(e) => setOpenRouterApiKeyInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleApiKeySubmit(); }}
              />
              <div className="text-xs text-muted-foreground">
                Get your API key from{' '}
                <a 
                  href="https://openrouter.ai/keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-500 hover:underline"
                >
                  OpenRouter
                </a>
                . Free tier includes access to multiple models.
              </div>
            </div>

            {/* Current Model Info */}
            <div className="bg-muted/50 border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Current Model</span>
              </div>              <div className="flex items-center gap-2">
                <span className="text-sm">{selectedModel.name}</span>
                {selectedModel.provider === 'openrouter' ? (
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-purple-50 text-purple-700 border-purple-200">
                    No Web Search
                  </Badge>
                ) : selectedModel.supportsGrounding ? (
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 border-blue-200">
                    Web Search
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-purple-50 text-purple-700 border-purple-200">
                    No Web Search
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedModel.provider === 'openrouter' 
                  ? 'This model requires an OpenRouter API key.' 
                  : 'This model requires a Google Gemini API key.'
                }
              </p>
            </div>

            <div className="text-xs text-muted-foreground">
              <strong>Privacy:</strong> Your API keys are stored locally in your browser's local storage and are never sent to our servers.
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => { 
                setShowApiKeyDialog(false); 
                setGeminiApiKeyInput(''); 
                setOpenRouterApiKeyInput('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleApiKeySubmit}>Save API Keys</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Helper;
