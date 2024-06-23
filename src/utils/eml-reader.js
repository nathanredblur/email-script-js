import EmlParser from 'eml-parser'
import fs from 'fs'

/**
 *
 * @param {string} emlPath
 * @returns
 */
const readEmailFile = (emlPath) => {
  if (!emlPath) {
    console.log('Please provide an email file')
    return
  }

  // if email file not found
  if (!fs.existsSync(emlPath)) {
    console.log(`Email file not found: ${emlPath}`)
    return
  }

  const emailFile = fs.createReadStream(emlPath)

  new EmlParser(emailFile)
    .getEmailBodyHtml()
    .then(htmlString => {
      console.log(htmlString)
      fs.writeFileSync(
        emlPath.replace('.eml', '.html'),
        htmlString,
        {
          encoding: 'utf8',
          flag: 'w'
        },
        (err) => {
          if (err) throw err
          console.log("It's saved!")
        })
    })
    .catch(err => {
      console.log(err)
    })
}

// get first argumnet from command line
const emlFilePath = process.argv[2]
readEmailFile(emlFilePath)
