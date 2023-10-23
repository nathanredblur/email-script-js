export const bancolombia = {
  name: 'Bancolombia',
  email: [
    'info@bancolombia.com'
  ],
  catchSubject: [
    'Bancolombia - Comprobante de pago'
  ],
  validate: function (email) {
    return true
  },
  parserFunction: function (email) {
    const data = {
      date: '',
      amount: '',
      type: '',
      description: ''
    }

    if (email) {
      return data
    } else {
      console.log('email not found')
      return data
    }
  }
}
