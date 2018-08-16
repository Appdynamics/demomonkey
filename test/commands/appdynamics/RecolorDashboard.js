import RecolorDashboard from '../../../src/commands/appdynamics/RecolorDashboard'

var assert = require('assert')


describe('RecolorDashboard', function () {
  describe('#apply', function () {
    it('changes the colors of a time series graph', function () {
      var node = {

      }

      new RecolorDashboard(1, 'green', 'blue').apply(node, 'data')
      //assert.equal(href.baseVal, 'images/icon_nodetype_php_100x100.png')
    })
  })
})
