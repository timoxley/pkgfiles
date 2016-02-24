#!/usr/bin/env node

"use strict"

var pkgFiles = require('../')
var path = require('path')
var minimist = require('minimist')
var columnify = require('columnify')
var bytes = require('pretty-bytes')
var map = require('map-limit')

var dirHeader = {
  name: 'DIR',
  size: 'SIZE',
  percent: '%',
  diskSize: 'DISK SIZE',
  diskSizePercent: 'DISK SIZE %'
}

var fileHeader = {
  name: 'PATH',
  size: 'SIZE',
  percent: '%',
  diskSize: 'DISK SIZE',
  diskSizePercent: 'DISK SIZE %'
}

var argv = minimist(process.argv.slice(2), {
  alias: {
    'd': 'dirs',
    'f': 'files'
  },
  default: {
    files: false,
    dirs: false
  },
  boolean: ['dirs', 'files']
})

var pkgdirs = argv._.length > 0 ? argv._ : [process.cwd()];

if (argv.version) {
  console.info(require('../package.json').version)
  process.exit()
}

if (argv.help) {
  usage()
  process.exit(1)
}

function usage() {
  console.error('')
  console.error('Usage: pkgfiles [--sort=size|name|pkgfiles] [--disk] [--json] [-f, --only-files | -d, --only-dirs] [dir]')
  console.error('')
  console.error('  pkgfiles                    # List all files which would be published in current directory.')
  console.error('  pkgfiles ./mypkg            # List all files which would be published in `./mypkg`.')
  console.error('  pkgfiles --version          # Show version')
  console.error('  pkgfiles --json             # Render JSON output')
  console.error('  pkgfiles --sort=size        # Sort files by size [default]')
  console.error('  pkgfiles --sort=name        # Sort files by name')
  console.error('  pkgfiles --disk             # Include disk sizes in result')
  console.error('  pkgfiles -f, --files        # Only list files')
  console.error('  pkgfiles -d, --dirs         # Only list directories')
  console.error('')
}

argv.sort = argv.sort || 'size'

if (!argv['files'] && !argv['dirs']) {
  argv.dirs =  true
  argv.files = true
}

var total = {
  files: 0,
  dirs: 0,
  publishSize: 0,
  publishDiskSize: 0,
  sizeWithDependencies: 0,
  diskSizeWithDependencies: 0,
}

map(pkgdirs, Infinity, function(dir, next) { pkgFiles.summary(dir, function(err, result) {
  console.error()
  if (err) return error(err)

  var entries = result.entries
  var files = entries.filter(function(e) {
    return !e.isDirectory
  })
  total.files += files.length;

  var dirs = entries.filter(function(e) {
    return e.isDirectory
  })
  total.dirs += dirs.length;

  total.publishSize += result.publishSize
  total.publishDiskSize += result.publishDiskSize
  total.sizeWithDependencies += result.sizeWithDependencies
  total.diskSizeWithDependencies += result.diskSizeWithDependencies

  if (!argv['dirs']) entries = files
  else if (!argv['files']) entries = dirs
  else entries = files.concat(dirs)

  entries = result.entries = entries.sort(sortBy(argv.sort))

  if (argv.json) {
    return next(null, result);
  }

  var summary = [
    {
      key: 'total',
      title: 'Number of Files',
      value: files.length
    },
    {
      key: 'total',
      title: 'Number of Directories',
      value: dirs.length
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
      entry.percent = 0
      entry.percentDisk = 0
      entry.size = 0
      entry.diskSize = 0
      return entry
    }

    if (entry.isDirectory) entry.name += '/'
    if (entry.name === '/') entry.name = '.'

    return entry
  })
  .sort(sortBy(argv.sort))
  .map(function(entry) {
    entry.percent = percent(entry.size/result.publishSize)
    entry.percentDisk = percent(entry.diskSize/result.publishDiskSize)
    if (typeof entry.size === 'number') entry.size = bytes(entry.size)
    if (typeof entry.diskSize === 'number') entry.diskSize = bytes(entry.diskSize)
    return entry
  })

  var columns = ['name', 'size', 'percent',]
  if (argv.disk) {
    columns.push('diskSize', 'percentDisk')
  } else {
    summary = summary.filter(function(item) {
      return !(/Disk/.test(item.key))
    })
  }

  var fileRows = entries.filter(function(item) {return !item.isDirectory})
  var dirRows = entries.filter(function(item) {return item.isDirectory})

  var rows = []
  if (argv.files) rows = rows.concat(fileHeader, fileRows)
  if (argv.files && argv.dirs) rows = rows.concat({})
  if (argv.dirs) rows = rows.concat(dirHeader, dirRows)

  if (pkgdirs.length > 1) console.info(dir)
  console.info(columnify(rows, {columnSplitter: '  ', columns: columns, showHeaders: false}))
  console.info('\nPKGFILES SUMMARY')
  console.info(columnify(summary, {columnSplitter: '  ', columns: ['title', 'value'], showHeaders: false}))

  next()
}) }, function(err, results) {
  if (argv.json) {
    return console.info(JSON.stringify(results.length === 1 ? results[0] : results, null, 2))
  }

  if (results.length === 1) return

  var summary = [
    {
      key: 'total',
      title: 'Number of Files',
      value: total.files
    },
    {
      key: 'total',
      title: 'Number of Directories',
      value: total.dirs
    },
    {
      key: 'publishSize',
      title: 'Publishable Size',
      value: "~" + bytes(total.publishSize)
    },
    {
      key: 'publishDiskSize',
      title: 'Publishable Size on Disk',
      value: "~" + bytes(total.publishDiskSize)
    },
    {
      key: 'sizeWithDependencies',
      title: 'Size with Dependencies',
      value: "~" + bytes(total.sizeWithDependencies)
    },
    {
      key: 'diskSizeWithDependencies',
      title: 'Size on Disk with Dependencies',
      value: "~" + bytes(total.diskSizeWithDependencies)
    }
  ].reverse()

  if (!argv.disk) {
    summary = summary.filter(function(item) {
      return !(/Disk/.test(item.key))
    })
  }

  console.info('\nPKGFILES TOTAL')
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
    if (typeof b[key] === 'string') {
      return a[key].localeCompare(b[key])
    } else {
      return a[key] - b[key]
    }
  }
}
