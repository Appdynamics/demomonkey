import Configuration from './Configuration'
import Repository from './Repository'
import UndoElement from '../commands/UndoElement'

class Monkey {
  constructor(rawConfigurations, scope, withUndo = true, intervalTime = 100, withTemplateEngine = false, urlManager = false, withDebug = false) {
    this.scope = scope
    this.undo = []
    this.repository = new Repository({})
    this.withUndo = withUndo
    this.withDebug = withDebug
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
      var config = new Configuration(rawConfig.content, this.repository, rawConfig.enabled === true, rawConfig.values, templateEngineProperties)
      this.repository.addConfiguration(rawConfig.name, config)
      return [rawConfig.name, config]
    })
    this.urlManager = urlManager === false ? {add: () => {}, remove: () => {}} : urlManager
  }

  getUndoLength() {
    return this.undo.length
  }

  countRunningConfigurations() {
    return this.intervals.length
  }

  injectDebugHelper() {
    if (this.scope.document.getElementById('demo-monkey-debug-helper-style') === null) {
      this.scope.document.head.insertAdjacentHTML('beforeend', `<style id="demo-monkey-debug-helper-style">
      [data-demo-monkey-debug] { background-color: rgba(255, 255, 0, 0.5); }
      svg [data-demo-monkey-debug] { filter: url(#dm-debug-filter) }
      </style>`)
    }

    /*
    f = (e) => { document.body.insertAdjacentHTML('beforeend', '<div style="width: 50px; height: 50px; position: fixed; top: '+(e.target.getClientRects()[0].y-20)+'px; left: '+(e.target.getClientRects()[0].x+e.target.getClientRects()[0].width/2)+'px">123</div>'); console.log(e); }
    document.querySelectorAll("[data-demo-monkey-debug]").forEach(elem => elem.addEventListener('mouseover', (e) => f(e)))
    */

    if (this.scope.document.body && this.scope.document.getElementById('demo-monkey-debug-helper-svg') === null) {
      this.scope.document.body.insertAdjacentHTML('beforeend', `<svg id="demo-monkey-debug-helper-svg">
        <defs>
          <filter x="0" y="0" width="1" height="1" id="dm-debug-filter">
            <feFlood flood-color="yellow" flood-opacity="0.5" />
            <feComposite in="SourceGraphic" />
          </filter>
        </defs>
      </svg>`)
    }
  }

  addUndo(arr) {
    if (this.withUndo) {
      this.undo = this.undo.concat(arr)
    }
    if (this.withDebug) {
      arr.forEach((undoElement) => {
        switch (undoElement.target.nodeType) {
          case 1:
            if (undoElement.target && undoElement.target.dataset) {
              undoElement.target.dataset.demoMonkeyDebug = 'true'
            }
            break
          case 3:
            if (undoElement.target && undoElement.target.parentElement && undoElement.target.parentElement.dataset) {
              undoElement.target.parentElement.dataset.demoMonkeyDebug = 'true'
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
    // Some UIs provide corner cases we want to cover with DemoMonkey for ease of use
    // Most of them are text, that is shortened or split over multiple elements.
    // We do them early, because later modfications may cause problems to get them solved.
    this._cornerCases(configuration)

    this._applyOnXpathGroup(configuration, '//body//text()[ normalize-space(.) != ""]', 'text', 'data')
    this._applyOnXpathGroup(configuration, '//body//input', 'input', 'value')
    this._applyOnXpathGroup(configuration, '//body//img', 'image', 'src')
    this._applyOnXpathGroup(configuration, '//body//a', 'link', 'href')
    this._applyOnXpathGroup(configuration, '//body//div[contains(@class, "ads-dashboard-canvas-pane")]', 'ad-dashboard', 'style')

    // Apply the text commands on the title element
    this.addUndo(configuration.apply(this.scope.document, 'title', 'text'))

    // Finally we can apply document commands on the document itself.
    this.addUndo(configuration.apply(this.scope.document, 'documentElement', 'document'))
  }

  _applyOnXpathGroup(configuration, xpath, groupName, key) {
    var text, i
    var texts = this.scope.document.evaluate(xpath, this.scope.document, null, 6, null)
    for (i = 0; (text = texts.snapshotItem(i)) !== null; i += 1) {
      this.addUndo(configuration.apply(text, key, groupName))
    }
  }

  _cornerCases(configuration) {
    var undos = []
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

    if (this.withDebug) {
      this.scope.document.querySelectorAll('[data-demo-monkey-debug]').forEach((element) => {
        delete element.dataset.demoMonkeyDebug
      })
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
