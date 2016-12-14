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

FILE                   SIZE     %
test/pkg/lib/index.js  0 B      0%
test/pkg/index.js      0 B      0%
.npmignore             N/A
.travis.yml            84 B     1%
test/pkg/package.json  269 B    2%
test/index.js          739 B    6%
package.json           900 B    7%
LICENSE                1.08 kB  9%
index.js               2.99 kB  24%
Readme.md              3.12 kB  25%
bin/pkgfiles.js        3.43 kB  27%

PKGFILES SUMMARY
Size with Dependencies  ~885.15 kB
Publishable Size        ~12.61 kB
Number of Files         11
```

```
> pkgfiles --disk

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
```

```
> pkgfiles --sort=name

FILE                   SIZE     %
.npmignore             N/A
.travis.yml            84 B     1%
LICENSE                1.08 kB  8%
Readme.md              4.24 kB  31%
bin/pkgfiles.js        3.5 kB   25%
index.js               2.99 kB  22%
package.json           900 B    7%
test/index.js          739 B    5%
test/pkg/index.js      0 B      0%
test/pkg/lib/index.js  0 B      0%
test/pkg/package.json  269 B    2%

PKGFILES SUMMARY
Size with Dependencies  ~886.34 kB
Publishable Size        ~13.8 kB
Number of Files         11
```

```
> pkgfiles ./pkgfiles ./minimist

./pkgfiles
PATH                   SIZE      %
test/pkg/index.js      0 B       0%
.npmignore             0 B       0%
test/pkg/lib/index.js  0 B       0%
.travis.yml            84 B      0%
test/pkg/package.json  269 B     1%
test/index.js          690 B     4%
package.json           926 B     5%
LICENSE                1.08 kB   6%
Readme.md              4.35 kB   22%
index.js               5.35 kB   27%
bin/pkgfiles.js        6.78 kB   35%

DIR                    SIZE      %
test/pkg/lib/          0 B       0%
test/pkg/              269 B     1%
test/                  959 B     5%
bin/                   6.78 kB   35%
./                     19.52 kB  100%

PKGFILES SUMMARY
Size on Disk with Dependencies  ~3.96 MB
Size with Dependencies          ~2 MB
Publishable Size                ~19.52 kB
Number of Directories           5
Number of Files                 11

./minimist
PATH                    SIZE      %
example/parse.js        69 B      0%
.travis.yml             116 B     0%
test/whitespace.js      191 B     1%
test/parse_modified.js  238 B     1%
test/stop_early.js      328 B     1%
test/kv_short.js        376 B     1%
test/dotted.js          588 B     2%
test/all_bool.js        756 B     2%
test/default_bool.js    778 B     3%
test/long.js            779 B     3%
package.json            883 B     3%
test/num.js             909 B     3%
test/dash.js            980 B     3%
LICENSE                 1.07 kB   4%
test/short.js           1.59 kB   5%
readme.markdown         2.48 kB   8%
test/unknown.js         2.54 kB   8%
test/bool.js            3.94 kB   13%
test/parse.js           4.61 kB   15%
index.js                7.19 kB   24%

DIR                     SIZE      %
example/                69 B      0%
test/                   18.61 kB  61%
./                      30.41 kB  100%

PKGFILES SUMMARY
Size on Disk with Dependencies  ~323.58 kB
Size with Dependencies          ~190.33 kB
Publishable Size                ~30.41 kB
Number of Directories           3
Number of Files                 20

PKGFILES TOTAL
Size on Disk with Dependencies  ~4.29 MB
Size with Dependencies          ~2.19 MB
Publishable Size                ~49.94 kB
Number of Directories           8
Number of Files                 31
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
* [timoxley/pkgcount](https://github.com/timoxley/pkgcount)
* [timoxley/pkgrep](https://github.com/timoxley/pkgrep)

# License

MIT
