"use strict"

var fs = require('fs')
var path = require('path')
var resolve = require('pkgresolve')
var du = require('du')
var map = require('map-limit')

module.exports = pkgFiles

function pkgFiles(dir, fn) {
  resolve('fstream-npm').fromGlobal('npm', function(err, fstreamPath) {
    if (err) return fn(err)
    var files = []
    var packages = []
    var nest = path.join(path.dirname(dir), 'package')
    if (!fstreamPath) {
      console.error('Warning: Could not find fstream-npm in global npm.')
      console.error('You may not see matching behaviour.')
    }
    fstreamPath = fstreamPath || 'fstream-npm'

    var fstream = require(fstreamPath)
    fstream({ path: dir })
    .on('entry', function(entry) {
      files.push(entry.path)
    })
    .on('package', function(pkg) {
      packages.push(pkg)
    })
    .on('error', function(err) {
      fn(err)
      fn = function() {}
    })
    .on('end', function() {

      files = files.map(function(file) {
        return path.join(dir, path.relative(nest, file))
      })

      map(files, Infinity, function(file, next) {
        fs.lstat(file, function(err, stat) {
          var name = path.relative(dir, file)
          if (err) {
            if (err.code === 'ENOENT') return next(null, {
              name: name,
              size: 0,
              diskSize: 0,
              exists: false
            })
            return next(err)
          }
          return next(null, {
            name: name,
            size: stat.size,
            diskSize: 512 * stat.blocks,
            exists: true,
            isDirectory: false
          })
        })
      }, function(err, entries) {
        if (err) return fn(err)
        var dirNames = entries
        .reduce(function(dirNames, entry) {
          return dirNames.concat(getAncestors(entry.name))
        }, [])
        .filter(Boolean)
        .filter(unique)

        var dirEntries = dirNames.map(function(dirName) {
          return {
            name: dirName,
            size: 0,
            diskSize: 0,
            exists: true,
            children: [],
            isDirectory: true
          }
        })

        dirEntries.forEach(function(dirEntry) {
          dirEntry.children = dirEntry.children
          .concat(entries.filter(function(entry) {
            return (
              dirEntry.name !== entry.name &&
              !path.relative(dirEntry.name, path.dirname(entry.name))
            )
          }))
        })

        dirEntries.forEach(function(dirEntry) {
          dirEntry.children = dirEntry.children
          .concat(dirEntries.filter(function(entry) {
            return (
              dirEntry.name !== entry.name &&
              !path.relative(dirEntry.name, path.dirname(entry.name))
            )
          }))
        })

        dirEntries.forEach(function(dirEntry) {
          dirEntry.children = dirEntry.children.filter(unique)
        })
        var rootDir = dirEntries.filter(function(dirEntry) {
          return dirEntry.name === '.'
        }).pop()
        getDirSize(rootDir)
        return fn(null, entries.concat(dirEntries), packages)
      })
    })
  })
}

function getDirSize(dirEntry) {
  return dirEntry.children.reduce(function(dirEntry, entry) {
    if (entry.isDirectory) {
      entry = getDirSize(entry)
    }
    dirEntry.size += entry.size
    dirEntry.diskSize += entry.diskSize
    return dirEntry
  }, dirEntry)
  dirEntry.children = []
  return dirEntry
}

pkgFiles.summary = function summary(dir, done) {
  var fn = function once(err, result) {
    done(err, result)
    fn = function() {}
  }

  var result = {
    packages: [],
    entries: [],
    sizeWithDependencies: 0,
    diskSizeWithDependencies: 0,
    publishSize: 0,
    publishDiskSize: 0
  }

  var pending = 2

  pkgFiles(dir, function(err, entries, packages) {
    if (err) return fn(err)
    result.packages = packages
    var files = entries.filter(function(entry) {
      return !entry.isDirectory
    })
    result.publishSize = files.reduce(function(t, entry) {
      return t + (entry.size || 0)
    }, 0)
    result.publishDiskSize = files.reduce(function(t, entry) {
      return t + (entry.diskSize || 0)
    }, 0)
    result.entries = entries || []
    if (!--pending) return fn(null, result)
  })

  duSizes(dir, function(err, dir) {
    if (err) return fn(err)
    result.diskSizeWithDependencies = dir.diskSize
    result.sizeWithDependencies = dir.size
    if (!--pending) return fn(null, result)
  })
}

function duSizes(dir, fn) {
  var result = {dir: dir}
  var pending = 2
  du(dir, {disk: true}, function(err, diskSize) {
    if (err) return fn(err)
    result.diskSize = diskSize || 0
    if (!--pending) return fn(null, result)
  })

  du(dir, function(err, size) {
    if (err) return fn(err)
    result.size = size || 0
    if (!--pending) return fn(null, result)
  })
}

function getAncestors(dirName) {
  var dirNames = []
  dirName = path.dirname(dirName)
  while (dirName && dirName !== '/' && dirName !== '.') {
    dirNames.push(dirName)
    dirName = path.dirname(dirName)
  }
  if (dirName === '.') dirNames.push(dirName)
  return dirNames
}

function unique(item, index, arr) {
  return index === arr.lastIndexOf(item)
}

function dirContains(parent, child) {
  return parent !== child && path.relative(parent, child).slice(0, 2) !== '..'
}
