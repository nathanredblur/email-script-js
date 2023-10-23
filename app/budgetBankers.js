import puppeteer from 'puppeteer'
import fs from 'fs/promises'
import { readFileSync } from 'fs'

const conf = JSON.parse(readFileSync('./config.json'))
const DEBUG_BUDGET_BANKERS = process.env.DEBUG_BUDGET_BANKERS

const { budgetbakers } = conf
const cookiesPath = './session/cookies.json'
const sessionStoragePath = './session/sessionStorage.json'
const localStoragePath = './session/localStorage.json'

// CONFIG
const saveSession = false
const puppeteerConfig = {
  headless: 'new'
  // userDataDir: './tmp/myChromeSession'
}

if (DEBUG_BUDGET_BANKERS) puppeteerConfig.headless = false

const storeSession = async (page) => {
  const client = await page.target().createCDPSession()
  const { cookies } = await client.send('Storage.getCookies')
  const cookiesString = JSON.stringify(cookies)
  await fs.writeFile(cookiesPath, cookiesString)

  const sessionStorage = await page.evaluate(() => JSON.stringify(sessionStorage))
  await fs.writeFile(sessionStoragePath, sessionStorage)

  const localStorage = await page.evaluate(() => JSON.stringify(localStorage))
  await fs.writeFile(localStoragePath, localStorage)
}

const restoreSession = async (page) => {
  try {
    const cookiesString = await fs.readFile(cookiesPath)
    const cookies = JSON.parse(cookiesString)
    const client = await page.target().createCDPSession()
    await client.send('Storage.setCookies', { cookies })
  } catch (error) {
    console.log('cookies file not found')
  }

  try {
    const sessionStorageString = await fs.readFile(sessionStoragePath)
    const sessionStorage = JSON.parse(sessionStorageString)
    await Promise.all(Object.entries(sessionStorage).map(async ([key, value]) => {
      await page.evaluate((sessionKey, sessionValue) => {
        sessionStorage[sessionKey] = sessionValue
      }, key, value)
    }))
  } catch (error) {
    console.log('sessionStorage file not found')
  }

  // const localStorageString = await fs.readFile("./session/localStorage.json");
  // const localStorage = JSON.parse(localStorageString);
  // await page.evaluate((data) => {
  //   for (const [key, value] of Object.entries(data)) {
  //     localStorage[key] = value;
  //   }
  // }, sessionStorage);
}

const innit = async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch(puppeteerConfig)
  const page = await browser.newPage()
  await page.setViewport({ width: 1080, height: 1024 })
  return { browser, page }
}

const login = async (page) => {
  if (saveSession) {
    await page.goto('https://web.budgetbakers.com/dashboard')
    await restoreSession(page)
  }
  await page.goto('https://web.budgetbakers.com/dashboard')
  await page.waitForNavigation()

  // if record button is not visible, then do a full login
  let recordButton = await page.$('.ui.blue.mini.circular.compact.button')

  if (!recordButton) {
    await page.type('input[name="email"]', budgetbakers.email)
    await page.type('input[name="password"]', budgetbakers.password)
    await page.click('button[type="submit"]')
    await page.waitForNavigation()
    if (saveSession) await storeSession(page)
  }

  // check if record button is visible
  recordButton = await page.$('.ui.blue.mini.circular.compact.button')
  if (!recordButton) {
    throw new Error('Something went wrong')
  }
}

/**
  *  Add transaction to budgetbakers
  * @param {object} transactionObj transaction object
  * @param {string} transactionObj.type transaction type
  * @param {string} transactionObj.account transaction account
  * @param {string} transactionObj.category transaction category
  * @param {string} transactionObj.amount transaction amount
  * @param {string} transactionObj.date transaction date
  * @param {string} transactionObj.note transaction note
 */
export const addTransaction = async (transactionObj) => {
  const { browser, page } = await innit()
  await login(page)

  // click on add transaction
  await page.waitForSelector('.ui.blue.mini.circular.compact.button')
  await page.click('.ui.blue.mini.circular.compact.button')
  const modalSelector = '.ui.modal.visible.active'
  await page.waitForSelector(modalSelector)

  // select transaction type
  if (transactionObj.type === 'expense') {
    await page.click(`${modalSelector} .record-form-menu a:nth-child(1)`)
  }
  if (transactionObj.type === 'income') {
    await page.click(`${modalSelector} .record-form-menu a:nth-child(2)`)
  }

  // select account
  const accountSelector = `${modalSelector} .icon-select .ui.dropdown`
  await page.click(accountSelector)
  await page.waitForSelector(`${accountSelector}.ui.dropdown.visible`)

  // get list of accounts
  const accounts = await page.evaluate(() => {
    const accountsList = []
    document.querySelectorAll('.ui.modal.visible.active .icon-select .ui.dropdown .menu .item').forEach((el) => {
      accountsList.push(el.textContent)
    })
    return accountsList
  })

  // select account
  await page.click(`${accountSelector} .menu .item:nth-child(${accounts.indexOf(transactionObj.account) + 1})`)

  // select category
  const categorySelector = `${modalSelector} .select-category .ui.dropdown`
  await page.click(categorySelector)
  await page.waitForSelector(`${categorySelector}.ui.dropdown.visible`)

  // type category
  await page.click(`${categorySelector} input`)
  await page.type(`${categorySelector} input`, transactionObj.category)
  await page.waitForSelector(`${categorySelector} .menu .item:nth-child(1)`)
  await page.click(`${categorySelector} .menu .item:nth-child(1)`)

  // type amount
  let amount = transactionObj.amount
  if (typeof amount === 'number') amount = amount.toString()
  await page.type(`${modalSelector} .field-amount input`, amount)

  // type date in this format `Oct 16, 2023`
  const date = new Date(transactionObj.date)
  const dateStr = date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const input = await page.$(`${modalSelector} .field-date:nth-child(1) input`)
  await input.click({ clickCount: 3 }) // select all
  await input.type(dateStr)
  await page.keyboard.press('Tab')

  // FIXME: on set time, the date is changed to current date
  // type time in this format `8:24 PM`
  // const timeStr = date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
  // await page.type(`${modalSelector} .field-date:nth-child(2) input`, timeStr)
  await page.keyboard.press('Tab')

  // type note
  await page.type(`${modalSelector} .field-note textarea`, transactionObj.note)

  // click on save
  await page.click(`${modalSelector} .ui.primary.button`)
  // wait for modal to close
  await page.waitForSelector(modalSelector, { hidden: true })
  await page.waitForNetworkIdle()

  console.log('transaction added successfully')

  await browser.close()
}

// Test scanaerio
// addTransaction({
//   type: 'expense',
//   account: 'Scottiabank OneCash',
//   category: 'restaurant',
//   amount: '10.000',
//   date: '2023-09-16 20:24:00',
//   note: 'test'
// })
