import * as cheerio from 'cheerio'
import { createTransactionObj } from '../utils.js'

const amountRegex = /(\d{1,3}(,\d{3})*(\.\d+)?)/
const dateRegex = /(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2})/
const accountRegex = /(cta \d+)/

const getByRegex = (str, regex, index = 0) => {
  const match = str.match(regex)
  return match ? match[index] : ''
}

const getTransaction = (html) => {
  if (!html) return

  const $ = cheerio.load(html)

  // using filter
  // const content = $('table table table table td').filter((i, element) => {
  //   const $el = $(element)
  //   return $el.text().includes('Bancolombia le informa Transferencia')
  // })

  // using long selector
  const content = $('table table table:nth-child(4) table tr:nth-child(2) > td')

  // Validate is the correct html
  if (!content.length) return
  const contentText = content.text()

  // Validate is the correct html
  if (!contentText.includes('Bancolombia le informa Transferencia')) return

  const amount = getByRegex(contentText, amountRegex)
  const date = getByRegex(contentText, dateRegex)
  const account = getByRegex(contentText, accountRegex)
  const note = `Transferencia a ${account}`

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
    account: 'Bancolombia',
    amount,
    date,
    note,
    others: {
      account
    }
  })

  return transaction
}

const config = {
  name: 'Bancolombia',
  email: 'alertasynotificaciones@notificacionesbancolombia.com',
  getTransaction
}

export default config
