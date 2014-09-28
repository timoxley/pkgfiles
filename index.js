"use strict"

var path = require('path')
var resolve = require('pkgresolve')

module.exports = function pkgfiles(src, fn) {
  resolve('fstream-npm').fromGlobal('npm', function(err, fstreamPath) {
    if (err) return fn(err)
    var entries = []
    var packages = []
    var nest = path.join(path.dirname(src), 'package')
    if (!fstreamPath) {
      console.error('Warning: Could not find fstream-npm in global npm.')
      console.error('You may not see matching behaviour.')
    }
    fstreamPath = fstreamPath || 'fstream-npm'

    var fstream = require(fstreamPath)
    fstream({ path: src })
    .on('entry', function(entry) {
      entries.push(entry.path)
    })
    .on('package', function(pkg) {
      packages.push(pkg)
    })
    .on('error', function(entry) {
      fn(err)
      fn = function() {}
    })
    .on('end', function() {
      entries = entries.map(function(file) {
        return path.join(src, path.relative(nest, file))
      })
      fn(null, entries, packages)
    })
  })
}
