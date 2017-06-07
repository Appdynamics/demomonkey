import Monkey from '../../src/models/Monkey'
import Configuration from '../../src/models/Configuration'

var assert = require('assert')

var intervalId = 0

var tspans = [
  {textContent: 'test this'},
  {textContent: 'tspans'}
]

var node = {
  'data': 'monkey-demo',
  'parentNode': {
    'tagName': 'title',
    'parentNode': {
      'tagName': 'text',
      'querySelectorAll': function (query) {
        if (query === 'tspan') {
          return tspans
        }
      }
    }
  }
}

var scope = {
  setInterval: function (callback, interval) {
    callback()
    return intervalId++
  },
  clearInterval: function (id) {
    intervalId--
  },
  location: {
    href: 'https://monkey-demo.appdynamics.com/controller'
  },
  document: {
    title: 'demomonkeydemo',
    evaluate: function () {
      return {
        snapshotItem: function (i) {
          if (i === 0) {
            return node
          }
          return null
        }
      }
    }
  }
}

describe('Monkey', function () {
  describe('#run', function () {
    it('should return an interval id', function () {
      var monkey = new Monkey([], scope)
      assert.equal(0, monkey.run(new Configuration()))
      assert.equal(1, monkey.run(new Configuration()))
    })
  })

  describe('#apply', function () {
    it('should change the found text nodes', function () {
      var monkey = new Monkey([], scope)
      monkey.apply(new Configuration('monkey = ape'))
      assert.equal(node.data, 'ape-demo')
      assert.equal(scope.document.title, 'demoapedemo')
    })

    it('should change the found text on svg nodes with tspans', function () {
      var monkey = new Monkey([], scope)
      monkey.apply(new Configuration('test this tspans = this is a success'))
      assert.equal(tspans[0].textContent, 'this is')
      assert.equal(tspans[1].textContent, '...')
    })
  })

  describe('#runAll', function () {
    it('should return an array of interval ids', function () {
      intervalId = 0
      var monkey = new Monkey([{
        content: '@include = ',
        name: 'a',
        enabled: true
      }, {
        content: '@include = ',
        name: 'b',
        enabled: true
      }, {
        content: '@include = ',
        name: 'c',
        enabled: false
      }], scope)
      assert.deepEqual([
        0, 1
      ], monkey.runAll(''))

      // Check also for matching excludes and includes
      intervalId = 0
      monkey = new Monkey([{
        content: '@exclude = monkey-demo',
        name: 'a',
        enabled: true
      }, {
        content: '@include = monkey-demo',
        name: 'b',
        enabled: true
      }], scope)
      assert.deepEqual([0], monkey.runAll(''))
    })
  })
  describe('#stop', function () {
    it('should clear all running intervals', function () {
      intervalId = 0
      scope.document.title = 'demomonkeydemo'
      node.data = 'monkey-demo'
      var monkey = new Monkey([{
        content: '@include = ',
        name: 'a',
        enabled: true
      }, {
        content: '@include = ',
        name: 'b',
        enabled: true
      }], scope)
      monkey.start()
      assert.equal(2, intervalId)
      monkey.stop()
      assert.equal(0, intervalId)
    })
    it('should undo all replacements', function () {
      var monkey = new Monkey([{
        content: 'monkey = ape\n@include = ',
        name: 'a',
        enabled: true
      }], scope)

      monkey.start()
      assert.equal(node.data, 'ape-demo')
      assert.equal(scope.document.title, 'demoapedemo')

      monkey.stop()
      assert.equal(node.data, 'monkey-demo')
      assert.equal(scope.document.title, 'demomonkeydemo')
    })
    it('should not undo all replacements with undo disabled', function () {
      var monkey = new Monkey([{
        content: 'monkey = ape\n@include = ',
        name: 'a',
        enabled: true
      }], scope, false)

      monkey.start()
      assert.equal(node.data, 'ape-demo')
      assert.equal(scope.document.title, 'demoapedemo')

      monkey.stop()
      assert.equal(node.data, 'ape-demo')
      assert.equal(scope.document.title, 'demoapedemo')
    })
  })
})
