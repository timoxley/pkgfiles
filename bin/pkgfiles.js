#!/usr/bin/env node

"use strict"

var pkgFiles = require('../')
var path = require('path')
var minimist = require('minimist')
var columnify = require('columnify')
var bytes = require('pretty-bytes')

var argv = minimist(process.argv.slice(2), {
  alias: {
    'd': 'dirs',
    'D': 'only-dirs',
    'f': 'files'
  },
  default: {
    files: true,
    dirs: true
  },
  boolean: ['dirs', 'files']
})
var dir = argv._[0] || process.cwd()

if (argv.help) {
  usage()
  process.exit(1)
}

function usage() {
  console.error('')
  console.error('Usage: pkgfiles [--sort=size|name|pkgfiles] [--disk] [--json] [dir]')
  console.error('')
  console.error('  pkgfiles                # List all files which would be published in current directory.')
  console.error('  pkgfiles ./mypkg        # List all files which would be published in `./mypkg`.')
  console.error('  pkgfiles --json         # Render JSON output')
  console.error('  pkgfiles --sort=size    # Sort files by size [default]')
  console.error('  pkgfiles --sort=name    # Sort files by name')
  console.error('  pkgfiles --disk         # Include disk sizes in result')
  console.error('')
}

argv.sort = argv.sort || 'size'

if (argv['only-dirs']) {
  argv.dirs = true
  argv.files = false
}

pkgFiles.summary(dir, function(err, result) {
  console.error()
  if (err) return error(err)

  var entries = result.entries
  var files = entries.filter(function(e) {
    return !e.isDirectory
  })
  var dirs = entries.filter(function(e) {
    return e.isDirectory
  })

  if (!argv['dirs']) entries = files
  if (!argv['files']) entries = dirs

  entries = result.entries = entries.sort(sortBy(argv.sort))

  if (argv.json) {
    return console.info(JSON.stringify(result, null, 2))
  }

  var total = files.length
  var summary = [
    {
      key: 'total',
      title: 'Number of Files',
      value: total
    },
    {
      key: 'total',
      title: 'Number of Directories',
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
      key: 'sizeWithDependencies',
      title: 'Size with Dependencies',
      value: "~" + bytes(result.sizeWithDependencies)
    },
    {
      key: 'diskSizeWithDependencies',
      title: 'Size on Disk with Dependencies',
      value: "~" + bytes(result.diskSizeWithDependencies)
    }
  ].reverse()

  entries = entries.map(function(entry) {
    entry.name = path.relative(dir, entry.name)
    if (!entry.exists) {
      entry.percent = ''
      entry.percentDisk = ''
      entry.size = 'N/A'
      entry.diskSize = ''
      return entry
    }

    if (entry.isDirectory) entry.name += '/'
    if (entry.name === '/') entry.name = '.'

    entry.percent = percent(entry.size/result.publishSize)
    entry.percentDisk = percent(entry.diskSize/result.publishDiskSize)
    entry.size = bytes(entry.size)
    entry.diskSize = bytes(entry.diskSize)
    return entry
  })
  .sort(sortBy(argv.sort))

  var columns = ['name', 'size', 'percent',]
  if (argv.disk) {
    columns.push('diskSize', 'percentDisk')
  } else {
    summary = summary.filter(function(item) {
      return !(/Disk/.test(item.key))
    })
  }
  var breaker = {
    name: 'DIR',
    size: 'SIZE',
    percent: '%',
    diskSize: 'DISK SIZE',
    diskSizePercent: 'DISK SIZE %'
  }

  var rows = files
  if (argv.dirs) rows = rows.concat({}, breaker).concat(dirs)

  console.info(columnify(rows, {columnSplitter: '  ', columns: columns, headingTransform: function(header) {
    if (header === 'name') return 'PATH'
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
