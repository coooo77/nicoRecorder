module.exports = {
  init: {
    recorder:{
      isNotExist:'Directory recorder is not exist',
      startToCreateDirectory: 'Start to create recorder directory'
    },
    model:{
      isNotExist: 'Directory model is not exist',
      startToCreateDirectory: 'Start to create model directory'
    },
    streamRecords:{
      isNotExist: 'StreamRecords.json is not exist',
      startToCreate: 'Start to create streamRecords.json'
    },
    usersData:{
      isNotExist: 'UsersData.json is not exist',
      startToCreate: 'Start to create usersData.json'
    },
    initiationIsFinished:'Initiation finished'
  },
  app:{
    startToLogin:'User needs to login, start to login...',
    startToFetchRecords:'Start to fetch stream records...',
    findNewRecord:'Find a new record, save it to model and record the stream',
    startToRecord:{
      pre:'Start to record user ',
      post:', url of stream is '
    },
    stopToRecord:{
      pre:'User',
      post:' record setting is disabled, stop to record'
    },
    recordsStatus:{
      isUpDated: 'Records updated',
      isUnChanged:'Records unChanged'
    }
  }
}