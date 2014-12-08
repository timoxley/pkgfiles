# pkgfiles

### List all files which would be published in a package.

[![Build Status](https://travis-ci.org/timoxley/pkgfiles.svg)](https://travis-ci.org/timoxley/pkgfiles)

Useful for double-checking you're not publishing anything
unwanted prior to an `npm publish`.

Note some files may not yet exist (e.g. `.npmignore`).

## Installation

```
npm install pkgfiles
```

### CLI

```
> pkgfiles

FILE                   SIZE     %    DISK SIZE  DISK SIZE %
test/pkg/lib/index.js  0 B      0%   0 B        0%
test/pkg/index.js      0 B      0%   0 B        0%
.npmignore             N/A
.travis.yml            84 B     1%   4.1 kB     13%
test/pkg/package.json  269 B    2%   4.1 kB     13%
test/index.js          519 B    5%   4.1 kB     13%
package.json           900 B    8%   4.1 kB     13%
LICENSE                1.08 kB  9%   4.1 kB     13%
Readme.md              2.37 kB  21%  4.1 kB     13%
index.js               2.99 kB  26%  4.1 kB     13%
bin/pkgfiles.js        3.26 kB  28%  4.1 kB     13%

PKGFILES SUMMARY
Size on Disk with Dependencies  ~2.34 MB
Size with Dependencies          ~865.27 kB
Publishable Size on Disk        ~32.77 kB
Publishable Size                ~11.47 kB
Number of Files                 11
>
```

## API

All sizes are in bytes.

```js
var pkgfiles = require('pkgfiles')


pkgfiles(process.cwd(), function(err, entries, packages) {
  // entries: Array of information about files and dirs that would be included
  // packages: Array of package.jsons that would be included

  entries.forEach(function(entry) {
    console.log('%s – %d bytes', entry.file, entry.size)
  })
  // /Users/timoxley/Projects/pkgfiles/package.json – 900 bytes
  // /Users/timoxley/Projects/pkgfiles/.npmignore – 0 bytes
  // /Users/timoxley/Projects/pkgfiles/LICENSE – 1076 bytes
  // /Users/timoxley/Projects/pkgfiles/index.js – 2933 bytes
  // /Users/timoxley/Projects/pkgfiles/.travis.yml – 84 bytes
  // /Users/timoxley/Projects/pkgfiles/Readme.md – 1684 bytes
  // /Users/timoxley/Projects/pkgfiles/bin/pkgfiles.js – 2927 bytes
  // /Users/timoxley/Projects/pkgfiles/test/index.js – 519 bytes
  // /Users/timoxley/Projects/pkgfiles/test/pkg/package.json – 269 bytes
  // /Users/timoxley/Projects/pkgfiles/test/pkg/index.js – 0 bytes
  // /Users/timoxley/Projects/pkgfiles/test/pkg/lib/index.js – 0 bytes
})
```

```js
var pkgfiles = require('pkgfiles')

pkgfiles.summary(process.cwd(), function(err, results) {
  results.entries // entries from pkgFiles
  results.packages // packages from pkgFiles
  results.extractedSize // size including dependencies
  results.extractedDiskSize // size on disk including dependencies
  results.publishSize // size excluding dependencies
  results.publishDiskSize // size on diesk excluding dependencies
})
```

## Description

This is a wrapper around whatever version of `fstream-npm` is installed in
the **global** `npm`. It has an async callback interface (instead of a
stream), and keeps the original path (instead of nesting paths in
'package').

## See Also

* [thlorenz/irish-pub](https://www.npmjs.org/package/irish-pub)

# License

MIT
