import HideApplication from '../../../src/commands/appdynamics/HideApplication'

var assert = require('assert')

var appNode = {
  style: {
    display: 'block'
  },
  className: 'ads-application-card'
}

var node = {
  data: ' UserOffers ',
  parentElement: {
    data: 'inner',
    parentElement: {
      parentElement: {
        parentElement: appNode
      }
    }
  }
}

describe('ReplaceFlowmapIcon', function () {
  beforeEach(function () {
    appNode.style.display = 'block'
    appNode.className = 'ads-application-card'
  })

  describe('#apply', function () {
    it('hides an application', function () {
      new HideApplication('UserOffers').apply(node, 'data')
      assert.equal(appNode.style.display, 'none')
    })
  })

  describe('#apply', function () {
    it('does not break on other nodes', function () {
      new HideApplication('UserOffers').apply(node.parentElement, 'data')
      assert.equal(appNode.style.display, 'block')
    })
  })

  describe('#apply', function () {
    it('hides only applications', function () {
      appNode.className = 'not-an-application-card'
      new HideApplication('UserOffers').apply(node, 'data')
      assert.equal(appNode.style.display, 'block')
    })
  })
})
