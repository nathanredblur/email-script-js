import { describe, it, mock } from 'node:test'
import assert from 'node:assert'
import { getParserFixture } from '#root/utils/importHtmlFixture.js'
import parser from '#root/parsers/bancolombia/bancolombia.js'
import logger from '#root/utils/logger.js'

describe('parser bancolombia', () => {
  it('should return a transaction object for transfers', () => {
    const html = getParserFixture('bancolombia', 'bancolombia-transf.html')
    const transaction = parser.getTransaction(html)

    assert.deepEqual(transaction, {
      account: 'Bancolombia',
      type: 'expense',
      amount: 15000,
      date: '21/10/2023 20:37',
      note: 'transferencia a 23127583361',
      others: {
        accountName: '',
        accountNumber: '23127583361',
        phoneNumber: '',
        desde: ''
      },
      category: 'other'
    })
  })

  it('should return a transaction object for QR-transfers', () => {
    const html = getParserFixture('bancolombia', 'bancolombia-transf-qr.html')
    const transaction = parser.getTransaction(html)

    assert.deepEqual(transaction, {
      account: 'Bancolombia',
      type: 'expense',
      amount: 60000,
      date: '26/10/2023 01:32',
      note: 'Restaurante Rincon del Pacifico transferencia a 3393',
      others: {
        accountName: '',
        accountNumber: '3393',
        phoneNumber: '',
        desde: ''
      },
      category: 'restaurant'
    })
  })

  it('should return a transaction object for bill payment', () => {
    const html = getParserFixture('bancolombia', 'bancolombia-bill.html')
    const transaction = parser.getTransaction(html)

    assert.deepEqual(transaction, {
      account: 'Bancolombia',
      type: 'expense',
      amount: 2290003.4,
      date: '02/10/2023 10:07',
      note: 'transferencia a banco davivienda sa',
      others: {
        accountName: 'BANCO DAVIVIENDA SA',
        accountNumber: '',
        phoneNumber: '',
        desde: ''
      },
      category: 'other'
    })
  })

  it('should return a transaction object for transfiya transaction', () => {
    const html = getParserFixture('bancolombia', 'bancolombia-transfiya.html')
    const transaction = parser.getTransaction(html)

    assert.deepEqual(transaction, {
      account: 'Bancolombia',
      type: 'expense',
      amount: 10000,
      date: '01/10/2023 11:42',
      note: 'transferencia a 3001234455',
      others: {
        accountName: '',
        accountNumber: '',
        phoneNumber: '3001234455',
        desde: ''
      },
      category: 'other'
    })
  })

  it('should return a transaction object for deposit', () => {
    const html = getParserFixture('bancolombia', 'bancolombia-deposit.html')
    const transaction = parser.getTransaction(html)

    assert.deepEqual(transaction, {
      account: 'Bancolombia',
      type: 'income',
      amount: 999123456,
      date: '06/10/2023 07:33',
      note: 'transferencia desde juanita perez',
      others: {
        accountName: '',
        accountNumber: '',
        phoneNumber: '',
        desde: 'Juanita Perez'
      },
      category: 'other'
    })
  })

  it('should return a transaction object for withdraw', () => {
    const html = getParserFixture('bancolombia', 'bancolombia-retiro.html')
    const transaction = parser.getTransaction(html)

    assert.deepEqual(transaction, {
      account: 'Bancolombia',
      type: 'transaction',
      amount: 300000,
      date: '22/03/2024 15:24',
      note: 'retiro en cajero narnia_torre2',
      others: {},
      category: 'other'
    })
  })

  it('should return undefine for international transaction', () => {
    const html = getParserFixture('bancolombia', 'bancolombia-inter.html')
    mock.method(logger, 'info', () => { })
    const transaction = parser.getTransaction(html)
    const call = logger.info.mock.calls[0]

    assert.equal(call.arguments[0], 'parser: Bancolombia HTML is not a transactional email')
    assert.deepEqual(transaction, undefined)
  })

  it('should return undefine for no transaction email', () => {
    const html = getParserFixture('bancolombia', 'bancolombia-informative.html')
    mock.method(logger, 'info', () => { })
    const transaction = parser.getTransaction(html)
    const call = logger.info.mock.calls[0]

    assert.equal(call.arguments[0], 'parser: Bancolombia HTML is not a transactional email')
    assert.deepEqual(transaction, undefined)
  })

  it('should return undefine for invalid html', () => {
    const html = getParserFixture('bancolombia', 'bancolombia-invalid-content.html')
    mock.method(logger, 'error', () => { })
    const transaction = parser.getTransaction(html)
    const call = logger.error.mock.calls[0]

    assert.equal(call.arguments[1], 'parser: Bancolombia HTML is not correct')
    assert.deepEqual(transaction, undefined)
  })

  it('should return undefined when the HTML is correct but the data is not correct', () => {
    const html = getParserFixture('bancolombia', 'bancolombia-invalid-data.html')

    mock.method(logger, 'error', () => { })

    const transaction = parser.getTransaction(html)
    const call = logger.error.mock.calls[0]

    assert.equal(call.arguments[1], 'parser: Bancolombia data is not correct')
    assert.equal(transaction, undefined)

    const keys = Object.keys(call.arguments[0].error)

    keys.forEach((key) => {
      assert.equal(call.arguments[0].error[key], true)
    })
  })
})
