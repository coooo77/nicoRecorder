const { setting, checkStreamInterval } = require('./config/config.js')
const { nico } = require('./config/announce')
const { timeAnnounce, announcer } = require('./util/helper')
const app = require('./app')
const puppeteer = require('puppeteer-core');
(async () => {
  announcer(nico.startToMonitor)
  let count = 1
  announcer(nico.timeAnnounce(count++),true)
  const browser = await puppeteer.launch(setting);
  await app(browser)
  setInterval(async function () {
    announcer(nico.timeAnnounce(count++), true)
    await app(browser)
  }, checkStreamInterval)
})()