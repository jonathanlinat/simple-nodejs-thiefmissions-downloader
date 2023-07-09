/**
 * MIT License
 *
 * Copyright (c) 2022-2023 Jonathan Linat <https://github.com/jonathanlinat>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const { baseUrl } = require('./../shared/_constants')
const {
  cheerio,
  EasyDl,
  withQuery,
  fetch
} = require('./../shared/_dependencies')
const {
  convertBytesToMegabytes,
  checkLocalFileExistence,
  createFanMissionDestinationFolder
} = require('./../shared/_helpers')

const downloadFanMissions = async (fanMissionCatalog) => {
  console.log('Proceeding to download the Fan Missions...')

  const downloadConfig = {
    path: baseUrl + '/download.cgi',
    params: (fanMissionName) => ({ m: fanMissionName, noredir: 1 })
  }

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
        }
      } else {
        console.log(
          `Skipping already downloaded Fan Mission "${fanMissionName}" (${gameName})`
        )
      }
    }
  }

  console.log('Fan Missions successfully downloaded!')
}

module.exports = downloadFanMissions
