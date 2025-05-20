import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { config, getModel, getTool } from '../lib/config.js';
import { RateLimitOptions, errorResponseBuilderContext } from '@fastify/rate-limit';
import { ChatRequest, ChatRequestBody, ErrorResponse } from '../types/chat.js';

export const chatRoute: FastifyPluginAsync = async fastify => {
  fastify.post<{ Body: ChatRequest }>(
    '/api/chat',
    {
      config: {
        rateLimit: {
          max: 20,
          timeWindow: '1 minute',
          errorResponseBuilder: (
            req: FastifyRequest,
            context: errorResponseBuilderContext
          ): ErrorResponse => ({
            code: 429,
            error: 'Too Many Requests',
            expiresIn: context.ttl,
            message: `Rate limit exceeded, retry in ${context.after}`,
          }),
        } as RateLimitOptions,
      },
    },
    async (request, reply) => {
      const { messages, model, agents, reasoning } = request.body;

      const modelConfig = getModel(model);

      if (!modelConfig) {
        return reply.status(400).send({ error: 'Invalid model' });
      }

      const inferenceUrl = `${modelConfig.INFERENCE_URL}/v1/chat/completions`;
      const agentsUrl = `${modelConfig.INFERENCE_URL}/v1/agents/heroku`;
      const systemPrompt = config.system_prompt;
      const hasAgents = agents && agents.length > 0;

      const body: ChatRequestBody = {
        model: model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          ...messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        ],
      };

      if (hasAgents) {
        body.tools = agents
          .map(agent => {
            return getTool(agent);
          })
          .filter((tool): tool is { type: string; name: string } => tool !== undefined);
      } else {
        body.stream = true;
        if (model === 'claude-3-7-sonnet' && reasoning) {
          body.extended_thinking = {
            enabled: true,
            budget_tokens: 2000,
            include_reasoning: true,
          };
        }
      }

      try {
        const response = await fetch(hasAgents ? agentsUrl : inferenceUrl, {
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
            details: errorData.error.message,
          });
        }

        if (!response.body) {
          return reply.status(500).send({ error: 'No response body received' });
        }

        return response.body;
      } catch (error) {
        request.log.error(error, 'Stream error');
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return reply.status(500).send({ error: 'Internal server error', details: errorMessage });
      }
    }
  );
};
