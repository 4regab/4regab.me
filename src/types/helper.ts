export interface AgentPrompt {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  icon: string;
  category: 'general' | 'coding' | 'math' | 'exam' | 'science' | 'humanities' | 'data' | 'business';
  supportedFormats: string[];
}

export interface GeminiModel {
  id: string;
  name: string;
  description: string;
  modelName: string;
  isDefault: boolean;
  supportsGrounding: boolean;
  supportsVision?: boolean; // Added vision support flag
  supportsImageGeneration?: boolean; // Added image generation support flag
  provider?: 'google' | 'openrouter'; // Added provider field
  apiUrl?: string; // For OpenRouter models
}

export interface HelperTask {
  id: string;
  title: string;
  content: string;
  selectedAgent: AgentPrompt;
  selectedModel: GeminiModel;
  files?: File[];
  response?: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  createdAt: Date;
  exportFormat?: 'pdf' | 'docx';
}

export interface GeminiFile {
  name: string;
  displayName: string;
  mimeType: string;
  sizeBytes: string;
  createTime: string;
  updateTime: string;
  expirationTime: string;
  sha256Hash: string;
  uri: string;
  state: 'PROCESSING' | 'ACTIVE' | 'FAILED';
}

export interface ExportOptions {
  format: 'pdf' | 'docx';
  fileName: string;
  includeTimestamp: boolean;
  includeBranding: boolean;
}

export interface HelperContextType {
  tasks: HelperTask[];
  currentTask: HelperTask | null;
  agents: AgentPrompt[];
  isProcessing: boolean;
  createTask: (title: string, content: string, agent: AgentPrompt, files?: File[]) => Promise<void>;
  processTask: (taskId: string) => Promise<void>;
  exportTask: (taskId: string, options: ExportOptions) => Promise<void>;
  deleteTask: (taskId: string) => void;
}
