import { getTemplate } from '../templates.js'

export const normalizeEmail = (email) => {
  if (!email) return
  if (!/<(.*)>/.test(email)) return email.toLowerCase()
  return /<(.*)>/.exec(email)[1].toLowerCase()
}

export const createUIDArray = (start, end) => {
  const array = []
  for (let i = start; i <= end; i++) {
    array.push(i)
  }
  return array
}

export const numberNormalize = (number) => {
  return parseFloat(number.replace(/,/g, ''))
}

export const createTransactionObj = (transaction) => {
  return getTemplate({
    ...transaction,
    amount: numberNormalize(transaction.amount),
    note: transaction.note.toLowerCase()
  })
}
