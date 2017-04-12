import Configuration from '../../src/models/Configuration'
import Repository from '../../src/models/Repository'
import assert from 'assert'
import fs from 'fs'

var complexConfiguration

before(function (done) {
  fs.readFile('./examples/test.mnky', 'utf8', function (err, data) {
    if (err) {
      throw err
    }
    complexConfiguration = new Configuration(data)
    done()
  })
})

var emptyConfiguration = new Configuration('')
var simpleConfiguration = new Configuration('a = b')
var configurationWithOption = new Configuration('@a = b')
var configurationWithInclude = new Configuration('@include = /www/')
var configurationWithBlacklist = new Configuration('@blacklist = div')
var configurationWithVariable = new Configuration('$a = default\rx = $a', null, true, { a: 'v' })
var configurationWithUnsetVariable = new Configuration('$a = default\rv = $a', null, true, {})
var configurationWithImport = new Configuration('+Cities')

describe('Configuration', function () {
  describe('#getVariables', function () {
    it('should return empty array when an empty ini was provided', function () {
      assert.deepEqual(emptyConfiguration.getVariables(), [])
    })
    it('should return empty object when no variable is defined', function () {
      assert.deepEqual(simpleConfiguration.getVariables(), [])
    })
    it('ini $a = default should return array with one variable set', function () {
      assert.deepEqual(configurationWithVariable.getVariables(), [{
        name: 'a',
        value: 'v',
        description: ''
      }])
    })
    it('should return the variables from imported configurations', function () {
      var repository = new Repository({ 'other': configurationWithVariable })
      assert.deepEqual((new Configuration('+other', repository)).getVariables(), [{
        name: 'a',
        value: 'v',
        description: ''
      }])
    })
    it('complex ini should return object 2 variables', function () {
      assert.deepEqual(complexConfiguration.getVariables(), [{
        name: 'x',
        value: '1',
        description: ''
      }, {
        name: 'y',
        value: '2',
        description: 'Set y'
      }])
    })
  })

  describe('#apply', function () {
    it('empty configuration should return untouched node', function () {
      var node = {
        value: 'a'
      }
      emptyConfiguration.apply(node)
      assert.equal(node.value, 'a')
    })

    it("configuration with pattern ['a', 'b'] should replace node.value from a to b", function () {
      var node = {
        value: 'a'
      }
      simpleConfiguration.apply(node)
      assert.equal(node.value, 'b')
    })

    it('configuration with no matching pattern should return untouched node', function () {
      var node = {
        value: 'x'
      }
      simpleConfiguration.apply(node)
      assert.equal(node.value, 'x')
    })

    it('should apply patterns with set variables', function () {
      var node = {
        value: 'x'
      }
      configurationWithVariable.apply(node)
      assert.equal(node.value, 'v')

      configurationWithUnsetVariable.apply(node)
      assert.equal(node.value, 'default')
    })

    it('should apply patterns from imported configurations', function () {
      var node = {
        value: 'a'
      }

      var configuration = new Configuration('+other', new Repository({ other: simpleConfiguration }))

      configuration.apply(node)
      assert.equal(node.value, 'b')
    })

    it('should apply variables from imported configurations', function () {
      var node = {
        value: 'x'
      }

      var repository = new Repository({ 'other': configurationWithVariable })
      var configuration = new Configuration('+other', repository, true, { 'a': 'b' })

      configuration.apply(node)
      assert.equal(node.value, 'b')
    })
  })

  describe('#isEnabledForUrl', function () {
    it('should return true for empty rules', function () {
      assert.equal(simpleConfiguration.isEnabledForUrl('http://www.example.com'), true)
    })
  })

  describe('#isEnabledForUrl', function () {
    it('should return true for matching include and false for mismatch', function () {
      assert.deepEqual(configurationWithInclude.getOptions(), { include: ['/www/'] })
      assert.equal(configurationWithInclude.isEnabledForUrl('http://www.example.com'), true)
      assert.equal(configurationWithInclude.isEnabledForUrl('http://example.com'), false)
    })
  })

  describe('#getImports', function () {
    it('should return empty array when an empty ini was provided', function () {
      assert.deepEqual(emptyConfiguration.getImports(), [])
    })
    it('should return empty array when no import is set', function () {
      assert.deepEqual(simpleConfiguration.getImports(), [])
    })
    it('ini +Cities should return array with one import', function () {
      assert.deepEqual(configurationWithImport.getImports(), ['Cities'])
    })
    it('complex ini should return object with one import', function () {
      assert.deepEqual(complexConfiguration.getImports(), ['A'])
    })
  })

  describe('#getOptions', function () {
    it('should return empty object when an empty ini was provided', function () {
      assert.deepEqual(emptyConfiguration.getOptions(), {})
    })
    it('should return empty object when no option is set', function () {
      assert.deepEqual(simpleConfiguration.getOptions(), {})
    })
    it('ini @a = b should return object with one option set', function () {
      assert.deepEqual(configurationWithOption.getOptions(), { a: ['b'] })
    })
    it('complex ini should return object with include and exclude rules', function () {
      assert.deepEqual(complexConfiguration.getOptions(), {
        include: ['a', 'b']
      })
    })
  })

  describe('#isTagBlacklisted', function () {
    it('should return true if tagname is blacklisted', function () {
      var node = {
        parentNode: {
          nodeName: 'DIV'
        }
      }
      assert.equal(configurationWithBlacklist.isTagBlacklisted(node), true)
    })
    it('should return false if tagname is not blacklisted', function () {
      var node = {
        parentNode: {
          nodeName: 'INPUT'
        }
      }
      assert.equal(configurationWithBlacklist.isTagBlacklisted(node), false)
    })
  })
})
