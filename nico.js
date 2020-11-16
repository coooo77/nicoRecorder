const { setting, checkStreamInterval } = require('./config/config.js')
const { nico } = require('./config/announce')
const { timeAnnounce, announcer } = require('./util/helper')
const app = require('./app')
const puppeteer = require('puppeteer-core');

function runningApp(count, browser) {
  return new Promise((resolve, reject) => {
    try {
      let test = setInterval(async function () {
        announcer(nico.timeAnnounce(count++), true)
        await app(browser)
        if (count === 1000) {
          clearInterval(test)
          test = null
          resolve(count)
        }
      }, checkStreamInterval);
    } catch (error) {
      console.log(error)
      reject()
    }
  })
}

(async () => {
  announcer(nico.startToMonitor)
  let count = 1
  announcer(nico.timeAnnounce(count++), true)
  const browser = await puppeteer.launch(setting);
  await app(browser)
  while (true) {
    count = await runningApp(count, browser)
  }
})()