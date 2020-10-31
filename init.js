(async () => {
  const fs = require('fs');
  const { announcer, saveJSObjData } = require('./util/helper')
  const { init } = require('./config/announce')
  const { recorder, model, streamRecords, usersData, initiationIsFinished } = init

  // 建立recorder資料夾  
  const recorderFolderLocation = './recorder'
  if (!fs.existsSync(recorderFolderLocation)) {
    announcer(recorder.isNotExist)
    announcer(recorder.startToCreateDirectory)
    fs.mkdirSync(recorderFolderLocation)
  }

  // 建立model資料夾 
  const modelFolderLocation = './model'
  if (!fs.existsSync(modelFolderLocation)) {
    announcer(model.isNotExist)
    announcer(model.startToCreateDirectory)
    fs.mkdirSync(modelFolderLocation)
  }

  // 建立streamRecords.json  
  const modelStreamRecordsLocation = './model/streamRecords.json'
  const streamRecordsObj = { records: [], ids: [] }
  if (!fs.existsSync(modelStreamRecordsLocation)) {
    announcer(streamRecords.isNotExist)
    announcer(streamRecords.startToCreate)
    await saveJSObjData('streamRecords', streamRecordsObj)
  }

  // 建立usersData.json
  const modelUsersDataLocation = './model/usersData.json'
  const usersDataObj = { records: [], ids: [] }
  if (!fs.existsSync(modelUsersDataLocation)) {
    announcer(usersData.isNotExist)
    announcer(usersData.startToCreate)
    await saveJSObjData('usersData', usersDataObj)
  }

  announcer(initiationIsFinished)
})()
