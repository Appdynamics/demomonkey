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

    it('parses an ini file with nunjuck templates', function () {
      assert.deepEqual(new Ini('{{ "a" | title }} = b').parse({enabled: true}), { A: 'b' })

      assert.deepEqual(new Ini('{{ "a" | title }} = b').parse({enabled: false}), { '{{ "a" | title }}': 'b' })

      assert.deepEqual(new Ini('{{ a }} = b').parse({enabled: true, variables: {a: 'b'}}), { b: 'b' })
    })
  })
})
