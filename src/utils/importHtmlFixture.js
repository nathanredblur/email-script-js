import fs from 'fs'
import path from 'path'

export const readHtmlFile = (filename) => {
  const appFolder = path.resolve('./src/')
  const filePath = path.join(appFolder, filename)
  return fs.readFileSync(filePath, 'utf8')
}

export const getParserFixture = (parserName, filename) => {
  const parserPath = `parsers/${parserName}/fixtures/${filename}`
  return readHtmlFile(parserPath)
}
