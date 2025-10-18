import axios from 'axios';
import cheerio from 'cheerio';

export async function parseBill(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const title = $('h2').first().text().trim();

  const votes = [];
  $('table tr').each((i, el) => {
    const cols = $(el).find('td');
    if (cols.length === 3) {
      votes.push({
        name: $(cols[0]).text().trim(),
        party: $(cols[1]).text().trim(),
        vote: $(cols[2]).text().trim()
      });
    }
  });

  return { title, votes };
}