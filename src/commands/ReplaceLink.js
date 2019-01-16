import Command from './Command'
import UndoElement from './UndoElement'

class ReplaceLink extends Command {
  constructor(search, replace) {
    super()
    this.search = search
    this.replace = replace
  }

  isApplicableForGroup(group) {
    return group === 'link' || group === '*'
  }

  apply(target, key = 'value') {
    var original = target[key]
    if (this._match(original, this.search, this.replace)) {
      target[key] = this.replace
      return new UndoElement(target, key, original, this.replace)
    }
    return false
  }
}

export default ReplaceLink
