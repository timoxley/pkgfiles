# pkgfiles

List all files which would be included by npm if this package was
published as-is.

Note some files may not yet exist (e.g. `.npmignore`).

## Installation

```
npm install pkgfiles
```

## Example

```js
var pkgfiles = require('pkgfiles')

pkgfiles('./src', function(err, files, packages) {
  // files: Array of files and dirs that would be included
  // packages: Array of package.jsons that would be included
})
```

### CLI

```
> pkgfiles
/Users/timoxley/Projects/pkgfiles/package.json
/Users/timoxley/Projects/pkgfiles/.npmignore
/Users/timoxley/Projects/pkgfiles/index.js
/Users/timoxley/Projects/pkgfiles/Readme.md
/Users/timoxley/Projects/pkgfiles/bin/pkgfiles.js
/Users/timoxley/Projects/pkgfiles/test/index.js
/Users/timoxley/Projects/pkgfiles/test/pkg/package.json
/Users/timoxley/Projects/pkgfiles/test/pkg/index.js
/Users/timoxley/Projects/pkgfiles/test/pkg/lib/index.js
Total 9 files
>
```

## Description

This is a wrapper around whatever version of `fstream-npm` is installed in
the global `npm`. It has an async callback interface (instead of a
stream), and keeps the original path (instead of nesting paths in
'package').

# License

MIT
