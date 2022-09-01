/**
 * MIT License
 *
 * Copyright (c) 2022 Jonathan Linat <https://github.com/jonathanlinat>
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

const fs = require('fs')
const path = require('path')
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args))
const withQuery = require('with-query').default
const cheerio = require('cheerio')
const EasyDl = require('easydl')

;(async () => {
  console.log('Script started!')

  const baseUrl = 'https://thiefmissions.com'

  try {
    // Helpers

    const bytesToMegabytes = (value = 0, unit = '') =>
      `${(value / 1024 / 1024).toFixed(2)} ${unit}`

    const localDestinationFolder = (game = '', name = '') => {
      const path = `./files/${game}/${name}/`

      if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true })

      return path
    }

    const generateLocalFilesList = async () => {
      const localFilesTree = {}

      for (const game of fs.readdirSync(localDestinationFolder())) {
        !/\$\$/.test(game) && (localFilesTree[game] = [])

        for (const name of fs.readdirSync(localDestinationFolder(game))) {
          const parsedName = path.parse(name).name

          !/\$\$/.test(name) && localFilesTree[game].push(parsedName)
        }
      }

      return localFilesTree
    }

    const generateOnlineFilesList = async ($ = {}) => {
      const onlineFanMissions = {}

      for (const tableRow of $('tr[bgcolor]')) {
        const game = $(tableRow).find('td:last-child').text()

        if (!onlineFanMissions[game]) onlineFanMissions[game] = []

        const name = $(tableRow)
          .find('a[href*="/m/"]')[0]
          .attribs.href.split('/')
          .pop()

        onlineFanMissions[game].push(name)
      }

      return onlineFanMissions
    }

    // Build the Fan Missions lists

    console.log('Retrieving and building the lists of Fan Missions...')

    const localFanMissions = await generateLocalFilesList()

    const searchCgi = {
      path: baseUrl + '/search.cgi',
      params: { search: '', sort: 'title' }
    }
    const response = await fetch(withQuery(searchCgi.path, searchCgi.params))
    const body = await response.text()
    const $ = cheerio.load(body)

    const onlineFanMissions = await generateOnlineFilesList($)

    console.log('Fan Missions lists successfully built!')

    // Download the Fan Missions

    console.log('Proceeding to download the Fan Missions...')

    const downloadCgi = {
      path: baseUrl + '/download.cgi',
      params: (value) => ({ m: value, noredir: 1 })
    }

    for await (const [game, names] of Object.entries(onlineFanMissions)) { // eslint-disable-line
      for await (const name of onlineFanMissions[game]) {
        if (!localFanMissions[game]?.includes(name)) {
          const response = await fetch(
            withQuery(downloadCgi.path, downloadCgi.params(name))
          )
          const body = await response.text()
          const $ = cheerio.load(body)

          for await (const file of $('a[href*="/dl/"]')) {
            console.log(
              `Starting to download Fan Mission "${name}" (${game})...`
            )

            const encodedDownloadUrl = encodeURI(baseUrl + file.attribs.href)
            const downloadOptions = {
              connections: 3,
              maxRetry: 2,
              existBehavior: 'overwrite'
            }

            const client = new EasyDl(
              encodedDownloadUrl,
              localDestinationFolder(game, name),
              downloadOptions
            )
            await client
              .on('progress', (progress) =>
                console.log(
                  `Download progress: ${progress.total.percentage.toFixed(
                    2
                  )}% (${bytesToMegabytes(
                    progress.total.bytes,
                    'Mb'
                  )} / ${bytesToMegabytes(progress.total.speed, 'Mb/s')})`
                )
              )
              .wait()

            console.log(
              `Fan Mission "${name}" (${game}) successfully downloaded!`
            )
          }
        }
      }
    }

    console.log('Fan Missions successfully downloaded!')
  } catch (error) {
    throw new Error(error)
  }

  console.log('Script finalized!')
})()
