import { execFile } from 'node:child_process';
import path from 'node:path';

export function pdfToText() {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve('src/ai/pdf2text.py');
    const pdfPath = path.resolve('src/ai/sample.pdf');
    const txtPath = path.resolve('src/ai/sample.txt');

    execFile('python3', [scriptPath, pdfPath, txtPath], (err, stdout, stderr) => {
      if (err) {
        console.error('OCR error:', stderr);
        return reject(err);
      }
      console.log('OCR success, length:', stdout.trim());
      resolve(txtPath);
    });
  });
}
