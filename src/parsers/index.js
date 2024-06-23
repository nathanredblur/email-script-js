import scotiabank from './scotiabank/scotiabank.js'
import bancolombia from './bancolombia/bancolombia.js'
import logger from '#root/utils/logger.js'

export const parserConfigs = [
  scotiabank,
  bancolombia
]

export const getParserConfig = (email) => {
  let parserConfig = parserConfigs.find((parserConfig) => {
    return parserConfig.email === email
  })

  const DEBUG_PARSER = process.env.DEBUG_PARSER

  if (DEBUG_PARSER) {
    logger.info(`parser: DEBUG_PARSER - ${DEBUG_PARSER}`)
    parserConfig = parserConfigs.find((parserConfig) => {
      return parserConfig.name === DEBUG_PARSER
    })
  }

  if (!parserConfig) {
    logger.info(`parser: Parser not found for email ${email}`)
    return
  }

  logger.info(`parser: selected ${parserConfig.name}`)
  return parserConfig
}

export default parserConfigs
