import Fastify from 'fastify';
import path from 'path';
import { pdfToText } from '../ai/ocr-fallback.js';
import { summarizeFile } from '../ai/summarizer.js';

export default async function aiRoutes(fastify) {

  fastify.post('/summarize', async (req, reply) => {
    try {
      const { pdfName } = req.body; // e.g., "sample.pdf"
      const pdfPath = path.resolve('src/ai', pdfName); // <--- folder corect
      const txtPath = pdfPath.replace('.pdf', '.txt');

      await pdfToText(pdfPath, txtPath);

      const result = summarizeFile(path.basename(txtPath), true); // true = OCR folosit
      reply.send(result);

    } catch (err) {
      console.error(err);
      reply.status(500).send({ error: 'Failed to summarize PDF' });
    }
  });
}
