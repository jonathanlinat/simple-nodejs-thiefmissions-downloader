const retrieveFanMissions = require('./modules/retrieveFanMissions')
const downloadFanMissions = require('./modules/downloadFanMissions')

;(async () => {
  console.log('Script started!')

  try {
    const onlineFanMissions = await retrieveFanMissions()
    await downloadFanMissions(onlineFanMissions)
  } catch (error) {
    console.error('Error:', error)
  }

  console.log('Script finalized!')
})()
