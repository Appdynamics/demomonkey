import Configuration from './Configuration'
import Repository from './Repository'

class Monkey {
  constructor(rawConfigurations, scope, withUndo = true, intervalTime = 100) {
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
    this.configurations = rawConfigurations.map((rawConfig) => {
      var config = new Configuration(rawConfig.content, this.repository, rawConfig.enabled === true, rawConfig.values)
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
    this._applyOnXpathGroup(configuration, '//body//text()[ normalize-space(.) != ""]', 'text', 'data')
    this._applyOnXpathGroup(configuration, '//body//input', 'input', 'value')
    this._applyOnXpathGroup(configuration, '//body//img', 'image', 'src')
    this._applyOnXpathGroup(configuration, '//body//a', 'link', 'href')
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
      // The following is a workaround to cover <tspan> in SVG.
      // This will only work if a <title> is set.
      if (text.parentNode.tagName === 'title' &&
          text.parentNode.parentNode !== null &&
          text.parentNode.parentNode.tagName === 'text') {
        var pp = text.parentNode.parentNode
        var content = []
        pp.querySelectorAll('tspan').forEach(function (tspan) {
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
        pp.querySelectorAll('tspan').forEach(function (tspan) {
          tspan.textContent = words.slice(wordCounter,
            wordCounter + tspan.textContent.split(' ').length).join(' ')
          wordCounter += tspan.textContent.split(' ').length
        })
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
