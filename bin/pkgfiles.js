#!/usr/bin/env node

"use strict"

var pkgFiles = require('../')
var path = require('path')
var argv = require('minimist')(process.argv.slice(2))

var dir = argv._[0] || process.cwd()

if (argv.help) {
  usage()
  process.exit(1)
}

function usage() {
  console.error('')
  console.error('Usage: pkgfiles [dir]')
  console.error('')
  console.error('  pkgfiles            # List all files which would be published in current directory.')
  console.error('  pkgfiles ./mypkg    # List all files which would be published in `./mypkg`.')
  console.error('')
}

pkgFiles(dir, function(err, files) {
  files = files || []
  if (err) {
    console.error(err.message)
    console.trace()
    process.exit(1)
  }
  console.error('')
  console.info(files.map(function(file) {
    return path.relative(dir, file)
  }).join('\n'))
  console.error('\nTotal %d files', files.length)
})
