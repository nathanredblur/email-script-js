import * as cheerio from 'cheerio'
import { createTransactionObj } from '../utils.js'

const getTransaction = (html) => {
  if (!html) return

  const $ = cheerio.load(html)
  const cells = $('table').eq(1).find('tr').eq(1).find('td')

  // check if the html is the correct one
  if (!cells.length) return

  const amount = cells.eq(1).text()
  const date = `${cells.eq(2).text()} ${cells.eq(3).text()}`
  const note = cells.eq(0).text()

  // validate data not exist or is incorrect like
  // date not include numbers, amount is not a number, date string is too long or short, etc
  if (
    !amount ||
    !date ||
    !note ||
    !/\d/.test(date) ||
    !/\d/.test(amount) ||
    date.length > 18
  ) {
    console.log('data is not correct', { amount, date, note })
    console.log('html', html)
    return
  }

  const transaction = createTransactionObj({
    type: 'expense',
    account: 'Scottiabank OneCash',
    amount,
    date,
    note
  })

  return transaction
}

const config = {
  name: 'Scotiabank',
  email: 'colpatriaInforma@scotiabankcolpatria.com',
  getTransaction
}

export default config
