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
  checkStreamInterval: 60000,
  userFilter: {
    active: false,
    blockList: []
  },
  upDateUserData: {
    active: true
  },
  saveRecordConfig: {
    active: true,
    recordLifeSpan: 1000 * 60 * 60 * 24 * 30
  },
  recordSetting: {
    reTryInterval: 30,
    maxTryTimes: 60
  }
}