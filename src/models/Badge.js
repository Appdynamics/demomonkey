class Badge {
  constructor(browserAction, timer = -1) {
    this.timer = timer
    this.browserAction = browserAction
    this.tabs = []
  }

  removeTab(tabId) {
    this.tabs = this.tabs.filter(id => id !== tabId)
  }

  _updateBadgeText(tabId) {
    this.browserAction.getBadgeText({ tabId }, (text) => {
      text = this._updateText(text)
      this.browserAction.setBadgeText({ text: text, tabId })
    })
  }

  _updateText(oldText, newCount) {
    var oldCount = oldText.split('/')[0]
    const count = typeof newCount === 'string' ? newCount : oldCount
    const newText = this.timer === -1 ? count : count + '/' + this.timer
    return newText
  }

  updateDemoCounter(count, tabId) {
    if (!this.tabs.includes(tabId)) {
      this.tabs.push(tabId)
    }

    this.browserAction.getBadgeText({ tabId }, (oldText) => {
      // oldText can be undefined for a new tab, set it to ''
      const text = this._updateText(typeof oldText === 'undefined' ? '' : oldText, count + '')
      const color = count > 0 ? '#952613' : '#5c832f'
      this.browserAction.setBadgeText({ text, tabId })
      this.browserAction.setBadgeBackgroundColor({
        color,
        tabId
      })
    })
  }

  clearTimer(tabId) {
    this.timer = -1
    this.tabs.forEach(tabId => this._updateBadgeText(tabId))
  }

  updateTimer(timer, tabId) {
    this.timer = timer > 99 ? 99 : timer
    this.tabs.forEach(tabId => this._updateBadgeText(tabId))
  }
}

export default Badge
