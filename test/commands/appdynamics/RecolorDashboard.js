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
        querySelector(query) {
          return {style: {color: '#ff0000'}}
        },
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
      [['green', 'blue'], ['#008000', '#0000ff'], ['008000', '0000ff'], ['rgb(0,128,0)', 'rgb(0,0,255)'], ['nocolor', 'nocolor']].forEach(pair => {
        var [search, replace] = pair

        attr1 = {'fill': 'green'}
        attr2 = {'stroke': 'green'}
        attr3 = {'backgroundColor': 'green'}

        var result = new RecolorDashboard(search, replace, '1', location).apply(node, 'data')

        if (result !== false) {
          assert.equal(result.length, 3)
          assert.equal(attr1.fill, '#0000FF')
          assert.equal(attr2.stroke, '#0000FF')
          assert.equal(attr3.backgroundColor, '#0000FF')
        } else {
          assert.equal(search, 'nocolor')
        }
      })
    })

    it('does not change the colors of a dashboard if dashboard id does not match', function () {
      attr1 = {'fill': 'green'}
      attr2 = {'stroke': 'green'}
      attr3 = {backgroundColor: 'green'}

      new RecolorDashboard('green', 'blue', '2', location).apply(node, 'data')

      assert.equal(new RecolorDashboard('green', 'blue', '2', location).apply(node, 'data'), false)

      assert.equal(attr1.fill, 'green')
      assert.equal(attr2.stroke, 'green')
      assert.equal(attr3.backgroundColor, 'green')
    })
  })
})
