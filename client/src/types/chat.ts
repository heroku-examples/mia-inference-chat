import React from 'react';
export type AgentType =
  | 'html_to_markdown'
  | 'pdf_to_markdown'
  | 'code_exec_python'
  | 'code_exec_node'
  | 'code_exec_ruby'
  | 'code_exec_go';

export type Agent = {
  id: AgentType;
  name: string;
  icon: React.ElementType;
};

export type ModelType = 'claude-3-7-sonnet' | 'claude-3-5-sonnet-latest' | 'stable-image-ultra';

interface BaseImageRequest {
  prompt: string;
  aspect_ratio: string;
  negative_prompt?: string;
  seed?: number;
}

export interface ImageGenerationParams extends BaseImageRequest {
  model: 'stable-image-ultra';
}

export interface ImageGenerationResponse {
  data: {
    b64_json: string;
    revised_prompt: string;
  }[];
}

export type MessageRole = 'user' | 'assistant' | 'agent';
export type MessageType = 'text' | 'image';

export interface Message {
  role: MessageRole;
  content: string;
  type?: MessageType;
  image_url?: string;
  reasoning?: {
    thinking: string;
  };
  tool_calls?: {
    id: string;
    type: string;
    function: {
      name: string;
      arguments: string;
    };
  }[];
  is_tool_message?: boolean;
}

export interface ChatError {
  message: string;
  code?: string;
}

export interface StreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  system_fingerprint: string;
  choices: {
    delta: {
      content: string | null;
      tool_calls:
        | {
            id: string;
            type: string;
            function: {
              name: string;
              arguments: string;
            };
          }[]
        | null;
      role: string;
      reasoning?: {
        thinking: string;
      };
    };
    message: {
      content: string;
      tool_calls:
        | {
            id: string;
            type: string;
            function: {
              name: string;
              arguments: string;
            };
          }[]
        | null;
      role: string;
      reasoning?: {
        thinking: string;
      };
    };
    finish_reason: string;
    index: number;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface UseCustomChatProps {
  model: ModelType;
  reasoning: boolean;
  agents: AgentType[];
  historyLimit?: number;
}
