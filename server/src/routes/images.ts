import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { getModel } from '../lib/config.js';
import { RateLimitOptions, errorResponseBuilderContext } from '@fastify/rate-limit';
import { ErrorResponse } from '../types/shared.js';
import { ImageRequest, ImageRequestBody } from '../types/images.js';

export const imagesRoute: FastifyPluginAsync = async fastify => {
  fastify.post<{ Body: ImageRequest }>(
    '/api/images',
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
      const { prompt, aspect_ratio, negative_prompt, seed, model } = request.body;

      const modelConfig = getModel(model);

      if (!modelConfig) {
        return reply.status(400).send({ error: 'Invalid model' });
      }

      const body: ImageRequestBody = {
        model: model,
        prompt,
        output_format: 'png',
        aspect_ratio,
        negative_prompt,
        seed,
      };

      try {
        const response = await fetch(`${modelConfig.DIFFUSION_URL}/v1/images/generations`, {
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

        const json = await response.json();
        return json;
      } catch (error) {
        request.log.error(error, 'Error generating image');
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return reply.status(500).send({ error: 'Internal server error', details: errorMessage });
      }
    }
  );
};
