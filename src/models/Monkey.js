import Configuration from './Configuration'
import Repository from './Repository'
import UndoElement from '../commands/UndoElement'

class Monkey {
  constructor(rawConfigurations, scope, withUndo = true, intervalTime = 100, withTemplateEngine = false) {
    this.scope = scope
    this.undo = []
    this.repository = new Repository({})
    this.withUndo = withUndo
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
  }

  getUndoLength() {
    return this.undo.length
  }

  countRunningConfigurations() {
    return this.intervals.length
  }

  addUndo(arr) {
    if (this.withUndo) {
      this.undo = this.undo.concat(arr)
    }
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
    document.querySelectorAll('svg text title').forEach(title => {
      var tspans = title.parentNode.querySelectorAll('tspan')
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
    document.querySelectorAll('svg text title').forEach(title => {
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
    this.addUndo(undos)
  }

  _cornerCasesOld(text, configuration, groupName, undos) {
    // The following are workarounds to cover some corner cases in AppD
    // One is the usage of <tspan> to split text over multiple lines
    // Another is where the text is shortened and only "title" holds the full text
    // This will only work if a <title> is set.
    if (text.parentNode.tagName === 'title' &&
        text.parentNode.parentNode !== null &&
        text.parentNode.parentNode.tagName === 'text') {
      var textNode = text.parentNode.parentNode
      var tspans = textNode.querySelectorAll('tspan')
      // Text is split over multiple <tspan>
      if (tspans.length > 1) {
        var content = []
        tspans.forEach(function (tspan) {
          content = content.concat(tspan.textContent.split(' '))
        })
        var counter = content.length

        var pseudoNode = {
          'value': content.join(' ')
        }

        configuration.apply(pseudoNode, 'value', groupName)

        var words = pseudoNode.value.split(' ')

        if (words.length > counter) {
          words = words.slice(0, counter)
          words[counter - 1] = '...'
        }
        var wordCounter = 0
        tspans.forEach(function (tspan) {
          tspan.textContent = words.slice(wordCounter,
            wordCounter + tspan.textContent.split(' ').length).join(' ')
          wordCounter += tspan.textContent.split(' ').length
        })
      }
      // Case <text>Lon...<title>Long Text</title></text>
      if (undos.length > 0 && textNode.textContent.includes('...')) {
        // textNode.textContent is "Lon...Long Text" (where Long Text might already be modified through DemoMonkey)
        var short = textNode.textContent.split('...')[0]
        if (undos[0].original.includes(short)) {
          // document.querySelectorAll('text').forEach(node => {console.log(Array.from(node.childNodes).filter(e => e.nodeType === 3))});
          var shortTextNode = Array.from(textNode.childNodes).filter(e => e.nodeType === 3)[0]
          shortTextNode[key] = undos[0].original
          // configuration.apply(shortTextNode, key, groupName)
        }
      }
    }
  }

  run(configuration) {
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
