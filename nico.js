const { setting, checkStreamInterval } = require('./config/config.js')
const { timeAnnounce } = require('./util/helper')
const nico = require('./app')
const puppeteer = require('puppeteer-core');
(async () => {
  console.log('[System]Start to monitor nico web site ...')
  let count = 1
  timeAnnounce(count++)
  const browser = await puppeteer.launch(setting);
  await nico(browser)
  setInterval(async function () {
    timeAnnounce(count++)
    await nico(browser)
  }, checkStreamInterval)
})()