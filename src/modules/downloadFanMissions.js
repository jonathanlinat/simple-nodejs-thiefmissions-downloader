const { baseUrl } = require('../_shared/constants')
const { cheerio, EasyDl, withQuery, fetch } = require('../_shared/dependencies')
const {
  convertBytesToMegabytes,
  checkLocalFileExistence,
  createFanMissionDestinationFolder
} = require('../_shared/helpers')

const downloadFanMissions = async (fanMissionCatalog) => {
  console.log('Proceeding to download the Fan Missions...')

  const downloadConfig = {
    path: baseUrl + '/download.cgi',
    params: (fanMissionName) => ({ m: fanMissionName, noredir: 1 })
  }

  let totalDownloadedMissions = 0

  for await (const [gameName] of Object.entries(fanMissionCatalog)) {
    for await (const fanMissionName of fanMissionCatalog[gameName]) {
      const filePath = await checkLocalFileExistence(gameName, fanMissionName)

      if (!filePath) {
        const missionResponse = await fetch(
          withQuery(downloadConfig.path, downloadConfig.params(fanMissionName))
        )
        const missionBody = await missionResponse.text()
        const $ = cheerio.load(missionBody)

        for await (const missionFile of $('a[href*="/dl/"]')) {
          console.log(
            `Downloading Fan Mission "${fanMissionName}" (${gameName})...`
          )

          const downloadUrl = encodeURI(baseUrl + missionFile.attribs.href)
          const downloadOptions = {
            connections: 3,
            maxRetry: 2,
            existBehavior: 'overwrite'
          }

          const downloadClient = new EasyDl(
            downloadUrl,
            createFanMissionDestinationFolder(gameName, fanMissionName),
            downloadOptions
          )
          await downloadClient
            .on('progress', (progressData) =>
              console.log(
                `Download progress: ${progressData.total.percentage.toFixed(
                  2
                )}% (${convertBytesToMegabytes(
                  progressData.total.bytes,
                  'Mb'
                )} / ${convertBytesToMegabytes(
                  isNaN(parseFloat(progressData.total.speed))
                    ? '0.00'
                    : progressData.total.speed,
                  'Mb/s'
                )})`
              )
            )
            .wait()

          console.log(
            `Fan Mission "${fanMissionName}" (${gameName}) successfully downloaded!`
          )

          totalDownloadedMissions++
        }
      } else {
        console.log(
          `Skipping already downloaded Fan Mission "${fanMissionName}" (${gameName})`
        )
      }
    }
  }

  if (totalDownloadedMissions) {
    console.log(
      `${totalDownloadedMissions} Fan Mission(s) successfully downloaded!`
    )
  } else {
    console.log('No Fan Mission downloaded.')
  }
}

module.exports = downloadFanMissions
