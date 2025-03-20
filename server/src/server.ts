import 'dotenv/config';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import fastifyCors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import Fastify from 'fastify';
import { chatRoute } from './routes/chat.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../../..');

const fastify = Fastify({
  logger: true,
});

// Register CORS
fastify.register(fastifyCors, {
  origin: true, // Reflect the request origin, or set to your specific domain in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // 24 hours
});

// Serve static files from the React app build directory
fastify.register(fastifyStatic, {
  root: join(rootDir, 'client/dist'),
  prefix: '/',
});

// Register chat route
fastify.register(chatRoute);

// Run the server
const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    await fastify.listen({ port, host: '0.0.0.0' });
    fastify.log.info(`Server listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start().catch(err => {
  fastify.log.error('Failed to start server:', err);
  process.exit(1);
});
