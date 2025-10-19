import fs from 'fs';
import path from 'path';

export function summarizeChunk(chunk) {
  const lines = chunk.split('\n').map(l => l.trim()).filter(Boolean);
  const summary = lines.slice(0, 3).concat(lines.slice(-2)).join(' ');
  return summary;
}

export function confidenceScore(chunk, ocrUsed = false) {
  let score = 0.5;
  if (!ocrUsed) score += 0.2;
  if (chunk.length > 1000) score += 0.1;
  if (chunk.length < 200) score -= 0.2;
  return Math.min(Math.max(score, 0), 1);
}

export function summarizeFile(filename, ocrUsed = false) {
  const txtPath = path.resolve('src/ai', filename);

  const chunks = fs.readFileSync(txtPath, 'utf-8').match(/.{1,2000}/gs) || [];

  const summaries = chunks.map(summarizeChunk);
  const confidences = chunks.map(c => confidenceScore(c, ocrUsed));

  return {
    summary: summaries.join(' '),
    confidence: (confidences.reduce((a, b) => a + b, 0) / confidences.length).toFixed(2)
  };
}
