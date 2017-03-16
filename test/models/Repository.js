import Repository from '../../src/models/Repository'
import Configuration from '../../src/models/Configuration'
import assert from 'assert'

describe('Repository', function () {
  describe('#findByName', function () {
    it('should return a configuration identified by a given name', function () {
      var repo = new Repository({
        'c0': new Configuration('a = b'),
        'c1': new Configuration('x = y')
      })
      var cfg = repo.findByName('c0')
      var node = { 'value': 'a' }
      cfg.apply(node)
      assert.deepEqual({ 'value': 'b' }, node)
    })

    it('should return an empty configuration for an unused name', function () {
      var repo = new Repository({
        'c0': new Configuration('a = b'),
        'c1': new Configuration('x = y')
      })
      var cfg = repo.findByName('c2')
      var node = { 'value': 'a' }
      cfg.apply(node)
      assert.deepEqual({ 'value': 'a' }, node)
    })
  })
})
