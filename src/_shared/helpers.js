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

const { fileExtensions } = require('./constants')
const { fs, fsp, path, yauzl, util } = require('./dependencies')

const convertBytesToMegabytes = (bytes = 0, unit = '') =>
  `${(bytes / 1024 / 1024).toFixed(2)} ${unit}`

const checkLocalFileExistence = async (gameName = '', fanMissionName = '') => {
  const fanMissionDirectoryPath = `./files/${gameName}/${fanMissionName}/`

  if (!fs.existsSync(fanMissionDirectoryPath)) {
    return false
  }

  try {
    const filesInDirectory = await fsp.readdir(fanMissionDirectoryPath)

    for (const fileName of filesInDirectory) {
      const fileExtension = path.extname(fileName)

      if (fileExtensions.includes(fileExtension)) {
        const filePath = path.join(fanMissionDirectoryPath, fileName)

        try {
          const yauzlOpenAsync = util.promisify(yauzl.open)

          await yauzlOpenAsync(filePath, { lazyEntries: true })

          return filePath
        } catch (error) {
          await fsp.unlink(filePath)

          return false
        }
      }
    }

    return false
  } catch (error) {
    return false
  }
}

const createFanMissionDestinationFolder = (
  gameName = '',
  fanMissionName = ''
) => {
  const fanMissionDirectoryPath = `./files/${gameName}/${fanMissionName}/`

  if (!fs.existsSync(fanMissionDirectoryPath))
    fs.mkdirSync(fanMissionDirectoryPath, { recursive: true })

  return fanMissionDirectoryPath
}

const generateOnlineFilesList = async ($ = {}) => {
  const onlineFanMissionList = {}

  for (const tableRow of $('tr[bgcolor]')) {
    const gameName = $(tableRow).find('td:last-child').text()

    if (!onlineFanMissionList[gameName]) onlineFanMissionList[gameName] = []

    const fanMissionName = $(tableRow)
      .find('a[href*="/m/"]')[0]
      .attribs.href.split('/')
      .pop()

    onlineFanMissionList[gameName].push(fanMissionName)
  }

  return onlineFanMissionList
}

module.exports = {
  convertBytesToMegabytes,
  checkLocalFileExistence,
  createFanMissionDestinationFolder,
  generateOnlineFilesList
}
