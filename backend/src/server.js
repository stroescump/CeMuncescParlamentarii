// src/server.js
import Fastify from 'fastify';
import cors from '@fastify/cors';
import billsRoutes from './routes/bills.js';

const fastify = Fastify({ logger: true });

await fastify.register(cors, { origin: true });

// register the bills plugin under /api/bills
await fastify.register(billsRoutes, { prefix: '/api/bills' });

const PORT = process.env.PORT || 4000;
await fastify.listen({ port: Number(PORT), host: '0.0.0.0' });

// helpful: print routes to verify
fastify.log.info(`Routes:\n${fastify.printRoutes()}`);