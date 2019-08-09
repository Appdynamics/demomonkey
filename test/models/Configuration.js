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
var configurationWithWhitelist = new Configuration('@whitelist = style')
var configurationWithVariable = new Configuration('$a = default\rx = $a', null, true, { a: 'v' })
var configurationWithUnsetVariable = new Configuration('$a = default\rv = $a', null, true, {})
var configurationWithSharedPrefixVariable = new Configuration('[Section]\r[Section.SubSection]\r$a = a1\r$ab = a2\rdefault = $ab', null, true, { a: 'v', ab: 'v2' })
var configurationWithImport = new Configuration('[Section]\r+Cities')
var configurationWithCommand = new Configuration('[Section]\r!replace(a) = b\r$x = y\r$z = w\r!replace($x) = $z')

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
        description: '',
        owner: '',
        id: 'a'
      }])
    })
    it('should return the variables from imported configurations', function () {
      var repository = new Repository({ 'other': configurationWithVariable })
      assert.deepEqual((new Configuration('+other', repository)).getVariables(), [{
        name: 'a',
        value: 'default',
        description: '',
        owner: 'other',
        id: 'other::a'
      }])
    })
    it('should return variables with reassigned value', function () {
      var repository = new Repository({ 'other': configurationWithVariable })
      assert.deepEqual((new Configuration('+other\r$a = reassigned', repository)).getVariables(), [{
        name: 'a',
        value: 'reassigned',
        description: '',
        owner: '',
        id: 'a'
      }])
    })
    it('complex ini should return multiple variables', function () {
      assert.deepEqual(complexConfiguration.getVariables(), [{
        name: 'url2',
        value: 'https://demomonkey',
        description: 'another url with https://',
        owner: '',
        id: 'url2'
      },
      {
        name: 'url',
        value: 'https://demomonkey',
        description: '',
        owner: '',
        id: 'url'
      },
      {
        name: 'x',
        value: '1',
        description: '',
        owner: '',
        id: 'x'
      }, {
        name: 'y',
        value: '2',
        description: 'Set y',
        owner: '',
        id: 'y'
      }])
    })
    it('configuration with commands should return object 2 variables', function () {
      assert.deepEqual(configurationWithCommand.getVariables(), [{
        name: 'x',
        value: 'y',
        description: '',
        owner: '',
        id: 'x'
      }, {
        name: 'z',
        value: 'w',
        description: '',
        owner: '',
        id: 'z'
      }])
    })
  })

  describe('#_getConfiguration', function () {
    it('should apply variables on commands', function () {
      const config = configurationWithCommand._getConfiguration()
      assert.deepEqual(config, [{search: 'a', replace: 'b', locationFilter: '', cssFilter: '', property: '', location: ''}, {search: 'y', 'replace': 'w', location: '', cssFilter: '', property: '', locationFilter: ''}])
    })
    it('should apply variables on imports', function () {
      /* eslint no-template-curly-in-string: "off" */
      const repository = new Repository({
        'other1': new Configuration('$a = default\r$b = default\rx${b} = $a', null, true, { a: 'v' }),
        'other2': new Configuration('+other3\r$a = default\r$b = default\ry${b} = $a\r$c = reassigned\r$d = middle', new Repository(
          {'other3': new Configuration('$c = default\r$d = bottom\r$e = default\rz${d} = ${c}${e}', null, true, { c: 'u' })}
        ), true, { a: 'w' })
      })
      assert.deepEqual((new Configuration('+other1\r+other2\r$a = reassigned\r$b = b\r$d = top', repository, true, { e: 'value' }))._getConfiguration(), [
        {
          cssFilter: '',
          location: {},
          locationFilter: '',
          property: '',
          search: 'xb',
          replace: 'reassigned'
        },
        {
          cssFilter: '',
          location: {},
          locationFilter: '',
          property: '',
          search: 'ztop',
          replace: 'reassignedvalue'
        },
        {
          cssFilter: '',
          location: {},
          locationFilter: '',
          property: '',
          search: 'yb',
          replace: 'reassigned'
        }
      ])
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

      configurationWithSharedPrefixVariable.apply(node)
      assert.equal(node.value, 'v2')
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
    it('should return false for empty rules', function () {
      assert.equal(simpleConfiguration.isEnabledForUrl('http://www.example.com'), false)
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
      assert.equal(configurationWithBlacklist.isTagBlacklisted(node), true)
      assert.equal(configurationWithBlacklist.isTagBlacklisted(node.parentNode), true)
    })
    it('should return true if tagname is script', function () {
      var node = {
        nodeType: 3,
        parentNode: {
          nodeType: 1,
          nodeName: 'SCRIPT'
        }
      }
      assert.equal(configurationWithBlacklist.isTagBlacklisted(node), true)
      assert.equal(configurationWithBlacklist.isTagBlacklisted(node.parentNode), true)
    })
    it('should return true if tagname is style', function () {
      var node = {
        nodeType: 3,
        parentNode: {
          nodeType: 1,
          nodeName: 'STYLE'
        }
      }
      assert.equal(configurationWithBlacklist.isTagBlacklisted(node), true)
      assert.equal(configurationWithBlacklist.isTagBlacklisted(node.parentNode), true)
    })
    it('should return false if tagname is style and style is whitelisted', function () {
      var node = {
        nodeType: 3,
        parentNode: {
          nodeType: 1,
          nodeName: 'STYLE'
        }
      }
      assert.equal(configurationWithWhitelist.isTagBlacklisted(node), false)
      assert.equal(configurationWithWhitelist.isTagBlacklisted(node.parentNode), false)
    })
    it('should return false if tagname is not blacklisted', function () {
      var node = {
        nodeType: 3,
        parentNode: {
          nodeType: 1,
          nodeName: 'INPUT'
        }
      }
      assert.equal(configurationWithBlacklist.isTagBlacklisted(node), false)
      assert.equal(configurationWithBlacklist.isTagBlacklisted(node.parentNode), false)
    })
    it('should return false if node type is not TEXT or ELEMENT', function () {
      var node = {
        nodeType: 99,
        parentNode: {
          nodeName: 'DIV'
        }
      }
      assert.equal(configurationWithBlacklist.isTagBlacklisted(node), false)
    })
  })
})
