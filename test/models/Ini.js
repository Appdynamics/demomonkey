import Ini from '../../src/models/Ini'
import chai from 'chai'

var assert = chai.assert

describe('Ini', function () {
  describe('#parse', function () {
    it('parses an ini file', function () {
      assert.deepEqual(new Ini('').parse(), [])
      assert.deepEqual(new Ini('a = b').parse(), { a: 'b' })
      assert.deepEqual(new Ini('a = b; inline comment').parse(), { a: 'b' })
      assert.deepEqual(new Ini('a = "; no comment"').parse(), { a: '; no comment' })
      assert.deepEqual(new Ini('a[] = b\ra[] = c').parse(), { a: ['b', 'c'] })
      assert.deepEqual(new Ini('a = b\r[section]\ra=b\r;comment\rx = y').parse(), { a: 'b', section: { a: 'b', x: 'y' } })
      assert.deepEqual(new Ini('a = b\r[section]\r[section.subsection]\ra=b\r;comment\rx = y').parse(), { a: 'b', section: { subsection: { a: 'b', x: 'y' } } })
    })

    it('allows = to be escaped', function () {
      assert.deepEqual(new Ini('a = b = c').parse(), { a: 'b = c' })
      assert.deepEqual(new Ini('a \\= b = c').parse(), { 'a ≠ b': 'c' })
    })
  })
})
