import * as cheerio from 'cheerio'
import { createTransactionObj } from '../../utils/utils.js'
import logger from '#root/utils/logger.js'

const isDateString = (str) => {
  return /^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}$/.test(str)
}

const getTransaction = (html) => {
  if (!html) return

  const $ = cheerio.load(html)
  const cells = $('table').eq(1).find('tr').eq(1).find('td')

  // check if the html is the correct one
  if (!cells.length) {
    logger.error({
      html
    }, 'parser: Scotiabank HTML is not correct')
    return
  }

  const amount = cells.eq(1).text()
  const date = `${cells.eq(2).text()} ${cells.eq(3).text()}`.trim()
  const note = cells.eq(0).text()

  // validate data not exist or is incorrect like
  // date not include numbers, amount is not a number, date string is too long or short, etc
  if (
    !amount ||
    !date ||
    !note ||
    !/\d/.test(date) ||
    !/\d/.test(amount) ||
    !isDateString(date)
  ) {
    logger.error({
      amount,
      date,
      note,
      error: {
        amount: !amount,
        date: !date,
        note: !note,
        dateHasNumbers: !/\d/.test(date),
        amountHasNumbers: !/\d/.test(amount),
        isDateString: !isDateString(date)
      },
      html
    }, 'parser: Scotiabank data is not correct')
    return
  }

  const transaction = createTransactionObj({
    type: 'expense',
    account: 'Scotiabank OneCash',
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
