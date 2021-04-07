class UrlManager {
  constructor(scope, enabled = false) {
    this.scope = scope
    this.enabled = enabled
  }

  add (url) {
    if (this.enabled) {
      this.scope.chrome.runtime.sendMessage({
        receiver: 'background',
        task: 'addUrl',
        url
      })
    }
  }

  remove (id) {
    if (this.enabled) {
      this.scope.chrome.runtime.sendMessage({
        receiver: 'background',
        task: 'removeUrl',
        id
      })
    }
  }

  clear () {
    if (this.enabled) {
      this.scope.chrome.runtime.sendMessage({
        receiver: 'background',
        task: 'clearUrls'
      })
    }
  }
}

export default UrlManager
