import RecolorDashboard from '../../../src/commands/appdynamics/RecolorDashboard'

var assert = require('assert')

var location = {
  toString() {
    return '&dashboard=1'
  }
}

var attr1 = {'fill': 'green'}
var attr2 = {'stroke': 'green'}
var attr3 = {backgroundColor: 'green'}

var node = {
  querySelectorAll(query) {
    if (query === 'ad-widget-timeseries-graph svg') {
      return [{
        querySelectorAll(query) {
          if (query.includes('fill')) {
            return [{
              attributes: attr1,
              setAttribute(attr, value) {
                this.attributes[attr] = value
              }
            }]
          }
          return []
        }
      }, {
        querySelectorAll(query) {
          if (query.includes('stroke')) {
            return [{
              attributes: attr2,
              setAttribute(attr, value) {
                this.attributes[attr] = value
              }
            }]
          }
          return []
        }
      }]
    }
    if (query === 'ad-widget-label') {
      return [{
        parentElement: {
          style: attr3
        }
      }]
    }
    return []
  }
}

describe('RecolorDashboard', function () {
  describe('#apply', function () {
    it('changes the colors of a dashboard', function () {
      attr1 = {'fill': 'green'}
      attr2 = {'stroke': 'green'}
      attr3 = {backgroundColor: 'green'}

      var result = new RecolorDashboard('1', 'green', 'blue', location).apply(node, 'data')

      assert.equal(result.length, 3)

      assert.equal(attr1.fill, 'blue')
      assert.equal(attr2.stroke, 'blue')
      assert.equal(attr3.backgroundColor, 'rgb(0, 0, 255)')
    })

    it('does not change the colors of a dashboard if dashboard id does not match', function () {
      attr1 = {'fill': 'green'}
      attr2 = {'stroke': 'green'}
      attr3 = {backgroundColor: 'green'}

      new RecolorDashboard('2', 'green', 'blue', location).apply(node, 'data')

      assert.equal(new RecolorDashboard('2', 'green', 'blue', location).apply(node, 'data'), false)

      assert.equal(attr1.fill, 'green')
      assert.equal(attr2.stroke, 'green')
      assert.equal(attr3.backgroundColor, 'green')
    })
  })
})
