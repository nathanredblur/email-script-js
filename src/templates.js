import logger from '#root/utils/logger.js'

/**
 * Options for showing a dialog.
 * @typedef {Object} Transaction
 * @property {string} type "expense" | "income"
 * @property {string} account Account name
 * @property {number} amount Transaction amount
 * @property {string} date Transaction date
 * @property {string} note Transaction note
 * @property {string} category Transaction category
 * @property {Object} others Other data
 */

/**
 * @param {Transaction} transaction
 * @returns {Transaction}
 */
const uberTrip = (transaction) => {
  if (transaction.note.includes('uber')) {
    return {
      ...transaction,
      category: 'taxi'
    }
  }
}

/**
 * @param {Transaction} transaction
 * @returns {Transaction}
 */
const rappiRestaurant = (transaction) => {
  if (transaction.note.includes('rappi restaurante')) {
    return {
      ...transaction,
      category: 'restaurant'
    }
  }
}

/**
 * @param {Transaction} transaction
 * @returns {Transaction}
 */
const rappiPrime = (transaction) => {
  if (transaction.note.includes('rappi prime')) {
    return {
      ...transaction,
      category: 'subscriptions'
    }
  }
}

/**
 * @param {Transaction} transaction
 * @returns {Transaction}
 */
const movistarInternet = (transaction) => {
  if (
    transaction.note.includes('movistar') &&
    transaction.amount >= 59791
  ) {
    return {
      ...transaction,
      category: 'internet'
    }
  }
}

/**
 * @param {Transaction} transaction
 * @returns {Transaction}
 */
const movistarPhone = (transaction) => {
  if (
    transaction.note.includes('movistar') &&
    transaction.amount >= 19990 &&
    transaction.amount <= 59791
  ) {
    return {
      ...transaction,
      category: 'phone'
    }
  }
}

/**
 * @param {Transaction} transaction
 * @returns {Transaction}
 */
const mercadoPago = (transaction) => {
  if (transaction.note.includes('mercado pago')) {
    return {
      ...transaction,
      category: 'Shopping'
    }
  }
}

/**
 * @param {Transaction} transaction
 * @returns {Transaction}
 */
const bancolombia = (transaction) => {
  if (transaction.account === 'Bancolombia') {
    let category = 'other'
    let note = transaction.note

    // Restaurante Rincon del Pacifico
    if (transaction.others.accountNumber === '3393') {
      category = 'restaurant'
      note = `Restaurante Rincon del Pacifico ${transaction.note}`
    }

    // Renta de apartamento
    if (transaction.others.accountName === 'HABITAMOS PROPIEDAD') {
      category = 'rent'
    }

    // aseo
    if (transaction.others.accountNumber === '31018228265') {
      category = 'Aseo'
      note = `Julieth Aseo ${transaction.note}`
    }

    // salud y pension
    if (transaction.others.accountName === 'ENLACE OPERATIVO S.A') {
      category = 'charges'
      note = `Salud y pensión ${transaction.note}`
    }

    return {
      ...transaction,
      note,
      category
    }
  }
}

const templates = [
  uberTrip,
  rappiRestaurant,
  rappiPrime,
  movistarInternet,
  movistarPhone,
  mercadoPago,
  bancolombia
]

export const getTemplate = (transaction) => {
  for (const template of templates) {
    const result = template(transaction)
    if (result) return result
  }

  logger.warn(transaction, 'transaction not match any template')

  return {
    ...transaction,
    category: 'other'
  }
}
