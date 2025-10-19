// src/services/aiService.js
import { pdfToText } from '../ai/ocr-fallback.js';
import { chunkText } from '../ai/chunker.js';
import { summarizeChunk } from '../ai/summarizer.js';

export async function summarizeDocument(input) {
  let text;

  // Dacă input e un PDF (ArrayBuffer / Buffer / base64), extrage text
  if (input.type === 'pdf' && input.data) {
    text = await pdfToText(input.data);
  } else if (typeof input.text === 'string') {
    text = input.text;
  } else {
    throw new Error('Unsupported input format');
  }

  // sparge în bucăți
  const chunks = chunkText(text);

  // summarize fiecare chunk și combină rezultatele
  const summaries = [];
  for (const chunk of chunks) {
    const summary = await summarizeChunk(chunk); // aici poți integra modelul AI
    summaries.push(summary);
  }

  // combină toate sumarizările într-un singur text
  const finalSummary = summaries.map(s => s.text).join('\n');
  const confidence = summaries.reduce((acc, s) => acc + s.confidence, 0) / summaries.length;

  return { summary: finalSummary, confidence };
}
