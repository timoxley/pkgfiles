"use strict"

var fs = require('fs')
var path = require('path')
var resolve = require('pkgresolve')
var du = require('du')

module.exports = pkgFiles

function pkgFiles(src, fn) {
  resolve('fstream-npm').fromGlobal('npm', function(err, fstreamPath) {
    if (err) return fn(err)
    var files = []
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
      files.push(entry.path)
    })
    .on('package', function(pkg) {
      packages.push(pkg)
    })
    .on('error', function(entry) {
      fn(err)
      fn = function() {}
    })
    .on('end', function() {

      files = files.map(function(file) {
        return path.join(src, path.relative(nest, file))
      })

      var pending = files.length
      files.forEach(function(file) {
        fs.lstat(file, function(err, stat) {
          if (err) {
            if (err.code === 'ENOENT') return done(null, {
              file: file,
              size: 0,
              diskSize: 0,
              exists: false
            })
            return done(err)
          }

          if (stat.isDirectory()) return done(null, {
            file: file,
            size: 0,
            diskSize: 0,
            exists: true
          })

          return done(null, {
            file: file,
            size: stat.size,
            diskSize: 512 * stat.blocks,
            exists: true
          })
        })
      })
      var results = []
      function done(err, entry) {
        if (err) return fn(err)
        results = results.concat(entry)
        if (!--pending) fn(null, results, packages)
      }
    })
  })
}

pkgFiles.summary = function summary(dir, done) {
  var fn = function once(err, result) {
    done(err, result)
    fn = function() {}
  }

  var result = {
    packages: [],
    entries: [],
    extractedSize: 0,
    extractedDiskSize: 0,
    publishSize: 0,
    publishDiskSize: 0
  }

  var pending = 3

  pkgFiles(dir, function(err, entries, packages) {
    if (err) return fn(err)
    result.packages = packages
    result.publishSize = entries.reduce(function(t, entry) {
      return t + (entry.size || 0)
    }, 0)
    result.publishDiskSize = entries.reduce(function(t, entry) {
      return t + (entry.diskSize || 0)
    }, 0)
    result.entries = entries || []
    if (!--pending) return fn(null, result)
  })

  du(dir, {disk: true}, function(err, extractedDiskSize) {
    if (err) return fn(err)
    result.extractedDiskSize = extractedDiskSize || 0
    if (!--pending) return fn(null, result)
  })

  du(dir, function(err, extractedSize) {
    if (err) return fn(err)
    result.extractedSize = extractedSize || 0
    if (!--pending) return fn(null, result)
  })
}
