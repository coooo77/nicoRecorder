const { saveRecordConfig, recordSetting } = require('../config/config')
const { login } = require('../config/domSelector')
const { file } = require('../config/announce')
const cp = require('child_process')
const fs = require('fs')
const readline = require('readline');
require('dotenv').config()

const helper = {
  wait(ms) {
    return new Promise(resolve => setTimeout(() => resolve(), ms))
  },
  async login(page) {
    const { loginBtnSelector, loginAccountInput, loginPasswordInput } = login
    await page.click(loginAccountInput)
    await page.keyboard.type(process.env.NICO_ACCOUNT)
    await page.click(loginPasswordInput)
    await page.keyboard.type(process.env.NICO_PASSWORD)
    helper.wait(2000)
    await Promise.all([
      page.click(loginBtnSelector),
      page.waitForNavigation()
    ])
  },
  async getStreamRecords(page, selector) {
    const records = await page.$$eval(selector, (items) => items.map(item => {
      const parentNode = item.parentElement.parentElement.parentElement
      const header = parentNode.children[0]
      const body = parentNode.children[1]
      const userName = header.innerText
      const userIdUrl = (header.children[0].children[0] && header.children[0].children[0].href) || ''
      const userId = userIdUrl.replace('https://www.nicovideo.jp/user/', '')
      const streamUrl = (body.children[1] && body.children[1].href) || ''
      // let id = streamUrl.replace('https://live.nicovideo.jp/watch/lv', '')
      // id = id.includes('?') ? id.split('?')[0] : id
      const splitIndex = streamUrl.indexOf('lv')
      const id = streamUrl.slice(splitIndex + 2, splitIndex + 11)
      const createdTime = Date.now()
      const createdLocalTime = new Date()
      return ({
        id: Number(id),
        userName,
        userId,
        streamUrl,
        createdTime,
        createdLocalTime: createdLocalTime.toLocaleString(),
        isRecorded: false
      })
    }))
    return records
  },
  commandMaker(name, url) {
    return `
    @echo off\n
    set name=${name}\n
    set url=${url}\n
    set count=0\n
    :loop\n
    set hour=%time:~0,2%\n
    set TodayYear=%date:~0,4%\n
    set TodayMonthP0=%date:~5,2%\n
    set TodayDayP0=%date:~8,2%\n
    if "%hour:~0,1%" == " " set hour=0%hour:~1,1%\n
    set /a count+=1\n
    echo [CountDown] Loop for ${recordSetting.maxTryTimes} times, try %count% times ... \n
    streamlink %url% best -o D://JD\\%name%_Nico_%TodayYear%%TodayMonthP0%%TodayDayP0%_%hour%%time:~3,2%%time:~6,2%.ts\n
    if "%count%" == "${recordSetting.maxTryTimes}" exit\n
    echo [CountDown] count down for 30 sec...\n
    @ping 127.0.0.1 -n ${recordSetting.reTryInterval} -w 1000 > nul\n
    goto loop\n
    `
  },
  async getJSObjData(fileName) {
    let result = await fs.readFileSync(`./model/${fileName}.json`, 'utf8', (err, data) => data)
    result = JSON.parse(result)
    return result
  },
  async saveJSObjData(fileName, data) {
    return new Promise(async (resolve) => {
      fs.writeFile(
        `./model/${fileName}.json`,
        JSON.stringify(data),
        'utf8',
        (error) => {
          console.log(error);
        })
      helper.announcer(file.saved(fileName))
      resolve()
    })
  },
  upDateUserData(usersData, record) {
    usersData.records.push({
      id: usersData.ids.length,
      userName: record.userName,
      userId: record.userId,
      engName: `NicoUserId_${record.userId}`,
      disableTrack: false
    })
    usersData.ids.push(record.userId)
  },
  recorderMaker(record, fileName) {
    fs.writeFile(`./recorder/${fileName}.bat`, helper.commandMaker(fileName, record.streamUrl), (error) => {
      console.log(error);
    })
  },
  execFile(fileName, dirName) {
    const commands = cp.exec('start ' + dirName + `\\recorder\\${fileName}.bat`, (error, stdout, stderr) => {
      if (error) {
        console.log(`Name: ${error.name}\nMessage: ${error.message}\nStack: ${error.stack}`)
      }
    })
    // process.on('exit', function () {
    //   console.log(`${fileName}'s record process killed`)
    //   commands.kill()
    // })
  },
  timeRecord() {
    const time = new Date()
    const
      year = time.getFullYear(),
      month = time.getMonth() + 1,
      date = time.getDate(),
      hour = time.getHours(),
      minute = time.getMinutes()
    return `${year}_${month}${date}_${hour}${minute}`
  },
  startToRecord(userData, record, streamRecords, dirname) {
    // const fileName = `${recordSetting.prefix}${userData.engName}_${record.id}_${helper.timeRecord()}`
    const fileName = `${recordSetting.prefix}${userData.engName}_${record.id}`
    helper.recorderMaker(record, fileName)
    helper.execFile(fileName, dirname)
    const recordIndex = streamRecords.records.findIndex(item => record.id === item.id)
    streamRecords.records[recordIndex].isRecorded = true
  },
  deleteStreamRecords(streamRecords) {
    const now = Date.now()
    const records = streamRecords.records.filter(record => record.createdTime + saveRecordConfig.recordLifeSpan > now)
    streamRecords.records = records
    streamRecords.ids = records.map(record => record.id)
  },
  announcer(message, addNewLine = false) {
    console.log(`${addNewLine ? `\n` : ''}[System]${message}`)
    // console.log都從這函式出發，可以設計紀錄資訊做成log
  },
  manualInput(msg) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    return new Promise(resolve => {
      rl.question(msg, answer => {
        rl.close()
        resolve(answer)
      })
    })
  }
}

module.exports = helper