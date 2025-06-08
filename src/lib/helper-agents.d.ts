import { AgentPrompt } from '@/types/helper';
export declare const HELPER_AGENTS: AgentPrompt[];
export declare function getAgentById(id: string): AgentPrompt | undefined;
export declare function getAgentsByCategory(category: AgentPrompt['category']): AgentPrompt[];
export declare function getAgentIcon(iconName: string): any;
