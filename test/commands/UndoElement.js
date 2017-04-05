import UndoElement from '../../src/commands/UndoElement'
import chai from 'chai'

var assert = chai.assert

describe('UndoElement', function () {
  describe('#apply', function () {
    it('reverts a replacement on a node', function () {
      var node = {
        value: 'replacement'
      }
      var element = new UndoElement(node, 'value', 'original', 'replacement')
      assert.equal(node.value, 'replacement')
      assert.equal(element.apply(), true)
      assert.equal(node.value, 'original')
    })

    it('reverts a replacement on a node only if the replacement is still valide', function () {
      var node = {
        value: 'some other text'
      }
      var element = new UndoElement(node, 'value', 'original', 'replacement')
      assert.equal(node.value, 'some other text')
      assert.equal(element.apply(), false)
      assert.equal(node.value, 'some other text')
    })
  })
})
