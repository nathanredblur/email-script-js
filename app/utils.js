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

// TODO: create a transaction type finder base on the data
export const createTransactionObj = ({
  type,
  account,
  amount,
  date,
  note
}) => {
  const normNote = note.toLowerCase()
  const normAmount = numberNormalize(amount)
  let category = 'other'

  // check if it is a restaurant
  const restaurantFastFood = ['restaurante']
  if (restaurantFastFood.some((word) => normNote.includes(word))) {
    category = 'restaurant'
  }

  // check if it is a taxi
  const taxi = ['uber']
  if (taxi.some((word) => normNote.includes(word))) {
    category = 'taxi'
  }

  // check if it is a internet
  if (
    normNote.includes('movistar') &&
    normAmount === 59791
  ) {
    category = 'internet'
  }

  return {
    type,
    account,
    amount: normAmount,
    date,
    note,
    category
  }
}
