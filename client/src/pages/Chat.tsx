import React, { useEffect, useRef, useState } from 'react';
import { PaperAirplaneIcon, StopIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import ReactMarkdown, { Components } from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { LoadingDots } from '@/components/LoadingDots';
import { CodeBlock } from '@/components/CodeBlock';
import { AgentToggle } from '@/components/AgentToggle';
import { AGENTS } from '@/constants/agents';
import type { AgentType } from '@/types/chat';
import { type Message, type ModelType, useCustomChat } from '@/hooks/useCustomChat';

const MODELS: { id: ModelType; name: string }[] = [
  { id: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet' },
  { id: 'claude-3-5-sonnet-latest', name: 'Claude 3.5 Sonnet' },
];

const markdownComponents: Components = {
  code: CodeBlock,
  p: ({ children, ...props }: React.ComponentPropsWithoutRef<'p'>) => (
    <p className="mb-3 last:mb-0 text-gray-800" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }: React.ComponentPropsWithoutRef<'ul'>) => (
    <ul className="list-disc list-inside mb-3 text-gray-800" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: React.ComponentPropsWithoutRef<'ol'>) => (
    <ol className="list-decimal list-inside mb-3 text-gray-800" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: React.ComponentPropsWithoutRef<'li'>) => (
    <li className="mb-1 text-gray-800" {...props}>
      {children}
    </li>
  ),
  a: ({ href, children, ...props }: React.ComponentPropsWithoutRef<'a'>) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline"
      {...props}
    >
      {children}
    </a>
  ),
  blockquote: ({ children, ...props }: React.ComponentPropsWithoutRef<'blockquote'>) => (
    <blockquote className="border-l-2 border-gray-300 pl-4 italic my-3 text-gray-700" {...props}>
      {children}
    </blockquote>
  ),
  h1: ({ children, ...props }: React.ComponentPropsWithoutRef<'h1'>) => (
    <h1 className="text-xl font-semibold mb-3 text-gray-900" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: React.ComponentPropsWithoutRef<'h2'>) => (
    <h2 className="text-lg font-semibold mb-2 text-gray-900" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: React.ComponentPropsWithoutRef<'h3'>) => (
    <h3 className="text-base font-semibold mb-2 text-gray-900" {...props}>
      {children}
    </h3>
  ),
  table: ({ children, ...props }: React.ComponentPropsWithoutRef<'table'>) => (
    <div className="my-4 overflow-x-auto">
      <table className="min-w-full border-collapse text-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: React.ComponentPropsWithoutRef<'thead'>) => (
    <thead className="bg-gray-50" {...props}>
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }: React.ComponentPropsWithoutRef<'tbody'>) => (
    <tbody className="bg-white divide-y divide-gray-100" {...props}>
      {children}
    </tbody>
  ),
  tr: ({ children, ...props }: React.ComponentPropsWithoutRef<'tr'>) => (
    <tr className="border-b border-gray-100 last:border-0" {...props}>
      {children}
    </tr>
  ),
  th: ({ children, ...props }: React.ComponentPropsWithoutRef<'th'>) => (
    <th
      className="px-4 py-3 text-left text-gray-700 font-semibold border-b border-gray-200"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }: React.ComponentPropsWithoutRef<'td'>) => (
    <td className="px-4 py-3 text-gray-800" {...props}>
      {children}
    </td>
  ),
};

const Chat: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<ModelType>('claude-3-7-sonnet');
  const [useReasoning, setUseReasoning] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<AgentType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedToolCalls, setExpandedToolCalls] = useState<Set<string>>(new Set());

  const toggleToolCall = (id: string) => {
    setExpandedToolCalls(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    error,
    status,
    stop,
    reload,
    setMessages,
  } = useCustomChat({
    model: selectedModel,
    reasoning: useReasoning,
    agents: selectedAgents,
  });

  useEffect(() => {
    if (selectedModel === 'claude-3-5-sonnet-latest') {
      setUseReasoning(false);
    }
  }, [selectedModel]);

  useEffect(() => {
    setIsLoading(status === 'loading');
  }, [status]);

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const handleClear = () => {
    setMessages([]);
  };

  const handleRetry = () => {
    if (status === 'error') {
      void reload();
    }
  };

  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    scrollToBottom();
  }, [messages]);

  return (
    <div className="h-[calc(100vh-3rem)] flex items-center justify-center p-4">
      <div
        className={clsx(
          'w-full transition-all duration-500 ease-in-out',
          messages.length === 0 ? 'max-w-3xl h-[400px]' : 'max-w-5xl h-full'
        )}
      >
        <div className="bg-white rounded-xl shadow-lg w-full h-full flex flex-col overflow-hidden">
          <div
            className={clsx(
              'flex-1 p-6 overflow-y-auto space-y-6 min-h-0',
              messages.length === 0 && 'flex items-center'
            )}
          >
            {messages.length === 0 && !isLoading && (
              <div className="text-center text-gray-500 w-full">
                Start a conversation with MIA by asking a question below.
              </div>
            )}
            {messages.map((message: Message) => (
              <div
                key={`${message.role}-${message.content.substring(0, 32)}`}
                className={clsx('flex', {
                  'justify-end': message.role === 'user',
                  'justify-start': message.role === 'assistant',
                })}
              >
                {message.role === 'assistant' ? (
                  <div className="flex flex-col max-w-[85%] text-base">
                    {message.tool_calls && message.tool_calls.length > 0 && (
                      <div className="mb-3">
                        <button
                          onClick={() => toggleToolCall(message.tool_calls![0].id)}
                          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                        >
                          🔧 Tool Execution
                        </button>
                        {expandedToolCalls.has(message.tool_calls[0].id) && (
                          <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            {message.tool_calls.map((tool, index) => {
                              let args;
                              try {
                                args = JSON.parse(tool.function.arguments);
                              } catch (e) {
                                args = tool.function.arguments;
                              }

                              // Extract code from arguments if present
                              const codeContent =
                                typeof args === 'object' && args.code ? args.code : null;
                              const otherArgs =
                                typeof args === 'object' && args.code
                                  ? { ...args, code: '[shown below]' }
                                  : args;

                              return (
                                <div
                                  key={tool.id}
                                  className={index > 0 ? 'mt-4 pt-4 border-t border-gray-200' : ''}
                                >
                                  <div className="font-medium text-gray-700 mb-2">
                                    {tool.function.name}
                                  </div>
                                  <div className="bg-white rounded border border-gray-200">
                                    <pre className="p-3 overflow-x-auto whitespace-pre text-sm">
                                      <code>
                                        {typeof otherArgs === 'string'
                                          ? otherArgs
                                          : JSON.stringify(otherArgs, null, 2)}
                                      </code>
                                    </pre>
                                  </div>
                                  {codeContent && (
                                    <div className="mt-3">
                                      <div className="font-medium text-gray-700 mb-2">Code:</div>
                                      <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        rehypePlugins={[rehypeRaw]}
                                        components={markdownComponents}
                                      >
                                        {'```python\n' + codeContent + '\n```'}
                                      </ReactMarkdown>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                    {message.reasoning && (
                      <div className="mb-3">
                        <button
                          onClick={() => setUseReasoning(!useReasoning)}
                          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                        >
                          Reasoning
                        </button>
                        <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={markdownComponents}
                          >
                            {message.reasoning.thinking}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                    <div className="text-gray-800">
                      {/[*#\[\]_`]/.test(message.content) || message.content.includes('\n\n') ? (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw]}
                          components={markdownComponents}
                        >
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="chat-message max-w-[85%] px-4 py-3 rounded-2xl bg-heroku-purple text-white">
                    {message.content}
                  </div>
                )}
              </div>
            ))}
            {error && (
              <div className="flex justify-center">
                <div className="bg-red-50 text-red-500 px-4 py-2 rounded-lg flex items-center gap-2">
                  <span>Error: {error.message}</span>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="text-sm underline hover:no-underline"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%]">
                  <LoadingDots className="py-1" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="border-t bg-white p-4 space-y-4">
            <form
              onSubmit={async e => {
                e.preventDefault();
                if (isLoading) return;
                setIsLoading(true);
                try {
                  await handleSubmit();
                } catch (error) {
                  console.error('Error submitting form:', error);
                } finally {
                  setIsLoading(false);
                }
              }}
              className="flex gap-3"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Send a message..."
                className="flex-1 rounded-xl border-0 bg-gray-100 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-heroku-purple disabled:bg-gray-50 disabled:text-gray-500"
                disabled={isLoading}
              />
              {isLoading ? (
                <button
                  type="button"
                  onClick={stop}
                  className="rounded-xl bg-gray-100 p-3 text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-heroku-purple"
                  title="Stop generating"
                >
                  <StopIcon className="h-5 w-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="rounded-xl bg-heroku-purple p-3 text-white hover:bg-heroku-dark focus:outline-none focus:ring-2 focus:ring-heroku-purple disabled:opacity-50"
                  title="Ask me anything..."
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              )}
            </form>
            <div className="flex items-center gap-4 justify-between text-xs text-gray-500">
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-500 hover:text-gray-700"
                disabled={messages.length === 0 || isLoading}
              >
                Clear Chat
              </button>
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-1.5 justify-end">
                  {AGENTS.map(agent => (
                    <AgentToggle
                      key={agent.id}
                      agent={agent}
                      isSelected={selectedAgents.includes(agent.id)}
                      onToggle={() => {
                        setSelectedAgents(prev =>
                          prev.includes(agent.id)
                            ? prev.filter(id => id !== agent.id)
                            : [...prev, agent.id]
                        );
                      }}
                      disabled={isLoading}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3 justify-end">
                  <label className="inline-flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={useReasoning}
                        onChange={e => setUseReasoning(e.target.checked)}
                        disabled={isLoading || selectedModel !== 'claude-3-7-sonnet'}
                      />
                      <div className="w-8 h-4 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-heroku-purple"></div>
                    </div>
                    <span className="ml-2 text-xs font-medium">Reasoning</span>
                  </label>
                  <select
                    value={selectedModel}
                    onChange={e => setSelectedModel(e.target.value as ModelType)}
                    className="text-xs rounded-md border-gray-300 shadow-sm focus:border-heroku-purple focus:ring-heroku-purple bg-transparent py-1 pl-2 pr-8"
                    disabled={isLoading}
                  >
                    {MODELS.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
