import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import bancolombia from './bancolombia.js'

const { getTransaction } = bancolombia

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const filePath = path.join(__dirname, 'bancolombia6.test.html')
const html = fs.readFileSync(filePath, 'utf8')

const transaction = getTransaction(html)

console.log(transaction)
