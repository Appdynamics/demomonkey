import match from './helpers/match'

(function (scope, config) {
  let ajaxFilters = []
  window.addEventListener('message', function (event) {
    if (event.source !== window) {
      return
    }
    console.log(event)
    if (event.data.task && event.data.task === 'add-ajax-filter') {
      ajaxFilters.push(event.data.filter)
    }
    if (event.data.task && event.data.task === 'clear-ajax-filter') {
      ajaxFilters = []
    }
  })
  console.log('registered')
  /*
  if (config.hookIntoCanvas) {
    for (const m in CanvasRenderingContext2D.prototype) {
      try {
        if (typeof CanvasRenderingContext2D.prototype[m] === 'function') {
          const orig = CanvasRenderingContext2D.prototype[m]
          CanvasRenderingContext2D.prototype[m] = function () {
            console.log(m, orig, this, arguments)
            console.trace()
            return orig.apply(this, arguments)
          }
        // Todo: Preserve "arity"
        // console.log(m, orig.length, CanvasRenderingContext2D.prototype[m].length)
        }
      } catch {
        console.log(m)
      }
    }
  }
  */
  /*
  const konvaWait = setInterval(() => {
    if (typeof Konva !== 'undefined') {
      clearInterval(konvaWait)
      scope.document.body.insertAdjacentHTML('beforeend', '<div style="display: none;" id="demomonkey-konva-helper"></div>')
      const oldText = Konva.Text.prototype._setTextData
      const helper = document.getElementById('demomonkey-konva-helper')
      let shapeId = 1
      Konva.Text.prototype._setTextData = function () {
        if (!this.demoMonkeyHelper) {
          helper.insertAdjacentHTML('beforeend', `<div data-demo-monkey-shape-id='${shapeId}'></div>`)
          this.demoMonkeyHelper = document.querySelector(`[data-demo-monkey-shape-id='${shapeId}']`)
          shapeId++
        }
        console.log(this.demoMonkeyHelper)
        this.demoMonkeyHelper.innerHTML = this.text()
        return oldText.apply(this, arguments)
      }
      console.log(oldText)
    }
  }, 100)
  */

  if (config.hookIntoAjax) {
    const functions = {
      replaceAjaxResponse: (url, response, context) => {
        const link = scope.document.createElement('a')
        link.href = url
        if (match(url, context.urlPattern) || match(link.href, context.urlPattern)) {
          if (context.search === false) {
            return context.replace
          }

          return response.replace(context.search, context.replace)
        }
        return response
      }
    }
    const intercept = (fs, url, response) => {
      return fs.reduce((r, e) => {
        return functions[e[0]](url, r, e[1])
      }, response)
    }
    const openPrototype = XMLHttpRequest.prototype.open
    XMLHttpRequest.prototype.open = function () {
      const url = arguments[1]
      this.addEventListener('readystatechange', function (event) {
        if (this.readyState === 4) {
          const response = intercept(ajaxFilters, url, event.target.responseText)
          Object.defineProperty(this, 'response', { writable: true })
          Object.defineProperty(this, 'responseText', { writable: true })
          this.response = this.responseText = response
        }
      })
      return openPrototype.apply(this, arguments)
    }
  }
})(window, window.demoMonkeyConfig || { hookIntoAjax: false, hookIntoCanvas: false })
