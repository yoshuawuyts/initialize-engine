# initialize-engine
[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![Downloads][downloads-image]][downloads-url]
[![js-standard-style][standard-image]][standard-url]

Code generation engine. Inspired by the work in
[mattdesl/quick-stub](https://github.com/mattdesl/quick-stub).

## Installation
```sh
$ npm install initialize-engine
```

## Usage
```js
const initializeEngine = require('initialize-engine')
const mkdirp = require('mkdirp')
const path = require('path')

initializeEngine({
  pre: [ createDir ],
  files: [
    '.gitignore',
    'LICENSE',
    'README.md',
    'index.js',
    'package.json',
  ],
  devDependencies: [ 'istanbul', 'standard', 'tape' ]
}, { d: '../foobar' })

// create specified path
// (obj, fn) -> null
function createDir (argv, next) {
  const loc = path.resolve(path.join(argv.d, argv.name))
  mkdirp(loc, function (err) {
    if (err) return next(err)
    process.chdir(loc)
    argv.directory = loc
    argv.d = loc
    next()
  })
}
```

## API
### initializeEngine(opts, argv)
Run the engine with the given opts, and an optional settings object to extend.
Opts are run in sequence. The following opts are available:
- __pre__: an array of functions that can execucute arbitrary code. Use it to
  prompt for user input, create repositories, query data and more.
- __files__: files to be written. Dotfiles need to be prepended with a `_`.
  Files are populated with variables using the `{{varName}}` syntax.
- __devDependencies__: npm dev dependencies to be installed.

## License
[MIT](https://tldrlegal.com/license/mit-license)

[npm-image]: https://img.shields.io/npm/v/initialize-engine.svg?style=flat-square
[npm-url]: https://npmjs.org/package/initialize-engine
[travis-image]: https://img.shields.io/travis/yoshuawuyts/initialize-engine/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/yoshuawuyts/initialize-engine
[codecov-image]: https://img.shields.io/codecov/c/github/yoshuawuyts/initialize-engine/master.svg?style=flat-square
[codecov-url]: https://codecov.io/github/yoshuawuyts/initialize-engine
[downloads-image]: http://img.shields.io/npm/dm/initialize-engine.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/initialize-engine
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[standard-url]: https://github.com/feross/standard
