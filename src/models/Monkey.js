import Configuration from './Configuration'
import Repository from './Repository'
import UndoElement from '../commands/UndoElement'
import Manifest from './Manifest'

class Monkey {
  constructor(rawConfigurations, scope, withUndo = true, intervalTime = 100, withTemplateEngine = false, urlManager = false, withDebug = false, withDebugBox = false, withLiveMode = false, withEvalCommand = false) {
    this.scope = scope
    this.undo = []
    this.repository = new Repository({})
    this.withUndo = withUndo
    this.withDebug = withDebug
    this.withDebugBox = withDebugBox
    this.withLiveMode = withLiveMode
    this.withEvalCommand = withEvalCommand
    this.avgRunTime = 0
    this.maxRunTime = 0
    this.runCount = 0
    this.intervalTime = intervalTime
    if (typeof this.intervalTime !== 'number' || this.intervalTime < 100) {
      console.log('Interval time is not well-defined: ' + this.intervalTime)
      this.intervalTime = 100
    }
    this.intervals = []
    var templateEngineProperties = {
      enabled: withTemplateEngine,
      variables: {
        location: scope.location ? scope.location : {}
      }
    }
    this.configurations = rawConfigurations.map((rawConfig) => {
      var config = new Configuration(rawConfig.content, this.repository, rawConfig.enabled === true, rawConfig.values, templateEngineProperties, withEvalCommand)
      this.repository.addConfiguration(rawConfig.name, config)
      return [rawConfig.name, config]
    })
    this.urlManager = urlManager === false ? {add: () => {}, remove: () => {}, clear: () => {}} : urlManager
    this.manifest = new Manifest(scope.chrome)
  }

  getUndoLength() {
    return this.undo.length
  }

  countRunningConfigurations() {
    return this.intervals.length
  }

  injectMonkeyHead() {
    if (this.scope.document.head) {
      this.scope.document.head.dataset.demoMonkeyVersion = this.manifest.version()
      this.scope.document.head.dataset.demoMonkeyMode = this.withDebug ? 'debug' : (this.withLiveMode ? 'live' : 'unknown')
    }
  }

  injectDebugHelper() {
    if (this.scope.document.getElementById('demo-monkey-debug-helper-style') === null) {
      this.scope.document.head.insertAdjacentHTML('beforeend', `<style id="demo-monkey-debug-helper-style">
      [data-demo-monkey-debug] { background-color: rgba(255, 255, 0, 0.5); }
      svg [data-demo-monkey-debug] { filter: url(#dm-debug-filter-visible) }
      [data-demo-monkey-debug-display] { display: var(--data-demo-monkey-debug-display) !important; background-color: rgba(255, 0, 0, 0.5); }
      [data-demo-monkey-debug-display] * { display: var(--data-demo-monkey-debug-display) !important; background-color: rgba(255, 0, 0, 0.5); }
      svg [data-demo-monkey-debug-display] { display: var(--data-demo-monkey-debug-display) !important; filter: url(#dm-debug-filter-hidden) }
      #demo-monkey-debug-box { position: fixed; top: 25px; right: 25px; border: 1px solid black; background: rgb(255,255,255,0.8); z-index: 9999; padding: 15px; pointer-events: none;}
      </style>`)
    }

    /*
    f = (e) => { document.body.insertAdjacentHTML('beforeend', '<div style="width: 50px; height: 50px; position: fixed; top: '+(e.target.getClientRects()[0].y-20)+'px; left: '+(e.target.getClientRects()[0].x+e.target.getClientRects()[0].width/2)+'px">123</div>'); console.log(e); }
    document.querySelectorAll("[data-demo-monkey-debug]").forEach(elem => elem.addEventListener('mouseover', (e) => f(e)))
    */

    if (this.scope.document.body && this.scope.document.getElementById('demo-monkey-debug-helper-svg') === null) {
      this.scope.document.body.insertAdjacentHTML('beforeend', `<svg id="demo-monkey-debug-helper-svg">
        <defs>
          <filter x="0" y="0" width="1" height="1" id="dm-debug-filter-visible">
            <feFlood flood-color="yellow" flood-opacity="0.5" />
            <feComposite in="SourceGraphic" />
          </filter>
          <filter x="0" y="0" width="1" height="1" id="dm-debug-filter-hidden">
            <feFlood flood-color="red" flood-opacity="0.5" />
            <feComposite in="SourceGraphic" />
          </filter>
        </defs>
      </svg>`)
    }

    if (this.withDebugBox && this.scope.document.body && this.scope.document.getElementById('demo-monkey-debug-box') === null) {
      this.scope.document.body.insertAdjacentHTML('beforeend', `<div id="demo-monkey-debug-box">
      Demo Monkey - Debug Box
        <div>Runtime: <span id="demo-monkey-last-runtime"></span></div>
        <div>Inspected Elements: <span id="demo-monkey-elements-count"></span></div>
        <div>Undo Length: <span id="demo-monkey-undo-length"></span></div>
      </div>`)
    }
  }

  updateDebugBox(lastTime, sum) {
    if (this.withDebugBox) {
      var e1 = this.scope.document.getElementById('demo-monkey-last-runtime')
      if (e1) {
        this.runCount++
        this.avgRunTime += (lastTime - this.avgRunTime) / this.runCount
        this.maxRunTime = Math.max(lastTime, this.maxRunTime)
        if (this.runCount % 10 === 0) {
          e1.innerHTML = lastTime + ' (avg: ' + this.avgRunTime + ', max: ' + this.maxRunTime + ', count: ' + this.runCount + ')'
        }
      }
      var e2 = this.scope.document.getElementById('demo-monkey-undo-length')
      if (e2) {
        e2.innerHTML = this.undo.length
      }
      var e3 = this.scope.document.getElementById('demo-monkey-elements-count')
      if (e3) {
        e3.innerHTML = Object.keys(sum).reduce((acc, key) => {
          return acc.concat(`${key}: ${sum[key]}`)
        }, []).join(', ')
      }
    }
  }

  addDebugAttribute(element, isHidden) {
    // UndoElement(node, 'display.style', original, 'none')
    element.dataset.demoMonkeyDebug = true
    if (isHidden !== false) {
      element.dataset.demoMonkeyDebugDisplay = isHidden === '' ? 'initial' : isHidden
      element.style.setProperty('--data-demo-monkey-debug-display', isHidden === '' ? 'initial' : isHidden)
    }
  }

  addUndo(arr) {
    if (this.withUndo) {
      // Simple protection against loops that fill up the undo array.
      if (this.undo.length > 100000) {
        console.log('Too many undo elements, disabling undo feature.')
        this.withUndo = false
      }
      this.undo = this.undo.concat(arr)
    }
    this.injectMonkeyHead()
    if (this.withDebug) {
      arr.forEach((undoElement) => {
        if (!undoElement.target) {
          return
        }
        const isHidden = undoElement.key === 'style.display' && undoElement.replacement === 'none' ? undoElement.original : false
        switch (undoElement.target.nodeType) {
          case 1:
            if (undoElement.target && undoElement.target.dataset) {
              this.addDebugAttribute(undoElement.target, isHidden)
            }
            break
          case 3:
            if (undoElement.target && undoElement.target.parentElement && undoElement.target.parentElement.dataset) {
              this.addDebugAttribute(undoElement.target.parentElement, isHidden)
            }
            break
        }
      })
      this.injectDebugHelper()
    }
  }

  applyOnce(configuration) {
    // Execute the commands for webRequest hooks only once
    this.addUndo(configuration.apply(this.urlManager, 'value', 'url'))
  }

  apply(configuration) {
    var t0 = this.scope.performance.now()
    var sum = {}
    // Some UIs provide corner cases we want to cover with DemoMonkey for ease of use
    // Most of them are text, that is shortened or split over multiple elements.
    // We do them early, because later modfications may cause problems to get them solved.
    this._cornerCases(configuration)

    sum.text = (this._applyOnXpathGroup(configuration, '//body//text()[ normalize-space(.) != ""]', 'text', 'data'))
    sum.input = (this._applyOnXpathGroup(configuration, '//body//input', 'input', 'value'))
    sum.image = (this._applyOnXpathGroup(configuration, '//body//img', 'image', 'src'))
    sum.link = (this._applyOnXpathGroup(configuration, '//body//a', 'link', 'href'))
    sum.dashboard = (this._applyOnXpathGroup(configuration, '//body//div[contains(@class, "ads-dashboard-canvas-pane")]', 'ad-dashboard', 'style'))

    // Apply the text commands on the title element
    this.addUndo(configuration.apply(this.scope.document, 'title', 'text'))

    // Finally we can apply document commands on the document itself.
    this.addUndo(configuration.apply(this.scope.document, 'documentElement', 'document'))
    if (this.withDebug) {
      const rt = this.scope.performance.now() - t0
      this.updateDebugBox(rt, sum)
      if (rt > this.intervalTime) {
        console.log(`Run took longer than ${this.intervalTime}: ${rt}`)
      }
    }
  }

  _applyOnXpathGroup(configuration, xpath, groupName, key) {
    var text, i
    var texts = this.scope.document.evaluate(xpath, this.scope.document, null, 6, null)
    for (i = 0; (text = texts.snapshotItem(i)) !== null; i += 1) {
      this.addUndo(configuration.apply(text, key, groupName))
    }
    return i
  }

  _cornerCases(configuration) {
    var undos = []
    // On the flowmap nodes might be shorten by name, but the full name is still kept in the title.
    // We can use that knowledge to replace the shortened names
    this.scope.document.querySelectorAll('svg .adsFlowMapNode > title').forEach(title => {
      title.parentElement.querySelectorAll('.adsFlowMapTextContainer tspan').forEach(tspan => {
        if (tspan.textContent.includes('...')) {
          let pseudoNode = {
            'value': title.textContent
          }
          configuration.apply(pseudoNode, 'value', 'text')
          const replacement = pseudoNode.value.length > 32 ? pseudoNode.value.substr(0, 15) + '...' + pseudoNode.value.substr(-15) : pseudoNode.value
          if (tspan.textContent !== replacement) {
            const original = tspan.textContent
            tspan.textContent = replacement
            undos.push(new UndoElement(tspan, 'textContent', original, tspan.textContent))
          }
        }
      })
    })

    // In AppDynamics Analytics the Tree widget view uses <tspan> in <text> to split
    // text over multiple lines. The full text is contained in a <title> tag.
    // So we search for the <title> in the <text> and check if tspans are contained.
    this.scope.document.querySelectorAll('svg text title').forEach(title => {
      var tspans = title.parentElement.querySelectorAll('tspan')
      if (tspans.length > 1) {
        var content = []
        tspans.forEach(function (tspan) {
          content = content.concat(tspan.textContent.split(' '))
        })
        var counter = content.length

        var pseudoNode = {
          'value': content.join(' ')
        }

        configuration.apply(pseudoNode, 'value', 'text')

        var words = pseudoNode.value.split(' ')

        if (words.length > counter) {
          words = words.slice(0, counter)
          words[counter - 1] = '...'
        }
        var wordCounter = 0
        tspans.forEach(function (tspan) {
          var original = tspan.textContent
          tspan.textContent = words.slice(wordCounter,
            wordCounter + tspan.textContent.split(' ').length).join(' ')
          wordCounter += tspan.textContent.split(' ').length
          undos.push(new UndoElement(tspan, 'textContent', original, tspan.textContent))
        })
      }
    })

    // In AppDynamics Analytics the Business Journey view shortens labels over the milestones.
    // In the source it looks like the following: Case <text>Lon...<title>Long Text</title></text>
    this.scope.document.querySelectorAll('svg text title').forEach(title => {
      if (title.parentElement.textContent.includes('...')) {
        var [short, long] = title.parentElement.textContent.split('...')
        if (long.startsWith(short)) {
          var pseudoNode = {
            'value': long
          }

          configuration.apply(pseudoNode, 'value', 'text')

          var result = pseudoNode.value.substring(0, short.length) + '...'

          var textNode = Array.from(title.parentElement.childNodes).filter(node => node.nodeType === 3)[0]

          var original = textNode.data
          textNode.data = result
          undos.push(new UndoElement(textNode, 'data', original, textNode.data))
        }
      }
    })

    // The Service Now Event Management Dashboard shortens words by space on a box
    // The full name is kept as "name" of the tspan
    this.scope.document.querySelectorAll('svg > g text > tspan[name]').forEach(tspan => {
      var pseudoNode = {
        'value': tspan.attributes.name.value
      }
      configuration.apply(pseudoNode, 'value', 'text')

      var original = tspan.textContent
      tspan.textContent = pseudoNode.value.substring(0, tspan.textContent.length)

      undos.push(new UndoElement(tspan, 'textContent', original, tspan.textContent))
    })
    this.addUndo(undos)
  }

  run(configuration) {
    this.applyOnce(configuration)
    return this.scope.setInterval(() => this.apply(configuration), this.intervalTime)
  }

  start() {
    this.intervals = this.runAll()
    return this.intervals.length
  }

  stop() {
    this.intervals.forEach((interval) => {
      this.scope.clearInterval(interval)
    })

    if (this.withUndo) {
      this.undo.reverse().forEach(undo => {
        if (typeof undo.apply === 'function') {
          undo.apply()
        }
      })
      this.undo = []
    }

    this.urlManager.clear()

    if (this.withDebug) {
      this.scope.document.querySelectorAll('[data-demo-monkey-debug]').forEach((element) => {
        delete element.dataset.demoMonkeyDebug
        delete element.dataset.demoMonkeyDebugDisplay
        element.style.removeProperty('--data-demo-monkey-debug-display')
      })
      var elem = document.querySelector('#demo-monkey-debug-box')
      if (elem) {
        elem.parentNode.removeChild(elem)
      }
    }
  }

  runAll() {
    return this.configurations.reduce((result, cfg) => {
      var configuration = cfg[1]

      if (configuration.isEnabledForUrl(this.scope.location.href)) {
        result.push(this.run(configuration))
      }

      return result
    }, [])
  }
}

export default Monkey
