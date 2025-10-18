import { chromium } from 'playwright';
import * as cheerio from 'cheerio';

export async function fetchPage(url) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  console.log('Navigating to', url);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
  const html = await page.content();
  console.log('Fetched HTML length:', html.length);
  await browser.close();
  return html;
}

export function parseProjectHtml(html) {
  const $ = cheerio.load(html);
  const title = $('h2').first().text().trim() || $('title').text().trim();

  const files = [];
  $('a').each((i, el) => {
    const href = $(el).attr('href') || '';
    if (/\.(pdf)$/i.test(href)) {
      const fixedHref = href.startsWith('/') ? '/pls/proiecte' + href : '/pls/proiecte/' + href;
      const url = new URL(fixedHref, 'https://www.cdep.ro').href;
      files.push({ url, text: $(el).text().trim() });
    }
  });

  let formaAdoptata = null;
  $('tr').each((i, tr) => {
    const tds = $(tr).find('td');
    if (tds.length >= 3 && $(tds[2]).text().trim() === 'Forma adoptată de Cameră') {
      const anchor = $(tds[0]).find('a').first();
      if (anchor.length) {
        const href = anchor.attr('href');
        const fixedHref = href.startsWith('/') ? '/pls/proiecte' + href : '/pls/proiecte/' + href;
        formaAdoptata = new URL(fixedHref, 'https://www.cdep.ro').href;
      }
    }
  });

  return { title, files, formaAdoptata };
}

