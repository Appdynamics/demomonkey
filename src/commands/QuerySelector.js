import Command from './Command'
import UndoElement from './UndoElement'

class QuerySelector extends Command {
  constructor(selector, key = 'textContent', replacement) {
    super()
    this.selector = selector
    this.key = key
    this.replacement = replacement
  }

  isApplicableForGroup(group) {
    return group === 'document' || group === '*'
  }

  _applyOnTarget(target) {
    if (target === null || typeof target !== 'object' || typeof target.innerHTML !== 'string') {
      return false
    }

    let key = this.key

    if (key.includes('.')) {
      var path = key.split('.')
      key = path.pop()
      path.forEach(k => {
        if (target && target[k]) {
          target = target[k]
        }
      })
    }

    const original = target[key]

    if (original !== this.replacement) {
      target[key] = this.replacement
      return new UndoElement(target, key, original, this.replacement)
    }

    return false
  }

  apply(target, key = 'value') {
    if (target === null) {
      return false
    }

    if (typeof this.selector === 'string' && this.selector.length > 0) {
      const targetList = target[key].querySelectorAll(this.selector)
      switch (targetList.length) {
        case 0:
          return false
        case 1:
          return this._applyOnTarget(targetList[0])
        default:
          return Array.from(targetList).map(t => this._applyOnTarget(t))
      }
    } else {
      return false
    }
  }
}

export default QuerySelector
