import ReplaceFlowmapConnection from '../../../src/commands/appdynamics/ReplaceFlowmapConnection'

var assert = require('assert')

var element = {
  'className': {
    'baseVal': 'adsNormalNodeColor'
  }
}

global.document = {
  getElementById: function (id) {
    return {
      parentElement: {
        childNodes: [
          element
        ]
      }
    }
  }
}

var node = {
  data: 'Inventory-Service',
  parentElement: {
    parentElement: {
      parentElement: {
        className: {
          baseVal: 'topLevelGraphics'
        },
        querySelectorAll: function (string) {
          if (string === 'g.adsFlowMapNode') {
            return [
              {
                id: 'BACKEND116_b481',
                querySelector: function (string) {
                  return { 'innerHTML': '2 JDBC backends' }
                }
              },
              {
                id: 'APPLICATION_COMPONENT115',
                querySelector: function (string) {
                  return { 'innerHTML': 'Inventory-Service' }
                }
              },
              {
                id: 'APPLICATION_COMPONENT114',
                querySelector: function (string) {
                  return { 'innerHTML': 'ECommerce-Service' }
                }
              }
            ]
          }
        }
      }
    }
  }
}

describe('ReplaceFlowmapConnection', function () {
  describe('#apply', function () {
    it('ignores unknown replacements', function () {
      new ReplaceFlowmapConnection('Inventory-Service', 'ECommerce-Service', 'Green').apply(node, 'data')
      assert.equal(element.className.baseVal, 'adsNormalNodeColor')
    })
    it('replaces the icon of a tier on the flowmap', function () {
      new ReplaceFlowmapConnection('Inventory-Service', 'ECommerce-Service', 'Critical').apply(node, 'data')
      assert.equal(element.className.baseVal, 'adsCriticalNodeColor')
    })
    it('replaces the icon of a tier on the flowmap (case insensitive)', function () {
      new ReplaceFlowmapConnection('Inventory-Service', 'ECommerce-Service', 'warning').apply(node, 'data')
      assert.equal(element.className.baseVal, 'adsWarningNodeColor')
    })
  })
})
