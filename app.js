require('dotenv').config()
const { wait, getStreamRecords } = require('./util/helper')
const { setting, url } = require('./config/config')
const { login, homePage } = require('./config/domSelector')
const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch(setting);
  const page = await browser.newPage();
  try {
    await page.goto(url.nicovideo, { waitUntil: 'domcontentloaded' });

    const { loginBtnSelector, loginAccountInput, loginPasswordInput } = login
    // 檢查是否需要登入
    const loginBtn = await page.$(loginBtnSelector)
    if (loginBtn) {
      console.log('[System]User needs to login, start to login...')
      await page.click(loginAccountInput)
      await page.keyboard.type(process.env.NICO_ACCOUNT)
      await page.click(loginPasswordInput)
      await page.keyboard.type(process.env.NICO_PASSWORD)
      wait(2000)
      await Promise.all([
        page.click(loginBtnSelector),
        page.waitForNavigation()
      ])
    }

    // 開始取得實況紀錄
    wait(2000)
    console.log('[System]Start to fetch stream records...')
    const { timeLineItem, getMoreBtn } = homePage
    await page.waitForSelector(getMoreBtn)
    const records = await getStreamRecords(page, timeLineItem)

    console.log('records ==>', records)

  } catch (error) {
    console.log(error.name + ': ' + error.message)
  } finally {
    // await browser.close();
  }
})();