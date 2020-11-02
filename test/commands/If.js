import If from '../../src/commands/If'
import SearchAndReplace from '../../src/commands/SearchAndReplace'

var assert = require('assert')

const location = {
  toString: function () {
    return 'asdf'
  }
}
const locationAlt = {
  toString: function () {
    return 'xyz'
  }
}

describe('If', function () {
  describe('#apply', function () {
    it('should just work as noop if no condition is set', function () {
      const node = {
        value: 'asdf'
      }

      new If('', '', new SearchAndReplace('a', 'b'), location).apply(node, 'value')

      assert.equal(node.value, 'bsdf')
    })

    it('should only work if location matches', function () {
      const node = {
        value: 'asdf'
      }

      new If('asdf', '', new SearchAndReplace('a', 'b'), locationAlt).apply(node, 'value')

      assert.equal(node.value, 'asdf')
      new If('asdf', '', new SearchAndReplace('a', 'b'), location).apply(node, 'value')

      assert.equal(node.value, 'bsdf')
    })

    it('should only work if css selector matches', function () {
      const node = {
        nodeType: 4,
        value: 'asdf',
        matches(x) {
          return x === '.b'
        }
      }

      new If('asdf', '.a', new SearchAndReplace('a', 'b'), location).apply(node, 'value')
      assert.equal(node.value, 'asdf')

      new If('asdf', '.b', new SearchAndReplace('a', 'b'), location).apply(node, 'value')
      assert.equal(node.value, 'bsdf')
    })

    it('should only work if location AND css selector matches', function () {
      const node = {
        nodeType: 4,
        value: 'asdf',
        matches(x) {
          return x === '.b'
        }
      }

      new If('asdf', '.a', new SearchAndReplace('a', 'b'), locationAlt).apply(node, 'value')
      assert.equal(node.value, 'asdf')

      new If('asdf', '.a', new SearchAndReplace('a', 'b'), location).apply(node, 'value')
      assert.equal(node.value, 'asdf')

      new If('asdf', '.b', new SearchAndReplace('a', 'b'), locationAlt).apply(node, 'value')
      assert.equal(node.value, 'asdf')

      new If('asdf', '.b', new SearchAndReplace('a', 'b'), location).apply(node, 'value')
      assert.equal(node.value, 'bsdf')
    })
  })
})
