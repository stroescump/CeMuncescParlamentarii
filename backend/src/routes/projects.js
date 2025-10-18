import { prisma } from '../prismaClient.js';

export default async function (fastify, opts) {
  fastify.get('/', async (request, reply) => {
    const projects = await prisma.project.findMany({
      select: { id: true, externalId: true, title: true, shortHeadline: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 200
    });
    return projects;
  });

  fastify.get('/:id', async (request, reply) => {
    const id = Number(request.params.id);
    const project = await prisma.project.findUnique({
      where: { id },
      include: { versions: true, votes: true, files: true }
    });
    if (!project) return reply.code(404).send({ error: 'Not found' });
    return project;
  });
}