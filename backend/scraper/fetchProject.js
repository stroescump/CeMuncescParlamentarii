import { chromium } from 'playwright';
import cheerio from 'cheerio';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Example target — change or iterate with a list
const TARGET_URL = 'https://www.cdep.ro/pls/proiecte/upl_pck2015.proiect?cam=2&idp=22199';

async function fetchPage(url) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForTimeout(800);
  const html = await page.content();
  await browser.close();
  return html;
}

function parseProjectHtml(html) {
  const $ = cheerio.load(html);
  // Heuristics: adapt these after inspecting the real pages
  const title = $('h2').first().text().trim() || $('title').text().trim();

  const files = [];
  $('a').each((i, el) => {
    const href = $(el).attr('href') || '';
    if (/\.(pdf|docx?|xlsx?)$/i.test(href)) {
      const url = new URL(href, 'https://www.cdep.ro').href;
      files.push({ url, text: $(el).text().trim() });
    }
  });

  const metadata = {};
  $('table').first().find('tr').each((i, tr) => {
    const tds = $(tr).find('td');
    if (tds.length >= 2) {
      const key = $(tds[0]).text().trim().replace(/[:\s]+$/,'');
      const val = $(tds[1]).text().trim();
      metadata[key] = val;
    }
  });

  return { title, files, metadata };
}

async function downloadFile(url, destDir = './downloads') {
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const filename = path.basename(new URL(url).pathname);
  const outPath = path.join(destDir, filename);
  const resp = await axios.get(url, { responseType: 'stream' });
  const writer = fs.createWriteStream(outPath);
  resp.data.pipe(writer);
  await new Promise((res, rej) => {
    writer.on('finish', res);
    writer.on('error', rej);
  });
  return outPath;
}

async function extractTextFromPdf(filepath) {
  const pdf = fs.readFileSync(filepath);
  const pdfParse = (await import('pdf-parse')).default;
  const data = await pdfParse(pdf);
  return data.text;
}

(async () => {
  try {
    console.log('Fetching', TARGET_URL);
    const html = await fetchPage(TARGET_URL);
    const parsed = parseProjectHtml(html);
    console.log('Parsed:', parsed.title, parsed.files.length);

    let project = await prisma.project.findUnique({ where: { externalId: '22199' } });
    if (!project) {
      project = await prisma.project.create({
        data: {
          externalId: '22199',
          title: parsed.title,
          rawHtml: html
        }
      });
    } else {
      project = await prisma.project.update({
        where: { id: project.id },
        data: { rawHtml: html, title: parsed.title }
      });
    }

    for (const f of parsed.files) {
      try {
        const filePath = await downloadFile(f.url);
        let text = '';
        if (filePath.endsWith('.pdf')) {
          text = await extractTextFromPdf(filePath);
        }
        await prisma.file.create({
          data: {
            projectId: project.id,
            url: f.url,
            mime: 'application/octet-stream',
            text: text || null
          }
        });
      } catch (err) {
        console.error('Failed download/extract', f.url, err.message);
      }
    }

    console.log('Done.');
    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  }
})();
