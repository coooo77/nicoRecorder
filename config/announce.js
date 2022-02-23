module.exports = {
  init: {
    recorder: {
      isNotExist: 'Directory recorder is not exist',
      startToCreateDirectory: 'Start to create recorder directory'
    },
    model: {
      isNotExist: 'Directory model is not exist',
      startToCreateDirectory: 'Start to create model directory'
    },
    streamRecords: {
      isNotExist: 'StreamRecords.json is not exist',
      startToCreate: 'Start to create streamRecords.json'
    },
    usersData: {
      isNotExist: 'UsersData.json is not exist',
      startToCreate: 'Start to create usersData.json'
    },
    initiationIsFinished: 'Initiation finished',
    verification: 'User needs to verify identify, enter code please. '
  },
  app: {
    startToLogin: 'User needs to login, start to login...',
    startToFetchRecords: 'Start to fetch stream records...',
    findNewRecord: 'Find a new record, save it to model and record the stream',
    startToRecord: (msg, url) => `Start to record user ${msg} , url of stream is ${url}`,
    stopToRecord: msg => `User ${msg} record setting is disabled, stop to record`,
    recordsStatus: {
      isUpDated: 'Records updated',
      isUnChanged: 'Records unChanged'
    }
  },
  file: {
    saved: msg => `${msg}.json is saved`
  },
  nico: {
    startToMonitor: 'Start to monitor nico web site ...',
    timeAnnounce: msg => `第${msg}次執行檢查，輸入ctrl+c結束錄影 ${new Date().toLocaleString()}`
  }
}