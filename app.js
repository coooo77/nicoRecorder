const helper = require('./util/helper')
const { announcer } = require('./util/helper')
const { app, init } = require('./config/announce')
const { login, homePage, verification } = require('./config/domSelector')
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
      await page.screenshot({ path: 'afterLogin.png' });
    }

    const {
      verificationInput,
      verificationLoginBtn,
      verificationFailInfo
    } = verification
    const [input] = await Promise.all([page.$(verificationInput)])

    let timer

    if (input) {
      const verifyCode = await helper.manualInput(init.verification)
      await page.click(verificationInput)
      await page.keyboard.type(verifyCode)
      await Promise.all([
        page.click(verificationLoginBtn),
        page.waitForNavigation()
      ])
      await page.screenshot({ path: 'afterVerification.png' })

      timer = setTimeout(async () => {
        const invalidCodeInfo = await page.$(verificationFailInfo)

        if (invalidCodeInfo) {
          throw Error('Verification Fail')
        } else {
          throw Error('Verification Timeout')
        }
      }, 30000);
    }

    if (timer) clearTimeout(timer)

    // 開始取得實況紀錄
    await helper.wait(2000)
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
    let isDataUpdated = false
    for (record of records) {
      // 更新使用者資料
      if (!usersData.ids.includes(record.userId)) {
        helper.upDateUserData(usersData, record)
        isDataUpdated = true
      }

      // 對照紀錄，並把新紀錄給加入並錄影
      if (!streamRecords.ids.includes(record.id)) {
        announcer(app.findNewRecord)
        streamRecords.ids.push(record.id)
        streamRecords.records.push(record)
        isDataUpdated = true
        // 存取使用者資料做判斷
        const userData = usersData.records.find(user => user.userId === record.userId)
        if (!userData.disableTrack) {
          const { startToRecord } = app
          announcer(startToRecord(record.userName, record.streamUrl))
          helper.startToRecord(userData, record, streamRecords, __dirname)
        } else {
          const { stopToRecord } = app
          announcer(stopToRecord(record.userName))
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

    if (isDataUpdated) {
      await Promise.all([
        helper.saveJSObjData('streamRecords', streamRecords),
        helper.saveJSObjData('usersData', usersData)
      ])
    }

  } catch (error) {
    console.log(error.name + ': ' + error.message)
    if (error.message.includes('Verification')) {
      throw Error('Verification Fail from app.js')
    }
  } finally {
    await page.close();
  }
};