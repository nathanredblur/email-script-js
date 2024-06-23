import { describe, it, mock } from 'node:test'
import assert from 'node:assert'
import { getParserFixture } from '#root/utils/importHtmlFixture.js'
import parser from '#root/parsers/scotiabank/scotiabank.js'
import logger from '#root/utils/logger.js'

describe('Parser Scotiabank', () => {
  it('should return a transaction object with correct properties', () => {
    const html = getParserFixture('scotiabank', 'scotiabank1.html')
    const transaction = parser.getTransaction(html)

    assert.deepEqual(transaction, {
      type: 'expense',
      account: 'Scotiabank OneCash',
      amount: 24850,
      date: '2023/10/11 20:24:49',
      note: 'rappi restaurante.',
      category: 'restaurant'
    })
  })

  it('should return a fallback transaction object NOT match a transaction template', () => {
    const htmlOrigin = getParserFixture('scotiabank', 'scotiabank1.html')
    const html = htmlOrigin.replace('RAPPI RESTAURANTE.', 'FAKE UNKNOWN')

    mock.method(logger, 'warn', () => { })

    const transaction = parser.getTransaction(html)
    const call = logger.warn.mock.calls[0]

    assert.equal(call.arguments[1], 'templates: transaction not match any template')

    assert.deepEqual(transaction, {
      type: 'expense',
      account: 'Scotiabank OneCash',
      amount: 24850,
      date: '2023/10/11 20:24:49',
      note: 'fake unknown',
      category: 'other'
    })
  })

  it('should return a undefined with html is invalid', () => {
    const html = getParserFixture('scotiabank', 'scotiabank-invalid-html.html')

    mock.method(logger, 'error', () => { })

    const transaction = parser.getTransaction(html)
    const call = logger.error.mock.calls[0]

    assert.equal(call.arguments[1], 'parser: Scotiabank HTML is not correct')
    assert.equal(transaction, undefined)
  })

  it('should return undefined when the HTML is correct but the data is not correct', () => {
    const html = getParserFixture('scotiabank', 'scotiabank-invalid-data.html')

    mock.method(logger, 'error', () => { })

    const transaction = parser.getTransaction(html)
    const call = logger.error.mock.calls[0]

    assert.equal(call.arguments[1], 'parser: Scotiabank data is not correct')
    assert.equal(transaction, undefined)

    const keys = Object.keys(call.arguments[0].error)

    keys.forEach((key) => {
      assert.equal(call.arguments[0].error[key], true)
    })
  })
})
