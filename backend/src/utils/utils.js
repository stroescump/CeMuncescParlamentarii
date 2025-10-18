import cheerio from 'cheerio';

function extractPdfForFormaAdoptata(html) {
  const $ = cheerio.load(html);
  let pdfUrl = null;

  $('tr').each((i, tr) => {
    const tds = $(tr).find('td');
    if (tds.length >= 3) {
      const lastTdText = $(tds[2]).text().trim();
      if (lastTdText === 'Forma adoptată de Cameră') {
        const anchor = $(tds[0]).find('a').first();
        const href = anchor.attr('href');
        if (href) {
          pdfUrl = new URL(href, 'https://www.cdep.ro').href;
        }
      }
    }
  });

  return pdfUrl;
}