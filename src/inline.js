import match from './helpers/match'
import * as jsonpatch from 'fast-json-patch'
import JSON5 from 'json5'

(function (scope, config) {
  const ajaxFilters = []
  let konvaHookInterval = -1
  scope.addEventListener('message', function (event) {
    if (event.source !== window) {
      return
    }
    if (event.data.task) {
      switch (event.data.task) {
        case 'add-ajax-filter':
          ajaxFilters.push(event.data.filter)
          break
        case 'clear-ajax-filters':
          ajaxFilters.length = 0
          break
        case 'hook-into-konva':
          console.log(konvaHookInterval, scope.Konva)
          if (konvaHookInterval === -1 && scope.Konva) {
            konvaHookInterval = setInterval(() => {
              const stages = []
              Object.keys(scope.Konva.shapes).forEach(id => {
                const shape = scope.Konva.shapes[id]
                if (typeof shape.text === 'function') {
                  let helper = document.getElementById('demomonkey-konva-helper-' + id)
                  const current = shape.text()
                  if (!helper) {
                    helper = scope.document.createElement('div')
                    helper.setAttribute('id', 'demomonkey-konva-helper-' + id)
                    helper.setAttribute('style', 'display: none;')
                    helper.setAttribute('class', 'demomonkey-konva-helper')
                    helper.setAttribute('width', shape.width())
                    helper.innerHTML = current
                    document.body.appendChild(helper)
                  }
                  if (helper.innerHTML !== current) {
                    shape.text(helper.innerHTML)
                    shape.align('center')
                    shape.width(helper.getAttribute('width'))
                    stages.push(shape.getStage())
                  }
                }
              })
              stages.forEach(stage => stage && stage.draw())
            }, 100)
          }
          break
        case 'remove-hook-into-konva':
          if (konvaHookInterval > -1) {
            setTimeout(() => {
              clearInterval(konvaHookInterval)
              const helpers = document.getElementsByClassName('demomonkey-konva-helper')
              while (helpers[0]) {
                helpers[0].parentNode.removeChild(helpers[0])
              }
              konvaHookInterval = -1
            }, 200)
          }
          break
      }
    }
  })

  if (config.hookIntoAjax) {
    const functions = {
      patchAjaxResponse: (url, response, context) => {
        const link = scope.document.createElement('a')
        link.href = url
        if (match(url, context.urlPattern) || match(link.href, context.urlPattern)) {
          const patch = typeof context.patch === 'string' ? JSON5.parse(context.patch) : context.patch
          console.log(patch)
          const patched = jsonpatch.applyPatch(JSON5.parse(response), patch).newDocument
          console.log(patched)
          return JSON.stringify(patched)
        }
        return response
      },
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
    const openPrototype = XMLHttpRequest.prototype.open
    XMLHttpRequest.prototype.open = function () {
      const url = arguments[1]
      this.addEventListener('readystatechange', function (event) {
        if (this.readyState === 4) {
          const response = ajaxFilters.reduce((r, e) => {
            try {
              const r2 = functions[e[0]](url, r, e[1])
              return r2
            } catch (err) {
              console.warn(`Could not run ${e[0]}, because of an error:`)
              console.warn(err)
            }
            return r
          }, event.target.responseText)
          Object.defineProperty(this, 'response', { writable: true })
          Object.defineProperty(this, 'responseText', { writable: true })
          this.response = this.responseText = response
        }
      })
      return openPrototype.apply(this, arguments)
    }
  }
})(window, window.demoMonkeyConfig || { hookIntoAjax: false, hookIntoCanvas: false })
