import { describe, it, mock } from 'node:test'
import assert from 'node:assert'
import { getParserConfig } from './index.js'
import scotiabank from './scotiabank/scotiabank.js'
import logger from '#root/utils/logger.js'

describe('Parsers', () => {
  it('get parser config by email', () => {
    const parserConfig = getParserConfig(scotiabank.email)
    assert.equal(parserConfig, scotiabank)
  })

  it('get parser config with DEBUG_PARSER', () => {
    mock.method(logger, 'info', () => { })

    process.env.DEBUG_PARSER = 'Bancolombia'
    const parserConfig = getParserConfig('fake@mail.com')
    assert.equal(parserConfig.name, 'Bancolombia')
    delete process.env.DEBUG_PARSER

    const calls = logger.info.mock.calls
    assert.equal(calls.length, 2)
    assert.equal(calls[0].arguments[0], 'parser: DEBUG_PARSER - Bancolombia')
    assert.equal(calls[1].arguments[0], 'parser: selected Bancolombia')
  })

  it('get parser config not found', () => {
    mock.method(logger, 'info', () => { })

    const parserConfig = getParserConfig('fake@mail.com')

    const call = logger.info.mock.calls[0]
    assert.equal(call.arguments[0], 'parser: Parser not found for email fake@mail.com')
    assert.equal(parserConfig, undefined)
  })
})
