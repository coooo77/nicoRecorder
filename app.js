require('dotenv').config()
const helper = require('./util/helper')
const { setting, url } = require('./config/config')
const { login, homePage } = require('./config/domSelector')

const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch(setting);
  const page = await browser.newPage();
  try {
    await page.goto(url.nicovideo, { waitUntil: 'domcontentloaded' });

    const { loginBtnSelector, loginAccountInput, loginPasswordInput } = login
    // // 檢查是否需要登入
    const loginBtn = await page.$(loginBtnSelector)
    if (loginBtn) {
      console.log('[System]User needs to login, start to login...')
      await page.click(loginAccountInput)
      await page.keyboard.type(process.env.NICO_ACCOUNT)
      await page.click(loginPasswordInput)
      await page.keyboard.type(process.env.NICO_PASSWORD)
      helper.wait(2000)
      await Promise.all([
        page.click(loginBtnSelector),
        page.waitForNavigation()
      ])
    }

    // 開始取得實況紀錄
    helper.wait(2000)
    console.log('[System]Start to fetch stream records...')
    const { timeLineItem, getMoreBtn } = homePage
    await page.waitForSelector(getMoreBtn)
    const records = await helper.getStreamRecords(page, timeLineItem)

    // 讀取記錄檔案    
    // TODO:設定超過一天的日期就不錄影了
    const streamRecords = await helper.getJSObjData('streamRecords')
    const usersData = await helper.getJSObjData('usersData')

    for (record of records) {
      // 更新使用者資料
      if (!usersData.ids.includes(record.userId)) {
        helper.upDateUserData(usersData, record)
      }

      // 對照紀錄，並把新紀錄給加入並錄影
      if (!streamRecords.ids.includes(record.id)) {
        console.log(`[System]Find a new record, save it to model and record the stream.`)
        streamRecords.ids.push(record.id)
        streamRecords.records.push(record)

        // 存取使用者資料做判斷
        console.log(`[System]開始對${record.userName}錄影，網址為${record.streamUrl}`)
        helper.recorderMaker(record)
      }
    }

    // 清除超過時限的錄影紀錄 // 要看哪個的設定? userData?還是config裡面的名單?
    // 需要一個初始化的設定，把需要建立的空白資料給建立

    // 貯存紀錄
    await Promise.all([
      helper.saveJSObjData('isStreaming', streamRecords),
      helper.saveJSObjData('usersData', usersData)
    ])

    console.log('Done')
  } catch (error) {
    console.log(error.name + ': ' + error.message)
  } finally {
    // await browser.close();
  }
})();