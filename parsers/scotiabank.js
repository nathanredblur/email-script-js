import * as cheerio from 'cheerio';

const getTransaction = (html) => {
  if (!html) return;

  const $ = cheerio.load(html);
  const cells = $('table').eq(1).find('tr').eq(1).find('td');

  // check if the html is the correct one
  if (!cells.length) return;

  const transaction = {
    description: cells.eq(0).text(),
    amount: cells.eq(1).text().replace(',', ''),
    date: cells.eq(2).text(),
    time: cells.eq(3).text(),
    type: 'credit',
  };
  
  return transaction;
}

const config = {
  name: 'Scotiabank',
  email: 'colpatriaInforma@scotiabankcolpatria.com',
  getTransaction,
};

export default config;