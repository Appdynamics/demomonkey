class AjaxManager {
  constructor(scope, enabled = false) {
    this.scope = scope
    this.enabled = enabled
  }

  add (f, c) {
    if (!this.enabled) {
      return
    }
    console.log('add')
    this.scope.postMessage({
      task: 'add-ajax-filter',
      filter: [f, c]
    })
  }

  clear() {
    if (!this.enabled) {
      return
    }
    console.log('clear')
    this.scope.postMessage({
      task: 'clear-ajax-filters'
    })
  }
}

export default AjaxManager
