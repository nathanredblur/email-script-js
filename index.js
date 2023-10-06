import conf from "./config.json" assert { type: "json" };
import Imap from 'imap';
import { inspect } from 'util';

const imap = new Imap(conf.imap);

const openInbox = (cb) => {
  imap.openBox('INBOX', true, cb);
}

const fetchEmail = (mnsNumber, bodies, cb) => {
  const f = imap.seq.fetch(mnsNumber + ':*', {
    bodies,
    struct: true
  })

  f.on('message', (msg, seqno) => {
    msg.on('body', (stream, info) => {
      let buffer = '';

      stream.on('data', (chunk) => {
        buffer += chunk.toString('utf8');
      });
      stream.once('end', () => {
        if (info.which !== 'TEXT'){
          const header = Imap.parseHeader(buffer);
          cb(seqno, header);
        } else {
          cb(seqno, buffer);
        }
      });
    });
    // msg.once('attributes', (attrs) => {
    //   console.log('Attributes: %s', inspect(attrs, false, 8));
    // });
  });
}

const fetchHeader = (mnsNumber, cb) => {
  fetchEmail(mnsNumber, ['HEADER.FIELDS (FROM TO SUBJECT DATE)'], cb);
}

const fetchBody = (mnsNumber, cb) => {
  fetchEmail(mnsNumber, ['TEXT'], cb);
}

const parserConfigs = [
  {
    name: 'Bancolombia',
    email: [
      'jonathan.rico@getaround.com',
    ],
  },
]

const normalizeEmail = (email) => {
  if (!email) return;
  if (!/<(.*)>/.test(email)) return email.toLowerCase();
  return /<(.*)>/.exec(email)[1].toLowerCase();
}

const getParserConfig = (email) => {
  const parserConfig = parserConfigs.find((parserConfig) => {
    return parserConfig.email.includes(email);
  });

  return parserConfig;
}


imap.once('ready', () => {
  openInbox((err, box) => {
    if (err) throw err;

    // on get a new email
    imap.on('mail', (numNewMsgs) => {
      console.log(`You have ${numNewMsgs} new messages`);
      fetchHeader(box.messages.total, (seqno, header) => {
        const email = normalizeEmail(header.from[0]);

        // if email is not in the parser config, ignore it
        const parserConfig = getParserConfig(email);

        if (parserConfig) {
          // fetch body and parse it
          fetchBody(box.messages.total, (seqno, body) => {
            console.log('(#' + seqno + ') ' + 'Parsed header: %s', inspect(header));
            console.log('Body [%s] Finished', inspect(body));
          });
        }
      });
    });
  });
});

imap.once('error', (err) =>  {
  console.log(err);
});

imap.once('end', function() {
  console.log('Connection ended');
});

imap.connect();

// ---------------

// import { MailParser } from "mailparser";

// const client = inbox.createConnection(false, conf.host, {
//   secureConnection: true,
//   auth: conf.auth,
// });

// client.connect();

// client.on("connect", function () {
//   console.log(`connected to ${conf.host}`);
//   client.openMailbox("INBOX", { readOnly: true }, function (error, info) {
//     if (error) throw error;
//     console.log("listening on inbox");
//   });
// });

// client.on("new", async function (message) {

//   try {
//     let messageStream = await client.createMessageStream(message.UID);
//     let messageParsed = await MailParser.simpleParser(messageStream);
//     let email = {
//       from: String(messageParsed.from.address),
//       subject: String(messageParsed.subject),
//       body: String(messageParsed.text)
//     }

//     console.log(email);

//     // if (email.from.toUpperCase() == conf.email.toUpperCase() && email.subject.toUpperCase() == conf.catchSubject.toUpperCase()) {
//     //   let bodyParsed = email.body.match(regex);
//     //   if (bodyParsed && bodyParsed.length === 2){
//     //     try {
//     //       let sheet = await sheetsConnect();
//     //       await updateRow(sheet, bodyParsed);
//     //     } catch (err) {
//     //       console.log(err);
//     //     }
        
//     //   } else{
//     //     console.log("email/subject passed, invalid body...","email:", email,"parsed body:", bodyParsed)
//     //   }
//     // } else{
//     //   console.log("email/subject failed","email:", email,"expected:",conf.email, ", ", conf.catchSubject )
//     // }
    
//   } catch (err) {
//     console.log(err);
//   }
// });

