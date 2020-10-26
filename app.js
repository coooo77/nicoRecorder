require('dotenv').config()
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
      await page.click(loginAccountInput)
      await page.keyboard.type(process.env.NICO_ACCOUNT)
      await page.click(loginPasswordInput)
      await page.keyboard.type(process.env.NICO_PASSWORD)
      await Promise.all([
        page.click(loginBtnSelector),
        page.waitForNavigation()
      ])
    }




  } catch (error) {
    console.log(error.name + ': ' + error.message)
  } finally {
    // await browser.close();
  }
})();