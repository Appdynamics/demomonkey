import ReplaceNeighbor from '../../src/commands/ReplaceNeighbor'
import UndoElement from '../../src/commands/UndoElement'
import chai from 'chai'

var assert = chai.assert
var expect = chai.expect

var location = {
  href: '/folder',
  hash: '#hash'
}

describe('ReplaceNeighbor', function () {
  describe('#apply', function () {
    it('replaces text on a neighbor node', function () {
      var innerNode = {nodeType: 3, data: '1'}
      var node = {
        value: 'Order-Processing-Services',
        parentElement: {
          parentElement: {
            parentElement: {
              parentElement: {
                querySelector: function (selector) {
                  if (selector === 'text.adsNodeCountText') {
                    return {
                      childNodes: [
                        innerNode
                      ]
                    }
                  }
                }
              }
            }
          }
        }
      }
      var cmd = new ReplaceNeighbor('Order-Processing-Services', '13', 4, 'text.adsNodeCountText', '', location)

      expect(cmd.apply(node, 'value')).to.be.an.instanceof(UndoElement)

      assert.equal(innerNode.data, '13')
    })
  })
})
