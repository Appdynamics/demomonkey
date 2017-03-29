import ReplaceFlowmapIcon from '../../../src/commands/appdynamics/ReplaceFlowmapIcon'

var assert = require('assert')

var href = {
  baseVal: 'images/icon_nodetype_java_100x100.png'
}

var node = {
  data: 'Inventory-Service',
  parentElement: {
    parentElement: {
      querySelector: function (string) {
        if (string === 'image') {
          return {
            href: href
          }
        }
      }
    }
  }
}

describe('ReplaceFlowmapIcon', function () {
  describe('#apply', function () {
    it('replaces the icon of a tier on the flowmap', function () {
      new ReplaceFlowmapIcon('Inventory-Service', 'php').apply(node, 'data')
      assert.equal(href.baseVal, 'images/icon_nodetype_php_100x100.png')
    })

    it('replaces the icon of a tier on the flowmap and is case insensetive', function () {
      new ReplaceFlowmapIcon('Inventory-Service', 'PYTHON').apply(node, 'data')
      assert.equal(href.baseVal, 'images/icon_nodetype_python_100x100.png')
    })

    it('leaves the icon unchanged for an unknown replace pattern', function () {
      new ReplaceFlowmapIcon('Inventory-Service', 'images/icon_nodetype_ruby_100x100.png').apply(node, 'data')
      assert.equal(href.baseVal, 'images/icon_nodetype_ruby_100x100.png')
    })
  })
})
