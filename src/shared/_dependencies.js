const fs = require('fs')
const fsp = fs.promises
const path = require('path')
const cheerio = require('cheerio')
const yauzl = require('yauzl')
const EasyDl = require('../packages/easydl')
const withQuery = require('with-query').default
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args))
const util = require('util')

module.exports = {
  fs,
  fsp,
  path,
  cheerio,
  yauzl,
  EasyDl,
  withQuery,
  fetch,
  util
}
