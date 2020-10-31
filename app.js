const helper = require('./util/helper')
const { announcer } = require('./util/helper')
const { app } = require('./config/announce')
const { login, homePage } = require('./config/domSelector')
const { url, saveRecordConfig } = require('./config/config')

module.exports = async (browser) => {
  const page = await browser.newPage();
  try {
    await page.goto(url.nicovideo, { waitUntil: 'domcontentloaded' });

    // 檢查是否需要登入
    const { loginBtnSelector } = login
    const [loginBtn] = await Promise.all([page.$(loginBtnSelector)])
    if (loginBtn) {
      announcer(app.startToLogin)
      await helper.login(page)
    }

    // 開始取得實況紀錄
    helper.wait(2000)
    announcer(app.startToFetchRecords)
    const { activeTimeLineItem, getMoreBtn } = homePage

    await page.waitForSelector(getMoreBtn)
    const records = await helper.getStreamRecords(page, activeTimeLineItem)

    // 讀取記錄檔案
    const [streamRecords, usersData] = await Promise.all([
      helper.getJSObjData('streamRecords'),
      helper.getJSObjData('usersData')
    ])
    const oldRecordLength = streamRecords.ids.length

    for (record of records) {
      // 更新使用者資料
      if (!usersData.ids.includes(record.userId)) {
        helper.upDateUserData(usersData, record)
      }

      // 對照紀錄，並把新紀錄給加入並錄影
      if (!streamRecords.ids.includes(record.id)) {
        announcer(app.findNewRecord)
        streamRecords.ids.push(record.id)
        streamRecords.records.push(record)

        // 存取使用者資料做判斷
        const userData = usersData.records.find(user => user.userId === record.userId)
        if (!userData.disableTrack) {
          const { startToRecord } = app
          const { pre, post } = startToRecord
          announcer(`${pre}${record.userName}${post}${record.streamUrl}`)
          helper.startToRecord(userData, record, streamRecords, __dirname)
        } else {
          const { stopToRecord } = app
          const { pre, post } = stopToRecord
          announcer(`${pre}${record.userName}${post}`)
        }
      }
    }

    // 清除超過時限的錄影紀錄
    if (saveRecordConfig.isActive) {
      helper.deleteStreamRecords(streamRecords)
    }

    // 貯存紀錄
    const { recordsStatus } = app
    if (oldRecordLength === streamRecords.ids.length) {
      announcer(recordsStatus.isUnChanged)
    } else {
      announcer(recordsStatus.isUpDated)
    }
    await Promise.all([
      helper.saveJSObjData('streamRecords', streamRecords),
      helper.saveJSObjData('usersData', usersData)
    ])

  } catch (error) {
    console.log(error.name + ': ' + error.message)
  } finally {
    await page.close();
  }
};