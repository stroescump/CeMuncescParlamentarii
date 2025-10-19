import { chromium } from 'playwright';
import * as cheerio from 'cheerio';

export default function createBillsService({ prisma } = {}) {
    return {
        async fetchList() {
            const url = 'https://www.cdep.ro/pls/proiecte/upl_pck2015.lista?anp=2025';
            const html = await this.fetchPage(url);

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
                console.log("This is one column" + cols)
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
        },

        async fetchPage(targetUrl) {
            const browser = await chromium.launch({ headless: true });
            const page = await browser.newPage();
            console.log('Navigating to', targetUrl);
            await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 60_000 });
            const html = await page.content();
            console.log('Fetched HTML length:', html.length);
            await browser.close();
            return html;
        },

        async parseProjectHtml(html) {
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
    }
}