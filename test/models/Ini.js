import Ini from '../../src/models/Ini'
import chai from 'chai'

var assert = chai.assert

describe('Ini', function () {
  describe('#parse', function () {
    it('parses an ini file', function () {
      assert.deepEqual(new Ini('').parse(), [])
      assert.deepEqual(new Ini('a = b').parse(), { a: 'b' })
      assert.deepEqual(new Ini('a = b\r[section]\ra=b\r;comment\rx = y').parse(), { a: 'b', section: { a: 'b', x: 'y' } })
    })
  })
})
