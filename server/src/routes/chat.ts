import { FastifyPluginAsync } from 'fastify';
import { getModel, getTool } from '../lib/config.js';

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

interface ModelRequestBody {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  tools?: {
    type: string;
    function: {
      name: string;
    };
  }[];
  tool_choice?: string;
  extended_thinking?: {
    enabled: boolean;
    budget_tokens: number;
    include_reasoning: boolean;
  };
}

export const chatRoute: FastifyPluginAsync = async fastify => {
  fastify.post<{ Body: ChatRequest }>('/api/chat', async (request, reply) => {
    const { messages, model, agents, reasoning } = request.body;

    const modelConfig = getModel(model);

    if (!modelConfig) {
      return reply.status(400).send({ error: 'Invalid model' });
    }

    const body: ModelRequestBody = {
      model: model,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      stream: true,
    };

    if (model === 'claude-3-7-sonnet' && reasoning) {
      body.extended_thinking = {
        enabled: true,
        budget_tokens: 2000,
        include_reasoning: true,
      };
    }

    if (agents && agents.length > 0) {
      body.tools = agents
        .map(agent => {
          return getTool(agent);
        })
        .filter((tool): tool is { type: string; function: { name: string } } => tool !== undefined);
      body.tool_choice = 'auto';
    }

    try {
      const response = await fetch(`${modelConfig.INFERENCE_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${modelConfig.API_KEY}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        fastify.log.error(errorData, 'Error from model');
        return reply.status(response.status).send({
          error: 'Failed to fetch from model',
          details: errorData.error,
        });
      }

      if (!response.body) {
        return reply.status(500).send({ error: 'No response body received' });
      }

      return response.body;
    } catch (error) {
      request.log.error('Stream error:', error);
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
};
