// src/routes/bills.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function billsRoutes(fastify, opts) {
  // GET /api/bills/ -> list projects
  fastify.get('/', async (req, reply) => {
    try{
      const bills = await fastify.billsService.fetchList()
      reply.send(bills)
    } catch (err) {
      fastify.log.error('Error fetching 2025 projects:', err);
      reply.status(502).send({
        error: 'Failed to fetch projects 2025',
        details: err.message
      });
    }
  });

  // GET /api/bills/:externalId/pdf -> stream the "Forma adoptată de Cameră" PDF
  fastify.get('/:externalId/pdf', async (req, reply) => {
    const { externalId } = req.params;
    const targetUrl = `https://www.cdep.ro/pls/proiecte/upl_pck2015.proiect?cam=2&idp=${externalId}`;

    try {
      // 1️⃣ fetch & parse
      const html = await fastify.billsService.fetchPage(targetUrl);
      const { formaAdoptata } = fastify.billsService.parseProjectHtml(html);

      if (!formaAdoptata) {
        reply.status(404).send({ error: 'PDF not found for "Forma adoptată de Cameră"' });
        return;
      }

      console.log('Resolved PDF URL:', formaAdoptata);

      // 2️⃣ fetch the PDF as a buffer to avoid preview HTML issues
      const pdfBuffer = await axios
        .get(formaAdoptata, {
          responseType: 'arraybuffer',
          timeout: 5000,
          maxRedirects: 5,
          headers: { 'User-Agent': 'Mozilla/5.0' },
        })
        .then(res => res.data);

      // 3️⃣ sanity check
      if (!pdfBuffer || pdfBuffer.length < 100) {
        fastify.log.error('Fetched PDF is empty or too small');
        reply.status(502).send({ error: 'PDF content invalid' });
        return;
      }

      // 4️⃣ stream to client
      reply.header('Content-Type', 'application/pdf');
      reply.header('Content-Disposition', `inline; filename="${externalId}.pdf"`);
      reply.send(pdfBuffer);

    } catch (err) {
      fastify.log.error('PDF fetch error', err.message || err);
      reply.status(502).send({ error: 'Failed to fetch PDF' });
    }
  });
}