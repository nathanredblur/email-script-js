import * as cheerio from 'cheerio'
import { createTransactionObj } from '#root/utils/utils.js'
import logger from '#root/utils/logger.js'

const amountRegex = /\$(\d{1,3}(,\d{3})*(\.\d+)?)/ // 1,234.56
const amountRegex2 = /(\d{1,3}(\.\d{3})*(,\d+)?)/ // 1.234,56
const dateRegex = /(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2})/ // 21/10/2023 20:37
const dateRegex2 = /(\d{2}:\d{2} \d{2}\/\d{2}\/\d{4})/ // 15:24 22/03/2024
const accountNumberRegex = /a cta (\d+)/
const accountNameRegex = /a ([\w\s]+) desde/
const phoneNumberRegex = /al cel (\d+)\./
const desdeRegex = /de ([\w\s]+) por \$/

const getByRegex = (str, regex, index = 0) => {
  const match = str.match(regex)
  return match ? match[index] : ''
}

const getTransaction = (html) => {
  if (!html) return

  const $ = cheerio.load(html)

  // validate is a transactional email from Bancolombia using header background color
  // international transactions have a slightly little different color
  const headerTransaction = $('table[bgcolor="#fc7f41"]').text()
  if (!headerTransaction.includes('Transaccional')) {
    logger.info('parser: Bancolombia HTML is not a transactional email')
    return
  }

  // using long selector
  const content = $('table table table:nth-child(4) table tr:nth-child(2) > td')

  // Validate is the correct html
  if (!content.length) {
    logger.error({
      html
    }, 'parser: Bancolombia HTML is not correct')
    return
  }

  const contentText = content.text().replace(/\s+/g, ' ').trim()
  const rawTransaction = {
    account: 'Bancolombia',
    others: {}
  }

  const isWithdraw = contentText.includes('Retiro')

  if (isWithdraw) {
    rawTransaction.type = 'transaction'
    rawTransaction.amount = getByRegex(contentText, amountRegex2).replace(/\./g, '').replace(',', '.')
    rawTransaction.date = getByRegex(contentText, dateRegex2).split(' ').reverse().join(' ')
    const place = getByRegex(contentText, /en (.*?)\. Hora/, 1)
    rawTransaction.note = `retiro en cajero ${place}`
  } else {
    rawTransaction.amount = getByRegex(contentText, amountRegex, 1)
    rawTransaction.date = getByRegex(contentText, dateRegex)

    // extra info
    const accountNumber = getByRegex(contentText, accountNumberRegex, 1)
    const accountName = getByRegex(contentText, accountNameRegex, 1)
    const phoneNumber = getByRegex(contentText, phoneNumberRegex, 1)
    const desde = getByRegex(contentText, desdeRegex, 1)

    if (desde) {
      rawTransaction.note = `Transferencia desde ${desde}`
      rawTransaction.type = 'income'
    } else {
      rawTransaction.type = 'expense'
    }

    if (accountNumber || accountName || phoneNumber) {
      rawTransaction.note = `Transferencia a ${accountNumber || accountName || phoneNumber}`
    }

    rawTransaction.others = {
      accountName,
      accountNumber,
      phoneNumber,
      desde
    }
  }

  // validate data not exist or is incorrect like
  // date not include numbers, amount is not a number, date string is too long or short, etc
  if (
    !rawTransaction.amount ||
    !rawTransaction.date ||
    !rawTransaction.note ||
    !/\d/.test(rawTransaction.date) ||
    !/\d/.test(rawTransaction.amount)
  ) {
    logger.error({
      amount: rawTransaction.amount,
      date: rawTransaction.date,
      note: rawTransaction.note,
      error: {
        amount: !rawTransaction.amount,
        date: !rawTransaction.date,
        note: !rawTransaction.note,
        dateHasNumbers: !/\d/.test(rawTransaction.date),
        amountHasNumbers: !/\d/.test(rawTransaction.amount)
      },
      html
    }, 'parser: Bancolombia data is not correct')
    return
  }

  const transaction = createTransactionObj(rawTransaction)
  return transaction
}

const config = {
  name: 'Bancolombia',
  email: 'alertasynotificaciones@notificacionesbancolombia.com',
  getTransaction
}

export default config
