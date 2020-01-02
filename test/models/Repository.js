import Repository from '../../src/models/Repository'
import Configuration from '../../src/models/Configuration'
import assert from 'assert'

describe('Repository', function () {
  describe('#findByName', function () {
    it('should return a configuration identified by a given name', function () {
      const repo = new Repository({
        c0: new Configuration('a = b'),
        c1: new Configuration('x = y')
      })
      const cfg = repo.findByName('c0')
      const node = { value: 'a' }
      cfg.apply(node)
      assert.deepStrictEqual({ value: 'b' }, node)
    })

    it('should return an empty configuration for an unused name', function () {
      const repo = new Repository({
        c0: new Configuration('a = b'),
        c1: new Configuration('x = y')
      })
      const cfg = repo.findByName('c2')
      const node = { value: 'a' }
      cfg.apply(node)
      assert.deepStrictEqual({ value: 'a' }, node)
    })
  })
  describe('#getNames', function () {
    it('should return a list of names of all configurations contained', function () {
      const emptyRepo = new Repository({})
      assert.deepStrictEqual(emptyRepo.getNames(), [])

      const repo = new Repository({
        c0: new Configuration('a = b'),
        c1: new Configuration('x = y')
      })

      assert.deepStrictEqual(repo.getNames(), ['c0', 'c1'])
    })
  })
  describe('#hasByName', function () {
    it('should return false if a configuration is not contained', function () {
      const repo = new Repository({
        c0: new Configuration('a = b'),
        c1: new Configuration('x = y')
      })
      assert.deepStrictEqual(repo.hasByName('c2'), false)
    })
    it('should return true if a configuration is not contained', function () {
      const repo = new Repository({
        c0: new Configuration('a = b'),
        c1: new Configuration('x = y')
      })
      assert.deepStrictEqual(repo.hasByName('c1'), true)
    })
  })
  describe('#addConfiguration', function () {
    it('should take new configurations into the repository', function () {
      const repo = new Repository({})
      assert.deepStrictEqual(repo.hasByName('c'), false)
      repo.addConfiguration('c', new Configuration())
      assert.deepStrictEqual(repo.hasByName('c'), true)
    })
  })
})
