// src/routes/bills.js
import { PrismaClient } from '@prisma/client';
import { fetchPage, parseProjectHtml } from '../../scraper/fetchProject.js';
import * as cheerio from 'cheerio';
import axios from 'axios';

const prisma = new PrismaClient();

export default async function billsRoutes(fastify, opts) {
  // GET /api/bills/ -> list projects
  fastify.get('/', async (req, reply) => {
    try {
      const url = 'https://www.cdep.ro/pls/proiecte/upl_pck2015.lista?anp=2025';
      const html = await fetchPage(url);

      console.log('Type of html:', typeof html);
      console.log('HTML length:', html?.length);

      if (!html || typeof html !== 'string') {
        throw new Error('fetchPage returned invalid HTML');
      }

      const $ = cheerio.load(html);
      const projects = [];

      // Try different selectors - Romanian parliamentary sites often have simple table structures
      // Look for rows that have 4 columns (td elements)
      $('tr').each((i, row) => {
        const cols = $(row).find('td');

        // Skip if not exactly 4 columns
        if (cols.length !== 4) return;

        console.log(`Processing row ${i}:`, $(cols[1]).text().trim());

        const linkTag = $(cols[1]).find('a');
        const stadiuTag = $(cols[3]).find('a');

        // Get the date - it's after the <br> tag in the 4th column
        const dateText = $(cols[3]).html();
        let data = '';
        if (dateText) {
          const match = dateText.match(/<br>\s*(\d{2}\.\d{2}\.\d{4})/);
          if (match) {
            data = match[1].trim();
          }
        }

        const project = {
          index: $(cols[0]).text().trim(),
          numar: linkTag.text().trim(),
          link_proiect: linkTag.attr('href')
            ? `https://www.cdep.ro${linkTag.attr('href')}`
            : null,
          titlu: $(cols[2]).text().trim(),
          stadiu: stadiuTag.text().trim(),
          link_lege: stadiuTag.attr('href')
            ? `https://www.cdep.ro${stadiuTag.attr('href')}`
            : null,
          data: data
        };

        // Only add if we have at least a project number
        if (project.numar) {
          projects.push(project);
        }
      });

      console.log(`Found ${projects.length} projects`);
      return projects;

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
      const html = await fetchPage(targetUrl);
      const { formaAdoptata } = parseProjectHtml(html);

      if (!formaAdoptata) {
        reply.status(404).send({ error: 'PDF not found for "Forma adoptată de Cameră"' });
        return;
      }

      console.log('Resolved PDF URL:', formaAdoptata);

      // 2️⃣ fetch the PDF as a buffer to avoid preview HTML issues
      const pdfBuffer = await axios
        .get(formaAdoptata, {
          responseType: 'arraybuffer',
          timeout: 30_000,
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