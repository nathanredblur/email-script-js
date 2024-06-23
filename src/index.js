import { onEmail, fetchBody } from '#root/utils/emailClient.js'
import { getParserConfig } from '#root/parsers/index.js'
import { addTransaction } from '#root/utils/budgetBankers.js'
import logger from '#root/utils/logger.js'

const app = () => {
  onEmail((email, inbox) => {
    // if email is not in the parser config, ignore it
    const parserConfig = getParserConfig(email)

    if (parserConfig) {
      // fetch body and parse it
      fetchBody(inbox.messages.total, (bodyObj) => {
        const body = bodyObj.text
        const transaction = parserConfig.getTransaction(body)

        // validate transaction
        if (transaction) {
          const DEBUG_PARSER = process.env.DEBUG_PARSER
          if (DEBUG_PARSER) {
            transaction.note = `DEBUG_PARSER: ${DEBUG_PARSER}`
          }

          logger.log('transactionObj', transaction)
          addTransaction(transaction)
        }
      })
    }
  })
}

app()
