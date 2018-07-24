import SearchAndReplace from '../../src/commands/SearchAndReplace'

var assert = require('assert')

describe('SearchAndReplace', function () {
  describe('#apply', function () {
    it('should leave target unchanged for empty pattern', function () {
      var node = {
        value: 'asdf'
      }

      new SearchAndReplace('', '').apply(node, 'value')

      assert.equal(node.value, 'asdf')
    })

    it('should replace a with b for pattern a->b', function () {
      var node = {
        value: 'asdf'
      }

      new SearchAndReplace('a', 'b').apply(node, 'value')

      assert.equal(node.value, 'bsdf')
    })

    it('should handle regular expression strings as pure strings', function () {
      var node = {
        value: 'asdf'
      }

      new SearchAndReplace('/[0-9]/', 'b').apply(node, 'value')

      assert.equal(node.value, 'asdf')
    })

    it('should replace all a and A with b for pattern /a/i->b', function () {
      var node = {
        value: 'aAaAsdf'
      }

      new SearchAndReplace(/a/ig, 'b').apply(node, 'value')

      assert.equal(node.value, 'bbbbsdf')
    })

    it('should replace all digits with b for pattern !/[0-9]/->b', function () {
      var node = {
        value: '1234sdf'
      }

      new SearchAndReplace(/[0-9]/ig, 'b').apply(node, 'value')

      assert.equal(node.value, 'bbbbsdf')
    })

    it('should only replace a with b if location is matched', function () {
      var node = {
        value: 'asdf'
      }

      var location = {
        toString: function () {
          return 'asdf'
        }
      }

      new SearchAndReplace('a', 'b', 'xyz', '', location).apply(node, 'value')

      assert.equal(node.value, 'asdf')

      new SearchAndReplace('a', 'b', 'asdf', '', location).apply(node, 'value')

      assert.equal(node.value, 'bsdf')
    })
  })
})
