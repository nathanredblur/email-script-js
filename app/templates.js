const uberTrip = (transaction) => {
  if (transaction.note.includes('uber')) {
    return {
      ...transaction,
      category: 'taxi'
    }
  }
}

const rappiRestaurant = (transaction) => {
  if (transaction.note.includes('Rappi restaurante')) {
    return {
      ...transaction,
      category: 'restaurant'
    }
  }
}

const rappiPrime = (transaction) => {
  if (transaction.note.includes('Rappi prime')) {
    return {
      ...transaction,
      category: 'subscriptions'
    }
  }
}

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

const mercadoPago = (transaction) => {
  if (transaction.note.includes('mercado pago')) {
    return {
      ...transaction,
      category: 'Shopping'
    }
  }
}

const templates = [
  uberTrip,
  rappiRestaurant,
  rappiPrime,
  movistarInternet,
  movistarPhone,
  mercadoPago
]

export const getTemplate = (transaction) => {
  for (const template of templates) {
    const result = template(transaction)
    if (result) return result
  }

  console.log('transaction not match any template', transaction)

  return {
    ...transaction,
    category: 'other'
  }
}
