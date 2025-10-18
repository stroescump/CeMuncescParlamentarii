import Fastify from 'fastify';
import cors from '@fastify/cors';
import projectsRoutes from './routes/projects.js';

const server = Fastify({ logger: true });
await server.register(cors, { origin: true });
await server.register(projectsRoutes, { prefix: '/api/projects' });

const start = async () => {
  try {
    await server.listen({ port: 3001, host: '0.0.0.0' });
    console.log('Backend listening on 3001');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();
