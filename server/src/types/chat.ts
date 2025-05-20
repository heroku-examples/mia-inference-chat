import { ModelConfig, ErrorResponse } from './shared.js';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  model: string;
  reasoning?: boolean;
  agents?: string[];
  stream?: boolean;
}

export interface ChatRequestBody {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  tools?: {
    type: string;
    name: string;
  }[];
  extended_thinking?: {
    enabled: boolean;
    budget_tokens: number;
    include_reasoning: boolean;
  };
}

export type { ModelConfig, ErrorResponse };
