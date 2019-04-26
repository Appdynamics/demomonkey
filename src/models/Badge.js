class Badge {
  constructor(browserAction, timer = -1) {
    this.timer = timer
    this.browserAction = browserAction
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
    this.browserAction.getBadgeText({ tabId }, (text) => {
      text = this._updateText(text, count + '', undefined)
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
    this._updateBadgeText(tabId)
  }

  updateTimer(timer, tabId) {
    this.timer = timer
    this._updateBadgeText(tabId)
  }
}

export default Badge
