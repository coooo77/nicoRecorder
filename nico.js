const { setting, checkStreamInterval } = require('./config/config.js')
const helper = require('./util/helper')
const nico = require('./app')
const puppeteer = require('puppeteer-core');
(async () => {
  console.log('[System]Start to monitor nico web site ...')
  let count = 1
  helper.timeAnnounce(count)
  const browser = await puppeteer.launch(setting);
  await nico(browser)
  setInterval(async function () {
    helper.timeAnnounce(count)
    await nico(browser)
  }, checkStreamInterval)
})()