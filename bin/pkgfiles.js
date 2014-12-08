#!/usr/bin/env node

"use strict"

var pkgFiles = require('../')
var path = require('path')
var argv = require('minimist')(process.argv.slice(2))
var columnify = require('columnify')
var bytes = require('pretty-bytes')

var dir = argv._[0] || process.cwd()

if (argv.help) {
  usage()
  process.exit(1)
}

function usage() {
  console.error('')
  console.error('Usage: pkgfiles [--sort=size|name|pkgfiles] [--json] [dir]')
  console.error('')
  console.error('  pkgfiles                 # List all files which would be published in current directory.')
  console.error('  pkgfiles ./mypkg         # List all files which would be published in `./mypkg`.')
  console.error('  pkgfiles --json          # Render JSON output')
  console.error('  pkgfiles --sort=size     # Sort files by size [default]')
  console.error('  pkgfiles --sort=name     # Sort files by name')
  console.error('  pkgfiles --sort=diskSize # Sort files by size on disk')
  console.error('')
}

argv.sort = argv.sort || 'size'
if (argv.sort === 'name') argv.sort = 'file'

pkgFiles.summary(dir, function(err, result) {
  console.error()
  if (err) return error(err)
  result.entries = result.entries.sort(sortBy(argv.sort))
  if (argv.json) {
    return console.info(JSON.stringify(result, null, 2))
  }
  var total = result.entries.length

  var summary = [
    {
      key: 'total',
      title: 'Number of Files',
      value: total
    },
    {
      key: 'publishSize',
      title: 'Publishable Size',
      value: "~" + bytes(result.publishSize)
    },
    {
      key: 'publishDiskSize',
      title: 'Publishable Size on Disk',
      value: "~" + bytes(result.publishDiskSize)
    },
    {
      key: 'extractedSize',
      title: 'Size with Dependencies',
      value: "~" + bytes(result.extractedSize)
    },
    {
      key: 'extractedDiskSize',
      title: 'Size on Disk with Dependencies',
      value: "~" + bytes(result.extractedDiskSize)
    }
  ].reverse()

  var entries = result.entries
  .map(function(entry) {
    entry.file = path.relative(dir, entry.file)
    if (!entry.exists) {
      entry.percent = ''
      entry.percentDisk = ''
      entry.size = 'N/A'
      entry.diskSize = ''
      return entry
    }
    entry.percent = percent(entry.size/result.publishSize)
    entry.percentDisk = percent(entry.diskSize/result.publishDiskSize)
    entry.size = bytes(entry.size)
    entry.diskSize = bytes(entry.diskSize)
    return entry
  })
  .sort(sortBy(argv.sort))

  var columns = ['file', 'size', 'percent',]
  if (argv.disk) {
    columns.push('diskSize', 'percentDisk')
  } else {
    summary = summary.filter(function(item) {
      return !(/Disk/.test(item.key))
    })
  }

  console.info(columnify(result.entries, {columnSplitter: '  ', columns: columns, headingTransform: function(header) {
    if (header === 'percent') return '%'
    if (header === 'diskSize') return 'DISK SIZE'
    if (header === 'percentDisk') return 'DISK SIZE %'
    return header.toUpperCase()
  }}))
  console.info('\nPKGFILES SUMMARY')
  console.info(columnify(summary, {columnSplitter: '  ', columns: ['title', 'value'], showHeaders: false}))
})

function percent(amount) {
  return (Math.round(amount * 100)) + '%'
}

function error(err) {
  if (err) {
    console.error(err.message)
    console.trace()
    process.exit(1)
  }
}


function sortBy(key) {
  return function(a, b) {
    if (typeof a[key] === 'string') {
      return a[key].localeCompare(b[key])
    } else {
      return a[key] - b[key]
    }
  }
}
