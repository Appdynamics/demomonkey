import Hide from '../../src/commands/Hide'
import UndoElement from '../../src/commands/UndoElement'
import chai from 'chai'

var assert = chai.assert
var expect = chai.expect

var location = {
  href: '/folder',
  hash: '#hash'
}

describe('Hide', function () {
  describe('#apply', function () {
    it('hides a text node', function () {
      var node = {
        value: 'test',
        parentElement: {
          style: {
            display: 'block'
          },
          className: '',
          parentElement: {
            style: {
              display: 'block'
            },
            className: ''
          }
        }
      }
      expect(new Hide('test', 1, '', '', '', location).apply(node, 'value')).to.be.an.instanceof(UndoElement)
      assert.equal(node.parentElement.style.display, 'none')
      expect(new Hide('test', 2, '', '', '', location).apply(node, 'value')).to.be.an.instanceof(UndoElement)
      assert.equal(node.parentElement.parentElement.style.display, 'none')
    })

    it('hides a text node with "contains" match', function () {
      var node = {
        value: 'abctestabc',
        parentElement: {
          style: {
            display: 'block'
          },
          className: '',
          parentElement: {
            style: {
              display: 'block'
            },
            className: ''
          }
        }
      }
      expect(new Hide('*test*', 1, '', '', '', location).apply(node, 'value')).to.be.an.instanceof(UndoElement)
      assert.equal(node.parentElement.style.display, 'none')
      expect(new Hide('*test*', 2, '', '', '', location).apply(node, 'value')).to.be.an.instanceof(UndoElement)
      assert.equal(node.parentElement.parentElement.style.display, 'none')
    })

    it('hides a text node with "not" match', function () {
      var node = {
        value: 'abcnotabc',
        parentElement: {
          style: {
            display: 'block'
          },
          className: '',
          parentElement: {
            style: {
              display: 'block'
            },
            className: ''
          }
        }
      }
      assert.equal(new Hide('!*not*', 1, '', '', '', location).apply(node, 'value'), false)
      assert.equal(node.parentElement.style.display, 'block')
      expect(new Hide('!*test*', 1, '', '', '', location).apply(node, 'value')).to.be.an.instanceof(UndoElement)
      assert.equal(node.parentElement.style.display, 'none')
      expect(new Hide('!*test*', 2, '', '', '', location).apply(node, 'value')).to.be.an.instanceof(UndoElement)
      assert.equal(node.parentElement.parentElement.style.display, 'none')
    })

    it('hides a text node if filter applies', function () {
      var node = {
        value: 'test',
        parentElement: {
          style: {
            display: 'block'
          },
          className: 'one'
        }
      }
      expect(new Hide('test', 1, 'one', '', '', location).apply(node, 'value')).to.be.an.instanceof(UndoElement)
      assert.equal(node.parentElement.style.display, 'none')

      node.parentElement.style.display = 'block'

      assert.equal(new Hide('test', 1, 'two', '', '', location).apply(node, 'value'), false)
      assert.equal(node.parentElement.style.display, 'block')

      node.parentElement.style.display = 'block'

      expect(new Hide('test', 1, '', 'old', '', location).apply(node, 'value')).to.be.an.instanceof(UndoElement)
      assert.equal(node.parentElement.style.display, 'none')

      node.parentElement.style.display = 'block'

      expect(new Hide('test', 1, '', '', 'ash', location).apply(node, 'value')).to.be.an.instanceof(UndoElement)
      assert.equal(node.parentElement.style.display, 'none')

      node.parentElement.style.display = 'block'

      assert.equal(new Hide('test', 1, '', 'new', '', location).apply(node, 'value'), false)
      assert.equal(node.parentElement.style.display, 'block')

      assert.equal(new Hide('test', 1, '', '', 'ush', location).apply(node, 'value'), false)
      assert.equal(node.parentElement.style.display, 'block')
    })
  })
})
