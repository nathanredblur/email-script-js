import * as cheerio from 'cheerio'
import { createTransactionObj } from '../utils.js'

const amountRegex = /(\d{1,3}(,\d{3})*(\.\d+)?)/
const dateRegex = /(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2})/
const accountNumberRegex = /a cta (\d+)/
const accountNameRegex = /a ([\w\s]+) desde/
const phoneNumberRegex = /al cel (\d+)\./
const desdeRegex = /de ([\w\s]+) por \$/

const getByRegex = (str, regex, index = 0) => {
  const match = str.match(regex)
  return match ? match[index] : ''
}

const getText = (str = '') => {
  return str.replace(/\t+/g, ' ').trim()
}

const getTransaction = (html) => {
  if (!html) return

  const $ = cheerio.load(html)

  // validate is a transactional email from Bancolombia using header background color
  const headerTransaction = $('table[bgcolor="#fc7f41"]').text()
  if (getText(headerTransaction) !== 'Notificación Transaccional') {
    console.log('Is not a transactional email from Bancolombia')
    return
  }

  // using long selector
  const content = $('table table table:nth-child(4) table tr:nth-child(2) > td')

  // Validate is the correct html
  if (!content.length) return
  const contentText = content.text()

  let type = 'expense'
  const amount = getByRegex(contentText, amountRegex)
  const date = getByRegex(contentText, dateRegex)
  const accountNumber = getByRegex(contentText, accountNumberRegex, 1)
  const accountName = getByRegex(contentText, accountNameRegex, 1)
  const phoneNumber = getByRegex(contentText, phoneNumberRegex, 1)
  const desde = getByRegex(contentText, desdeRegex, 1)
  let note = ''
  if (accountNumber || accountName || phoneNumber) {
    note = `Transferencia a ${accountNumber || accountName || phoneNumber}`
  }
  if (desde) {
    note = `Transferencia desde ${desde}`
    type = 'income'
  }

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
    type,
    account: 'Bancolombia',
    amount,
    date,
    note,
    others: {
      accountName,
      accountNumber,
      phoneNumber,
      desde
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
