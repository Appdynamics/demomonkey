import Variable from '../../src/models/Variable'
import assert from 'assert'

describe('Variable', function () {
  describe('#bind', function () {
    it('should return a new variable with the given value', function () {
      var v = new Variable('a', 'default', 'description')
      var o = v.bind('new')
      assert.strictEqual(v.value, 'default')
      assert.strictEqual(o.value, 'new')
    })
  })

  describe('#apply', function () {
    it('should replace its $name with its value', function () {
      var v = new Variable('name', 'value', 'description')
      assert.strictEqual('value', v.apply('$name'))
    })

    it('should not touch booleans', function () {
      var v = new Variable('name', 'value', 'description')
      assert.strictEqual(true, v.apply(true))
    })
  })
})
