import { readFileSync } from 'fs'
import Imap from 'imap'
import { simpleParser } from 'mailparser'

const conf = JSON.parse(readFileSync('./config.json'))

const imap = new Imap(conf.imap)

const openInbox = (cb) => {
  imap.openBox('INBOX', true, cb)
}

const processMessage = (msg, seqno, cb) => {
  console.log('Processing msg #' + seqno)

  msg.on('body', (stream, info) => {
    let buffer = ''

    stream.on('data', (chunk) => {
      buffer += chunk.toString('utf8')
    })
    stream.once('end', () => {
      const body = buffer.toString()
      simpleParser(body, {
        skipHtmlToText: true,
        skipTextToHtml: true,
        skipImageLinks: true
      })
        .then(parsed => {
          cb(seqno, parsed)
        })
        .catch(err => {
          console.log('err', err)
        })
    })
  })

  // msg.once('attributes', (attrs) => {
  //   console.log('Attributes: %s', inspect(attrs, false, 8));
  // });
}

const fetchEmail = (mnsNumber, bodies, cb) => {
  const f = imap.seq.fetch(mnsNumber + ':*', {
    bodies,
    struct: true
  })

  f.on('message', (msg, seqno) => {
    processMessage(msg, seqno, cb)
  })
  f.once('error', (err) => {
    console.log('Fetch error: ' + err)
  })
  f.once('end', function () {
    console.log('Done fetching all unseen messages.')
    // imap.end(); we don't want to close the connection
  })
}

const fetchHeader = (mnsNumber, cb) => {
  fetchEmail(mnsNumber, 'HEADER.FIELDS (FROM)', cb)
}

export const fetchBody = (mnsNumber, cb) => {
  fetchEmail(mnsNumber, 'TEXT', (seqno, bodyObj) => {
    cb(bodyObj)
  })
}

export const onEmail = (cb) => {
  imap.once('ready', () => {
    openInbox((err, box) => {
      if (err) throw err

      // on get a new email
      imap.on('mail', (numNewMsgs) => {
        console.log(`You have ${numNewMsgs} new messages`)
        fetchHeader([box.messages.total], (seqno, header) => {
          const email = header.from.value[0].address
          cb(email, box)
        })
      })
    })
  })

  imap.once('error', (err) => {
    console.log(err)
  })

  imap.once('end', function () {
    console.log('Connection ended')
  })

  imap.connect()
}
