const { setting, checkStreamInterval } = require('./config/config.js')
const { nico } = require('./config/announce')
const { timeAnnounce, announcer } = require('./util/helper')
const app = require('./app')
const puppeteer = require('puppeteer-core');

let recursionTime = 1

function startApp(browser) {
  return new Promise((resolve, reject) => {
    try {
      setTimeout(async () => {
        announcer(nico.timeAnnounce(recursionTime++), true)
        await app(browser)
        resolve()
      }, checkStreamInterval)
    } catch (error) {
      console.error(error)
      reject()
    }
  })
};

(async () => {
  announcer(nico.startToMonitor)
  announcer(nico.timeAnnounce(recursionTime++), true)
  const browser = await puppeteer.launch(setting);
  await app(browser)
  while (true) {
    await startApp(browser)
  }
})()