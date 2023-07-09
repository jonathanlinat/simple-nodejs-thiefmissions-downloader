const { baseUrl } = require('./../shared/_constants')
const { cheerio, withQuery, fetch } = require('./../shared/_dependencies')
const { generateOnlineFilesList } = require('./../shared/_helpers')

const retrieveFanMissions = async () => {
  console.log('Retrieving and building the list of Fan Missions...')

  const searchConfig = {
    path: baseUrl + '/search.cgi',
    params: { search: '', sort: 'title' }
  }

  const searchResponse = await fetch(
    withQuery(searchConfig.path, searchConfig.params)
  )
  const searchResponseBody = await searchResponse.text()
  const $ = cheerio.load(searchResponseBody)

  const fanMissionCatalog = await generateOnlineFilesList($)

  console.log('Fan Missions list successfully built!')

  return fanMissionCatalog
}

module.exports = retrieveFanMissions
