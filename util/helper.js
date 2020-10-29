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
  }
}

module.exports = helper