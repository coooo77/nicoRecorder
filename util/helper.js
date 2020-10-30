const { recordSetting } = require('../config/config')
const fs = require('fs')

const helper = {
  wait(ms) {
    return new Promise(resolve => setTimeout(() => resolve(), ms))
  },
  async getStreamRecords(page, timeLineItem) {
    const records = await page.$$eval(timeLineItem, items => items.map(item => {
      const parentNode = item.children[0]
      const header = parentNode.children[0]
      const body = parentNode.children[1]
      const userName = header.innerText
      const userIdUrl = header.children[0].children[0].href
      const userId = userIdUrl.replace('https://www.nicovideo.jp/user/', '')
      const streamUrl = body.children[1].href
      const id = streamUrl.replace('https://live.nicovideo.jp/watch/lv', '')
      const createdTime = Date.now()
      return ({
        id: Number(id),
        userName,
        userId,
        streamUrl,
        createdTime,
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
    if "%hour:~0,1%" == " " set hour=0%hour:~1,1%\n
    set /a count+=1\n
    echo [CountDown] Loop for ${recordSetting.maxTryTimes} times, try %count% times ... \n
    streamlink %url% best -o D://JD\\%name%_Nico_%DATE%_%hour%%time:~3,2%%time:~6,2%.mp4\n
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
      console.log(`[System]${fileName}.json is saved.`)
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
  recorderMaker(record, name = record.id){
    fs.writeFile(`./recorder/@${name}.bat`, this.commandMaker(record.id, record.streamUrl), (error) => {
      console.log(error);
    })
  }
}

module.exports = helper