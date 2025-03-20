import { AgentType } from '@/types/chat';
import React, { useRef, useState } from 'react';

export type ModelType = 'claude-3-7-sonnet' | 'claude-3-5-sonnet-latest';
export type MessageRole = 'user' | 'assistant';

export interface Message {
  role: MessageRole;
  content: string;
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
}

export interface ChatError {
  message: string;
  code?: string;
}

interface StreamChunk {
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

interface UseCustomChatProps {
  model: ModelType;
  reasoning: boolean;
  agents: AgentType[];
  historyLimit?: number;
}

export function useCustomChat({ model, reasoning, agents, historyLimit = 6 }: UseCustomChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState<ChatError | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const clearMessages = (newMessages: Message[] | ((prev: Message[]) => Message[])) => {
    const finalMessages = typeof newMessages === 'function' ? newMessages(messages) : newMessages;
    setMessages(finalMessages);
    if (finalMessages.length === 0) {
      setError(null);
      setStatus('idle');
    }
  };

  const stop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setStatus('idle');
    }
  };

  const handleChatRequest = async (messageContent: string, previousMessages: Message[]) => {
    const userMessage: Message = { role: 'user', content: messageContent };
    setMessages(prev => [...prev, userMessage]);
    setError(null);
    setStatus('loading');

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    try {
      const recentMessages = [...previousMessages, userMessage].slice(-historyLimit);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: recentMessages,
          model,
          reasoning,
          agents,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details || errorData.error || `Request failed with status ${response.status}`
        );
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';
      let accumulatedReasoning = '';
      let accumulatedToolCalls: NonNullable<Message['tool_calls']> = [];
      let hasToolCalls = false;

      const assistantMessage: Message = {
        role: 'assistant',
        content: '',
        reasoning: reasoning ? { thinking: '' } : undefined,
        tool_calls: undefined,
      };
      setMessages(prev => [...prev, assistantMessage]);

      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const data = line.replace(/^data:\s?/, '');

            if (data === '[DONE]') continue;

            try {
              const chunk: StreamChunk = JSON.parse(data);
              const content =
                chunk.choices[0]?.delta?.content || chunk.choices[0]?.message?.content;
              const reasoningDelta = chunk.choices[0]?.delta?.reasoning?.thinking;
              const toolCallsDelta =
                chunk.choices[0]?.delta?.tool_calls || chunk.choices[0]?.message?.tool_calls;

              console.log('Chunk received:', {
                content: content !== null && content !== undefined ? 'present' : 'absent',
                reasoning: reasoningDelta !== undefined ? 'present' : 'absent',
                toolCalls: toolCallsDelta !== undefined ? toolCallsDelta : 'absent',
              });

              if (content !== null && content !== undefined) {
                if (accumulatedContent && !accumulatedContent.endsWith('\n')) {
                  accumulatedContent += '\n';
                }
                accumulatedContent += content;
              }

              if (reasoningDelta !== undefined) {
                accumulatedReasoning += reasoningDelta;
              }

              if (toolCallsDelta !== null && toolCallsDelta !== undefined) {
                hasToolCalls = true;
                // Only add new tool calls that aren't already in the accumulated list
                const newToolCalls = toolCallsDelta.filter(
                  newTool =>
                    !accumulatedToolCalls.some(existingTool => existingTool.id === newTool.id)
                );
                accumulatedToolCalls = [...accumulatedToolCalls, ...newToolCalls];
                console.log('Tool calls state:', {
                  hasToolCalls,
                  accumulatedToolCalls,
                  newToolCallsCount: newToolCalls.length,
                });
              }

              setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage: Message = {
                  role: 'assistant',
                  content: accumulatedContent,
                  reasoning: reasoning ? { thinking: accumulatedReasoning } : undefined,
                  tool_calls: hasToolCalls ? accumulatedToolCalls : undefined,
                };
                console.log('Updating message:', {
                  hasContent: !!lastMessage.content,
                  hasReasoning: !!lastMessage.reasoning,
                  hasToolCalls: !!lastMessage.tool_calls,
                  toolCallsCount: lastMessage.tool_calls?.length,
                });
                newMessages[newMessages.length - 1] = lastMessage;
                return newMessages;
              });
            } catch (e) {
              console.error('Error parsing chunk:', e);
            }
          }
        }
      }

      setStatus('idle');
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setStatus('idle');
          return;
        }
        setError({ message: err.message });
      } else {
        setError({ message: 'An unknown error occurred' });
      }
      setStatus('error');
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;
    await handleChatRequest(input, messages);
    setInput('');
  };

  const reload = async () => {
    if (messages.length > 0 && status !== 'loading') {
      const lastUserMessageIndex = messages.findLastIndex(msg => msg.role === 'user');
      if (lastUserMessageIndex !== -1) {
        const lastUserMessage = messages[lastUserMessageIndex];
        // Keep all messages up to (but not including) the last user message
        const updatedMessages = messages.slice(0, lastUserMessageIndex);
        setMessages(updatedMessages);
        setStatus('loading'); // Set loading state immediately
        await handleChatRequest(lastUserMessage.content, updatedMessages);
      }
    }
  };

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    error,
    status,
    stop,
    reload,
    setMessages: clearMessages,
  };
}
