require('dotenv').config()

module.exports = {
  setting: {
    executablePath: "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    headless: false,
    userDataDir: "./userData"
  },
  url: {
    nicovideo: "https://www.nicovideo.jp/my"
  },
  interval: 60000,
  userFilter: false,
  addNewUser: true
}