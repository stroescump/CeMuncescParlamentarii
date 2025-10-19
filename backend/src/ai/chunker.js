import fs from 'fs';

export function chunkText(filePath, chunkSize = 2000) {
  const text = fs.readFileSync(filePath, 'utf-8');
  const chunks = [];

  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }

  return chunks;
}