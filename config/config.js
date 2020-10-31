require('dotenv').config()

module.exports = {
  setting: {
    executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    userDataDir: "./userData"
  },
  url: {
    nicovideo: "https://www.nicovideo.jp/my"
  },
  checkStreamInterval: 1000 * 60,
  userFilter: {
    isActive: false,
    blockList: []
  },
  upDateUserData: {
    isActive: true
  },
  saveRecordConfig: {
    isActive: true,
    recordLifeSpan: 1000 * 60 * 60 * 24 * 7
  },
  recordSetting: {
    reTryInterval: 30,
    maxTryTimes: 60,
    prefix: '@'
  }
}

// saveRecordConfig.recordLifeSpan: 設定幾毫秒後刪除資料，預設是1000 * 60 * 60 * 24 * 7 = 7天內的資料都保存