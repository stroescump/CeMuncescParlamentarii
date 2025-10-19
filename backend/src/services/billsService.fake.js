// src/services/billsService.fake.js
export const dummyBills = [
  {
    index: "1",
    numar: "1",
    link_proiect: "https://www.cdep.ro/pls/proiecte/upl_pck2015.proiect?cam=2&idp=22201",
    titlu: "Proiectul Legii bugetului de stat pe anul 2025",
    stadiu: "la comisii",
    link_lege: null,
    data: "2025-02-01"
  },
  {
    index: "2",
    numar: "2",
    link_proiect: "https://www.cdep.ro/pls/proiecte/upl_pck2025.proiect?cam=2&idp=22310",
    titlu: "Proiect de Lege privind digitalizarea serviciilor publice",
    stadiu: "raport depus",
    link_lege: null,
    data: "2025-02-03"
  },
  {
    index: "3",
    numar: "3",
    link_proiect: "https://www.cdep.ro/pls/proiecte/upl_pck2025.proiect?cam=2&idp=22325",
    titlu: "Proiect de Lege pentru modificarea Codului Muncii",
    stadiu: "la promulgare",
    link_lege: "https://www.cdep.ro/pls/proiecte/upl_pck2025.proiect?cam=2&idp=22325",
    data: "2025-02-05"
  }
];

export default function createFakeBillsService() {
  return {
    async fetchList() {
      console.log(dummyBills)
      return dummyBills
    },

    async parseProjectHtml(html) {
      const match = html.match(/href="([^"]+\.pdf)"/);
      return {
        formaAdoptata: match ? match[1] : null
      };
    },

    async fetchPage(targetUrl) {
      return `
        <html>
          <body>
            <a href="https://www.cdep.ro/proiecte/2025/fake-pdf.pdf">
              Forma adoptată de Cameră
            </a>
          </body>
        </html>
      `;
    }
  };
}



