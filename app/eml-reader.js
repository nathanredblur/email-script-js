import EmlParser from 'eml-parser'
import fs from 'fs'

// get first argumnet from command line
const emailFile = process.argv[2]

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
      fs.writeFileSync('./app/parsers/test.html', htmlString)
    })
    .catch(err => {
      console.log(err)
    })
}

readEmailFile(emailFile)
