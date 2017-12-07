import HideApplication from '../../../src/commands/appdynamics/HideApplication'

var assert = require('assert')

var window = {
  location: {
    hash: '#/location=APPS_ALL_DASHBOARD&timeRange=last_15_minutes.BEFORE_NOW.-1.-1.15'
  }
}

var appNode = {
  style: {
    display: 'block'
  },
  className: 'ads-application-card'
}

var appNode2 = {
  style: {
    display: 'block'
  },
  className: 'x-grid-row'
}

var node = {
  data: ' UserOffers ',
  parentElement: {
    data: 'inner',
    parentElement: {
      parentElement: {
        style: {
          display: 'block'
        },
        className: 'ng-scope',
        parentElement: appNode
      }
    }
  }
}

var node2 = {
  data: ' UserOffers ',
  parentElement: {
    data: 'inner',
    parentElement: {
      parentElement: appNode2
    }
  }
}

describe('ReplaceFlowmapIcon', function () {
  beforeEach(function () {
    appNode.style.display = 'block'
    appNode.className = 'ads-application-card'
    appNode2.style.display = 'block'
  })

  describe('#apply', function () {
    it('hides an application in grid view', function () {
      new HideApplication('UserOffers', '', window.location.hash).apply(node, 'data')
      assert.equal(appNode.style.display, 'none')
    })
  })

  describe('#apply', function () {
    it('hides an application in list view', function () {
      new HideApplication('UserOffers', '', window.location.hash).apply(node2, 'data')
      assert.equal(appNode2.style.display, 'none')
    })
  })

  describe('#apply', function () {
    it('does not break on other nodes', function () {
      new HideApplication('UserOffers', '', window.location.hash).apply(node.parentElement, 'data')
      assert.equal(appNode.style.display, 'block')
    })
  })

  describe('#apply', function () {
    it('hides only applications', function () {
      appNode.className = 'not-an-application-card'
      new HideApplication('UserOffers', '', window.location.hash).apply(node, 'data')
      assert.equal(appNode.style.display, 'block')
    })
  })

  describe('#apply', function () {
    it('hides only on applications overview page', function () {
      new HideApplication('UserOffers', '', 'another-context').apply(node2, 'data')
      assert.equal(appNode2.style.display, 'block')
    })
  })
})
