import Configuration from '../../src/models/Configuration'
import Repository from '../../src/models/Repository'
import Variable from '../../src/models/Variable'
import CommandBuilder from '../../src/commands/CommandBuilder'
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
var configurationWithWhitelist = new Configuration('@whitelist = style')
var configurationWithVariable = new Configuration('$a = default\rx = $a', null, true, { a: 'v' })
var configurationWithUnsetVariable = new Configuration('$a = default\rv = $a', null, true, {})
var configurationWithSharedPrefixVariable = new Configuration('[Section]\r[Section.SubSection]\r$a = a1\r$ab = a2\rdefault = $ab', null, true, { a: 'v', ab: 'v2' })
var configurationWithImport = new Configuration('[Section]\r+Cities')
var configurationWithCommand = new Configuration('[Section]\r!replace(a) = b\r$x = y\r$z = w\r!replace($x) = $z')

describe('Configuration', function () {
  describe('#getVariables', function () {
    it('should return empty array when an empty ini was provided', function () {
      assert.deepStrictEqual(emptyConfiguration.getVariables(), [])
    })
    it('should return empty object when no variable is defined', function () {
      assert.deepStrictEqual(simpleConfiguration.getVariables(), [])
    })
    it('ini $a = default should return array with one variable set', function () {
      assert.deepStrictEqual(configurationWithVariable.getVariables(), [
        new Variable('a', 'v', '')
      ])
    })
    it('should return the variables from imported configurations', function () {
      var repository = new Repository({ other: configurationWithVariable })
      assert.deepStrictEqual((new Configuration('+other', repository)).getVariables(), [
        new Variable('a', 'default', '', 'other')
      ])
    })
    it('should return variables with reassigned value', function () {
      var repository = new Repository({ other: configurationWithVariable })
      assert.deepStrictEqual((new Configuration('+other\r$a = reassigned', repository)).getVariables(), [
        new Variable('a', 'reassigned', '')
      ])
    })
    it('complex ini should return multiple variables', function () {
      assert.deepStrictEqual(complexConfiguration.getVariables(), [
        new Variable('url2', 'https://demomonkey', 'another url with https://'),
        new Variable('url', 'https://demomonkey', ''),
        new Variable('x', '1', ''),
        new Variable('y', '2', 'Set y')
      ])
    })
    it('configuration with commands should return object 2 variables', function () {
      assert.deepStrictEqual(configurationWithCommand.getVariables(), [
        new Variable('x', 'y', ''),
        new Variable('z', 'w', '')
      ])
    })
  })

  describe('#_getConfiguration', function () {
    it('should apply variables on commands', function () {
      const config = configurationWithCommand._getConfiguration()
      const cb = new CommandBuilder()
      assert.deepStrictEqual(config, [
        cb.build('!replace(a)', 'b'),
        cb.build('!replace(y)', 'w')
      ])
    })
    it('should apply variables on imports', function () {
      /* eslint no-template-curly-in-string: "off" */
      const cb = new CommandBuilder()
      const repository = new Repository({
        other1: new Configuration('$a = default\r$b = default\rx${b} = $a', null, true, { a: 'v' }),
        other2: new Configuration('+other3\r$a = default\r$b = default\ry${b} = $a\r$c = reassigned\r$d = middle', new Repository(
          { other3: new Configuration('$c = default\r$d = bottom\r$e = default\rz${d} = ${c}${e}', null, true, { c: 'u' }) }
        ), true, { a: 'w' })
      })
      assert.deepStrictEqual((new Configuration('+other1\r+other2\r$a = reassigned\r$b = b\r$d = top', repository, true, { e: 'value' }))._getConfiguration(), [
        cb.build('xb', 'reassigned'),
        cb.build('ztop', 'reassignedvalue'),
        cb.build('yb', 'reassigned')
      ])
    })
  })

  describe('#apply', function () {
    it('empty configuration should return untouched node', function () {
      var node = {
        value: 'a'
      }
      emptyConfiguration.apply(node)
      assert.strictEqual(node.value, 'a')
    })

    it("configuration with pattern ['a', 'b'] should replace node.value from a to b", function () {
      var node = {
        value: 'a'
      }
      simpleConfiguration.apply(node)
      assert.strictEqual(node.value, 'b')
    })

    it('configuration with no matching pattern should return untouched node', function () {
      var node = {
        value: 'x'
      }
      simpleConfiguration.apply(node)
      assert.strictEqual(node.value, 'x')
    })

    it('should apply patterns with set variables', function () {
      var node = {
        value: 'x'
      }
      configurationWithVariable.apply(node)
      assert.strictEqual(node.value, 'v')

      configurationWithUnsetVariable.apply(node)
      assert.strictEqual(node.value, 'default')

      configurationWithSharedPrefixVariable.apply(node)
      assert.strictEqual(node.value, 'v2')
    })

    it('should apply patterns from imported configurations', function () {
      var node = {
        value: 'a'
      }

      var configuration = new Configuration('+other', new Repository({ other: simpleConfiguration }))

      configuration.apply(node)
      assert.strictEqual(node.value, 'b')
    })

    it('should apply variables from imported configurations', function () {
      var node = {
        value: 'x'
      }

      var repository = new Repository({ other: configurationWithVariable })
      var configuration = new Configuration('+other', repository, true, { a: 'b' })

      configuration.apply(node)
      assert.strictEqual(node.value, 'b')
    })
  })

  describe('#isEnabledForUrl', function () {
    it('should return false for empty rules', function () {
      assert.strictEqual(simpleConfiguration.isEnabledForUrl('http://www.example.com'), false)
    })
  })

  describe('#isEnabledForUrl', function () {
    it('should return true for matching include and false for mismatch', function () {
      assert.deepStrictEqual(configurationWithInclude.getOptions(), { include: ['/www/'] })
      assert.strictEqual(configurationWithInclude.isEnabledForUrl('http://www.example.com'), true)
      assert.strictEqual(configurationWithInclude.isEnabledForUrl('http://example.com'), false)
    })
  })

  describe('#getImports', function () {
    it('should return empty array when an empty ini was provided', function () {
      assert.deepStrictEqual(emptyConfiguration.getImports(), [])
    })
    it('should return empty array when no import is set', function () {
      assert.deepStrictEqual(simpleConfiguration.getImports(), [])
    })
    it('ini +Cities should return array with one import', function () {
      assert.deepStrictEqual(configurationWithImport.getImports(), ['Cities'])
    })
    it('complex ini should return object with one import', function () {
      assert.deepStrictEqual(complexConfiguration.getImports(), ['A'])
    })
  })

  describe('#getOptions', function () {
    it('should return empty object when an empty ini was provided', function () {
      assert.deepStrictEqual(emptyConfiguration.getOptions(), {})
    })
    it('should return empty object when no option is set', function () {
      assert.deepStrictEqual(simpleConfiguration.getOptions(), {})
    })
    it('ini @a = b should return object with one option set', function () {
      assert.deepStrictEqual(configurationWithOption.getOptions(), { a: ['b'] })
    })
    it('complex ini should return object with include and exclude rules', function () {
      assert.deepStrictEqual(complexConfiguration.getOptions(), {
        exclude: ['c'],
        include: ['a', 'b']
      })
    })
  })

  describe('#isTagBlacklisted', function () {
    it('should return true if tagname is blacklisted', function () {
      var node = {
        nodeType: 3,
        parentNode: {
          nodeType: 1,
          nodeName: 'DIV'
        }
      }
      assert.strictEqual(configurationWithBlacklist.isTagBlacklisted(node), true)
      assert.strictEqual(configurationWithBlacklist.isTagBlacklisted(node.parentNode), true)
    })
    it('should return true if tagname is script', function () {
      var node = {
        nodeType: 3,
        parentNode: {
          nodeType: 1,
          nodeName: 'SCRIPT'
        }
      }
      assert.strictEqual(configurationWithBlacklist.isTagBlacklisted(node), true)
      assert.strictEqual(configurationWithBlacklist.isTagBlacklisted(node.parentNode), true)
    })
    it('should return true if tagname is style', function () {
      var node = {
        nodeType: 3,
        parentNode: {
          nodeType: 1,
          nodeName: 'STYLE'
        }
      }
      assert.strictEqual(configurationWithBlacklist.isTagBlacklisted(node), true)
      assert.strictEqual(configurationWithBlacklist.isTagBlacklisted(node.parentNode), true)
    })
    it('should return false if tagname is style and style is whitelisted', function () {
      var node = {
        nodeType: 3,
        parentNode: {
          nodeType: 1,
          nodeName: 'STYLE'
        }
      }
      assert.strictEqual(configurationWithWhitelist.isTagBlacklisted(node), false)
      assert.strictEqual(configurationWithWhitelist.isTagBlacklisted(node.parentNode), false)
    })
    it('should return false if tagname is not blacklisted', function () {
      var node = {
        nodeType: 3,
        parentNode: {
          nodeType: 1,
          nodeName: 'INPUT'
        }
      }
      assert.strictEqual(configurationWithBlacklist.isTagBlacklisted(node), false)
      assert.strictEqual(configurationWithBlacklist.isTagBlacklisted(node.parentNode), false)
    })
    it('should return false if node type is not TEXT or ELEMENT', function () {
      var node = {
        nodeType: 99,
        parentNode: {
          nodeName: 'DIV'
        }
      }
      assert.strictEqual(configurationWithBlacklist.isTagBlacklisted(node), false)
    })
  })
})
