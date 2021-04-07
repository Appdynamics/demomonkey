import match from '../helpers/match.js'

class AjaxManager {
  constructor(scope, enabled = false) {
    this.scope = scope
    this.functions = []
    this.enabled = enabled
  }

  add (f, c) {
    this.functions.push('[' + f.toString() + ',' + JSON.stringify(c) + ']')
  }

  addManagerScript() {
    const oldScript = this.scope.document.getElementById('demo-monkey-ajax-manager')
    // The ajax manager is only injected once, so we do not
    // overwrite the open() method everytime DemoMonkey is reloaded.
    if (oldScript) {
      return
    }
    const intercept = (fs, url, response, match) => {
      return fs.reduce((r, e) => {
        return e[0](url, r, e[1], match)
      }, response)
    }
    const ajaxManagerScript = `
    const openPrototype = XMLHttpRequest.prototype.open
    ${match.toString()}
    ${intercept.toString()}
    XMLHttpRequest.prototype.open = function () {
      const url = arguments[1]
      this.addEventListener('readystatechange', function (event) {
        if (this.readyState === 4) {
          var response = intercept(window.demoMonkeyAjaxFilters, url, event.target.responseText, match)
          Object.defineProperty(this, 'response', {writable: true})
          Object.defineProperty(this, 'responseText', {writable: true})
          this.response = this.responseText = response
        }
      })
      return openPrototype.apply(this, arguments)
    };`

    const scriptTag = this.scope.document.createElement('script')
    scriptTag.setAttribute('id', 'demo-monkey-ajax-manager')
    scriptTag.innerHTML = ajaxManagerScript
    this.scope.document.head.append(scriptTag)
  }

  addFiltersScript() {
    const demoMonkeyAjaxFiltersScript = `window.demoMonkeyAjaxFilters = [${this.functions}]`
    const scriptTag = this.scope.document.createElement('script')
    scriptTag.setAttribute('id', 'demo-monkey-ajax-filters')
    scriptTag.innerHTML = demoMonkeyAjaxFiltersScript
    this.scope.document.head.append(scriptTag)
  }

  removeFilters() {
    const oldScript = this.scope.document.getElementById('demo-monkey-ajax-filters')
    if (oldScript) {
      oldScript.remove()
    }
    const scriptTag = this.scope.document.createElement('script')
    scriptTag.setAttribute('id', 'demo-monkey-ajax-filters-cleanup')
    // The cleanup must also happen on the website, so we clear the object and remove the cleanup script tag after execution
    scriptTag.innerHTML = 'window.demoMonkeyAjaxFilters = [] ; this.document.getElementById("demo-monkey-ajax-filters-cleanup").remove()'
    this.scope.document.head.append(scriptTag)
  }

  run () {
    if (!this.enabled) {
      return
    }
    this.addManagerScript()
    this.addFiltersScript()
  }

  clear() {
    if (!this.enabled) {
      return
    }
    this.functions = []
    this.removeFilters()
  }
}

export default AjaxManager
