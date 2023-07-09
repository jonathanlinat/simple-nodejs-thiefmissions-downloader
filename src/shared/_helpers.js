const { fileExtensions } = require('./_constants')
const { fs, fsp, path, yauzl, util } = require('./_dependencies')

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
