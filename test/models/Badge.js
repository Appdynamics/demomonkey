import Badge from '../../src/models/Badge'
import chai from 'chai'

var assert = chai.assert

class BrowserAction {
  constructor(tabs) {
    this.tabs = tabs
  }

  getBadgeText({ tabId }, cb) {
    return cb(this.tabs[tabId].text)
  }

  setBadgeText({text, tabId}) {
    this.tabs[tabId].text = text
  }

  setBadgeBackgroundColor({color, tabId}) {
    this.tabs[tabId].color = color
  }
}

describe('Badge', function () {
  describe('#updateDemoCounter', function () {
    it('sets the badge text to 0 and color to green', function () {
      let tabs = [ { text: '', color: '' } ]
      let badge = new Badge(new BrowserAction(tabs))
      badge.updateDemoCounter(0, 0)
      assert.equal(tabs[0].text, '0')
      assert.equal(tabs[0].color, '#5c832f')
    })

    it('sets the badge text to 5 and color to red', function () {
      let tabs = [ { text: '0', color: '#5c832f' } ]
      let badge = new Badge(new BrowserAction(tabs))
      badge.updateDemoCounter(5, 0)
      assert.equal(tabs[0].text, '5')
      assert.equal(tabs[0].color, '#952613')
    })

    it('does not change the timer value', function () {
      let tabs = [ { text: '0/5', color: '#5c832f' } ]
      let badge = new Badge(new BrowserAction(tabs), 5)
      badge.updateDemoCounter(5, 0)
      assert.equal(tabs[0].text, '5/5')
      assert.equal(tabs[0].color, '#952613')
    })
  })
  describe('#updateTimer', function () {
    it('sets the timer text to 0', function () {
      let tabs = [ { text: '', color: '' } ]
      let badge = new Badge(new BrowserAction(tabs))
      badge.updateTimer(0, 0)
      assert.equal(tabs[0].text, '/0')
    })

    it('sets the timer text to 5 and does not change the counter value', function () {
      let tabs = [ { text: '0', color: '' } ]
      let badge = new Badge(new BrowserAction(tabs))
      badge.updateTimer(5, 0)
      assert.equal(tabs[0].text, '0/5')
    })

    it('sets the timer text to 5 and updates all tabs on opening', function () {
      let tabs = [ { text: '0', color: '' }, { text: '4', color: '' }, { text: '8/8', color: '' } ]
      let badge = new Badge(new BrowserAction(tabs))
      badge.updateTimer(5, 0)
      assert.equal(tabs[0].text, '0/5')
      // fake open new tab: DemoCounter will be updated
      badge.updateDemoCounter(4, 1)
      assert.equal(tabs[1].text, '4/5')

      badge.updateDemoCounter(8, 2)
      assert.equal(tabs[2].text, '8/5')
    })
  })
  describe('#clearTimer', function () {
    it('ignores an empty text', function () {
      let tabs = [ { text: '', color: '' } ]
      let badge = new Badge(new BrowserAction(tabs))
      badge.clearTimer(0)
      assert.equal(tabs[0].text, '')
    })

    it('ignores an empty timer value', function () {
      let tabs = [ { text: '13', color: '' } ]
      let badge = new Badge(new BrowserAction(tabs))
      badge.clearTimer(0)
      assert.equal(tabs[0].text, '13')
    })

    it('clears a timer value', function () {
      let tabs = [ { text: '/85', color: '' } ]
      let badge = new Badge(new BrowserAction(tabs), 85)
      badge.clearTimer(0)
      assert.equal(tabs[0].text, '')
    })

    it('clears a timer value and does not change the counter', function () {
      let tabs = [ { text: '2/85', color: '' } ]
      let badge = new Badge(new BrowserAction(tabs), 85)
      badge.clearTimer(0)
      assert.equal(tabs[0].text, '2')
    })

    it('clears the timer and updates all tabs on opening', function () {
      let tabs = [ { text: '0', color: '' }, { text: '4/13', color: '' }, { text: '8/8', color: '' } ]
      let badge = new Badge(new BrowserAction(tabs))
      badge.clearTimer(0)
      assert.equal(tabs[0].text, '0')
      // fake open new tab: DemoCounter will be updated
      badge.updateDemoCounter(4, 1)
      assert.equal(tabs[1].text, '4')

      badge.updateDemoCounter(8, 2)
      assert.equal(tabs[2].text, '8')
    })
  })
})
