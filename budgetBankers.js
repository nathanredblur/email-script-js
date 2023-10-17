import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import conf from "./config.json" assert { type: "json" };

const { budgetbakers } = conf;
const cookiesPath = "./session/cookies.json";
// const sessionStoragePath = "./session/sessionStorage.json";

const storeSession = async (page) => {
  const client = await page.target().createCDPSession();
  const cookies = (await client.send('Storage.getCookies')).cookies;
  const cookiesString = JSON.stringify(cookies);
  await fs.writeFile(cookiesPath, cookiesString);

  // const sessionStorage = await page.evaluate(() =>JSON.stringify(sessionStorage));
  // await fs.writeFile(sessionStoragePath, sessionStorage);
  
  // const localStorage = await page.evaluate(() => JSON.stringify(localStorage));
  // await fs.writeFile("./session/localStorage.json", localStorage);
}

const restoreSession = async (page) => {
  // if cookiesPath file exist, restore session
  try {
    const cookiesString = await fs.readFile(cookiesPath);
    const cookies = JSON.parse(cookiesString);
    const client = await page.target().createCDPSession();
    await client.send('Storage.setCookies', { cookies });
  } catch (error) {
    console.log('cookies file not found');
  }

  // try {
  //   const sessionStorageString = await fs.readFile(sessionStoragePath);
  //   const sessionStorage = JSON.parse(sessionStorageString);
  //   await page.evaluate((data) => {
  //     for (const [key, value] of Object.entries(data)) {
  //       sessionStorage[key] = value;
  //     }
  //   }, sessionStorage);
  // } catch (error) {
  //   console.log('sessionStorage file not found');
  // } 

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
  const browser = await puppeteer.launch({
    // headless: 'new',
    headless: false,
  });
  const page = await browser.newPage();
  await page.setViewport({width: 1080, height: 1024});
  return {browser, page};
}

const login = async (page) => {
  await page.goto('https://web.budgetbakers.com/dashboard');
  await restoreSession(page);
  await page.goto('https://web.budgetbakers.com/dashboard');

  // if record button is not visible, then do a full login
  let recordButton = await page.$('.ui.blue.mini.circular.compact.button');

  if (!recordButton) {
    await page.type('input[name="email"]', budgetbakers.email);
    await page.type('input[name="password"]', budgetbakers.password);
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
    await storeSession(page);
  }

  // check if record button is visible
  recordButton = await page.$('.ui.blue.mini.circular.compact.button');
  if (!recordButton) {
    throw new Error('Something went wrong');
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
  const {browser, page} = await innit();
  await login(page);

  // click on add transaction
  await page.click('.ui.blue.mini.circular.compact.button');
  const modalSelector = '.ui.modal.visible.active';
  await page.waitForSelector(modalSelector);


  // select transaction type
  if (transactionObj.type === 'expense') {
    await page.click(`${modalSelector} .record-form-menu a:nth-child(1)`);
  }
  if (transactionObj.type === 'income') {
    await page.click(`${modalSelector} .record-form-menu a:nth-child(2)`);
  }

  // select account
  const accountSelector = `${modalSelector} .icon-select .ui.dropdown`;
  await page.click(accountSelector);
  await page.waitForSelector(`${accountSelector}.ui.dropdown.visible`);

  // get list of accounts
  const accounts = await page.evaluate(() => {
    const accounts = [];
    document.querySelectorAll(`.ui.modal.visible.active .icon-select .ui.dropdown .menu .item`).forEach((el) => {
      accounts.push(el.textContent);
    });
    return accounts;
  });

  // select account
  await page.click(`${accountSelector} .menu .item:nth-child(${accounts.indexOf(transactionObj.account) + 1})`);

  // select category
  const categorySelector = `${modalSelector} .select-category .ui.dropdown`;
  await page.click(categorySelector);
  await page.waitForSelector(`${categorySelector}.ui.dropdown.visible`);

  // type category
  await page.type(`${categorySelector} input`, transactionObj.category);
  await page.waitForSelector(`${categorySelector} .menu .item:nth-child(1)`);
  await page.click(`${categorySelector} .menu .item:nth-child(1)`);

  // type amount
  await page.type(`${modalSelector} .field-amount input`, transactionObj.amount);

  // type date in this format `Oct 16, 2023`
  const date = new Date(transactionObj.date);
  const dateStr = date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  await page.type(`${modalSelector} .field-date:nth-child(1) input`, dateStr);
  await page.keyboard.press('Tab');

  // type time in this format `8:24 PM`
  const timeStr = date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
  await page.type(`${modalSelector} .field-date:nth-child(2) input`, timeStr);
  await page.keyboard.press('Tab');

  // type note
  await page.type(`${modalSelector} .field-note textarea`, transactionObj.note);

  // click on save
  await page.click(`${modalSelector} .ui.primary.button`);

  await browser.close();
}