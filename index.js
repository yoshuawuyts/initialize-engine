const exec = require('child_process').exec
const parallel = require('run-parallel')
const series = require('run-series')
const mustache = require('mustache')
const through = require('through2')
const assert = require('assert')
const xtend = require('xtend')
const noop = require('noop2')
const path = require('path')
const fs = require('fs')

module.exports = initializeEngine

// code generation engine
// (obj, obj, fn) -> null
function initializeEngine (opts, argv, cb) {
  argv = argv || {}
  cb = cb || noop
  argv.dirname = __dirname
  assert.equal(typeof opts, 'object')
  assert.equal(typeof argv, 'object')

  const base = { dependencies: [], devDependencies: [] }
  opts = xtend(base, opts)

  const fns = [
    runPre.bind(null, opts.pre, argv),
    createFiles.bind(null, opts.files, argv, opts.templates),
    installDeps.bind(null, opts.devDependencies, '-D ', argv),
    installDeps.bind(null, opts.dependencies, '-S ', argv)
  ]
  series(fns, function (err) {
    if (err) throw err
    cb()
  })
}

// run pre functions in sequence
// (obj, obj, fn) -> null
function runPre (arr, argv, cb) {
  const nw = arr.map(function (el) {
    return el.bind(null, argv)
  })
  series(nw, cb)
}

// create files
// (obj, obj, str, fn) -> null
function createFiles (files, argv, templates, cb) {
  if (!templates) {
    const parent = path.resolve(module.parent.filename)
    templates = path.join(parent, '../templates')
  }

  const dir = argv.directory
  parallel(files.map(mapFn), cb)

  function mapFn (file) {
    const tempDir = path.resolve(templates)
    const inFile = path.join(tempDir, file.replace(/^\./, '_.'))
    const outFile = path.resolve(path.join(dir, file))

    return function (done) {
      fs.createReadStream(inFile)
        .pipe(through(transform))
        .pipe(fs.createWriteStream(outFile))
        .on('error', done)
        .on('finish', function () {
          process.stdout.write('write: ' + outFile + '\n')
          done()
        })

      function transform (chunk, enc, cb) {
        const str = chunk.toString()
        const mt = mustache.render(str, argv)
        cb(null, mt)
      }
    }
  }
}

// install npm dependencies
// (obj, str, obj, fn) -> null
function installDeps (deps, cliOpts, argv, cb) {
  const mods = deps.map(function (dep) {
    return function (done) {
      process.stdout.write('pkg: ' + dep + '\n')
      const infinity = '--cache-min Infinity'
      const args = [ 'npm i', cliOpts, dep, infinity ].join(' ')
      exec(args, function (err) {
        if (err) return cb(err)
      })
    }
  })

  parallel(mods, cb)
}
