require('dotenv').config()
const { wait, getStreamRecords } = require('./util/helper')
const { setting, url } = require('./config/config')
const { login, homePage } = require('./config/domSelector')
const fs = require('fs')

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

    // 讀取記錄檔案    
    // 移動到helpers記得要把上面的fs給取消
    // 設定超過一天的日期就不錄影了
    let streamRecords = await fs.readFileSync('./model/streamRecords.json', 'utf8', (err, data) => data)
    streamRecords = JSON.parse(streamRecords)
    let usersData = await fs.readFileSync('./model/usersData.json', 'utf8', (err, data) => data)
    usersData = JSON.parse(usersData)

    for (record of records) {
      // 更新使用者資料
      if (!usersData.ids.includes(record.userId)) {
        usersData.records.push({
          id: usersData.ids.length,
          userName: record.userName,
          userId: record.userId,
          engName: `UnNamed${usersData.ids.length}`,
          disableTrack: false
        })
        usersData.ids.push(record.userId)
      }

      // 對照紀錄，並把新紀錄給加入並錄影
      if (!streamRecords.ids.includes(record.id)) {
        console.log(`[System]Find a new record, save it to model and record the stream.`)
        streamRecords.ids.push(record.id)
        streamRecords.records.push(record)

        // console.log(`[System]開始對${record.userName}錄影，網址為${record.streamUrl}`)
      }
    }

    // 清除超過時限的錄影紀錄


    // 貯存紀錄
    fs.writeFile(
      './model/isStreaming.json',
      JSON.stringify(streamRecords),
      'utf8',
      (error) => {
        console.log(error);
      })
    fs.writeFile(
      './model/usersData.json',
      JSON.stringify(usersData),
      'utf8',
      (error) => {
        console.log(error);
      })

    console.log('Done')
  } catch (error) {
    console.log(error.name + ': ' + error.message)
  } finally {
    // await browser.close();
  }
})();