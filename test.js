const test = require('tape')
const initializeEngine = require('./')

test('should assert input types', function (t) {
  t.plan(1)
  t.throws(initializeEngine)
})
