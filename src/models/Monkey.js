import Configuration from './Configuration'
import Repository from './Repository'

class Monkey {
  constructor(rawConfigurations, scope, withUndo = true) {
    this.scope = scope
    this.undo = []
    this.repository = new Repository({})
    this.withUndo = withUndo
    this.configurations = rawConfigurations.map((rawConfig) => {
      var config = new Configuration(rawConfig.content, this.repository, rawConfig.enabled, rawConfig.values)
      this.repository.addConfiguration(rawConfig.name, config)
      return [rawConfig.name, config]
    })
  }

  getUndoLength() {
    return this.undo.length
  }

  addUndo(arr) {
    if (this.withUndo) {
      this.undo = this.undo.concat(arr)
    }
  }

  apply(configuration) {
    var xpath = '//body//text()[ normalize-space(.) != ""]'
    var text
    var texts = this.scope.document.evaluate(xpath, this.scope.document, null, 6, null)
    for (var i = 0; (text = texts.snapshotItem(i)) !== null; i += 1) {
      this.addUndo(configuration.apply(text, 'data'))
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

        configuration.apply(pseudoNode)

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
    this.addUndo(configuration.apply(this.scope.document, 'title'))
  }

  run(configuration) {
    return this.scope.setInterval(() => this.apply(configuration), 100)
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
        undo.apply()
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
