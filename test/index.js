var test = require('tape')
var join = require('path').join
var pkgfiles = require('../')

var PKG_DIR = join(__dirname, 'pkg')

test('lists files that would be included', function(t) {
  pkgfiles(PKG_DIR, function(err, entries, packages) {
    t.ifError(err)
    var expected = ['index.js', 'lib/index.js', 'package.json'].map(function(file) {
      return join(PKG_DIR, file)
    })
    t.equal(packages.length, 1)
    t.equal(packages[0].name, 'pkg')
    t.deepEqual(entries.map(function(e) {return e.file}).sort(), expected.sort())
    t.ok(entries.every(function(e) {
      return (
        'size' in e &&
        'diskSize' in e &&
        'exists' in e
      )
    }), 'every entry has size, diskSize & exists')
    t.end()
  })
})

