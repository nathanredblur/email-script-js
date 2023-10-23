import scotiabank from './scotiabank.js'

const DEBUG_PARSER = process.env.DEBUG_PARSER

export const parserConfigs = [
  scotiabank
]

export const getParserConfig = (email) => {
  let parserConfig = parserConfigs.find((parserConfig) => {
    return parserConfig.email === email
  })

  if (DEBUG_PARSER) {
    console.log(`DEBUG_PARSER: ${DEBUG_PARSER}`)
    parserConfig = parserConfigs.find((parserConfig) => {
      return parserConfig.name === DEBUG_PARSER
    })
  }

  if (!parserConfig) {
    console.log(`Parser not found for email: ${email}`)
    return
  }

  console.log('parserConfig', parserConfig.name)
  return parserConfig
}

export default parserConfigs
