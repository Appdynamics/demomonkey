import Eval from '../../src/commands/Eval'
import UndoElement from '../../src/commands/UndoElement'
import chai from 'chai'

var assert = chai.assert

describe('Eval', function () {
  describe('#apply', function () {
    it('applies the given script on target', function () {
      var target = {
        key: 5
      }
      const cmd = new Eval('text', [], 'target[key] = 10')
      assert(!cmd.apply(target, 'key'))
      assert.equal(target.key, 10)
    })

    it('accepts parameters', function () {
      var target = {
        key: 5
      }
      const cmd = new Eval('text', [12], 'target[key] = parameters[0]')
      assert(!cmd.apply(target, 'key'))
      assert.equal(target.key, 12)
    })

    it('return false, UndoElement or an array of UndoElements', function () {
      assert(!(new Eval('text', [], '').apply()))
      assert.deepEqual(new Eval('text', [], 'return new UndoElement()').apply(), new UndoElement())
      assert(!(new Eval('text', [], 'return {}').apply()))
      assert.deepEqual(new Eval('text', [], 'return []').apply(), [])
      assert.deepEqual(new Eval('text', [], 'return [new UndoElement(), new UndoElement()]').apply(), [new UndoElement(), new UndoElement()])
      assert.deepEqual(new Eval('text', [], 'return [new UndoElement(), false, new UndoElement(), {}]').apply(), [new UndoElement(), new UndoElement()])
    })
  })
})
