// src/server.js
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';

import billsRoutes from './routes/bills.js';
import aiRoutes from './routes/ai.js';

import createBillsService from './services/billsService.js';
import createFakeBillsService from './services/billsService.fake.js';
import { summarizeDocument } from './services/aiService.js'


const fastify = Fastify({ logger: true });

async function start() {
  // config
  const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
  const USE_FAKE = process.env.USE_FAKE === '1' || process.env.NODE_ENV === 'development';

  // register plugins early
  await fastify.register(cors, {
    origin: true
  });

  // create & decorate service
  let prisma = null;
  if (!USE_FAKE) {
    // only init prisma for real mode (sa nu facă conexiuni inutile în fake)
    prisma = new PrismaClient();
    await prisma.$connect().catch(err => {
      fastify.log.warn('Prisma connect failed (continuing):', err.message || err);
    });
  }

  const billsService = USE_FAKE ? createFakeBillsService() : createBillsService({ prisma });
  fastify.decorate('billsService', billsService);

  // register routes (prefix optional)
  fastify.register(billsRoutes, { prefix: '/api/bills' });
  fastify.register(aiRoutes, { prefix: '/ai' });

  // start server
  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    fastify.log.info(`Server listening on ${PORT}`);
    fastify.log.info(`USE_FAKE=${USE_FAKE ? '1' : '0'}`);
    fastify.log.info(`Routes:\n${fastify.printRoutes()}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }

  // graceful shutdown hook (nice to have in containers)
  const shutdown = async () => {
    try {
      fastify.log.info('Shutting down...');
      if (prisma) await prisma.$disconnect();
      await fastify.close();
      process.exit(0);
    } catch (e) {
      fastify.log.error('Error during shutdown', e);
      process.exit(1);
    }
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start();
