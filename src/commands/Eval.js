import Command from './Command'
import UndoElement from './UndoElement'

// !eval(group)
class Eval extends Command {
  constructor(group = '*', parameters = [], script = '') {
    super()
    this.group = group
    this.parameters = parameters
    /* eslint no-new-func: "off" */
    this.func = new Function('target', 'key', 'parameters', 'UndoElement', script)
  }

  isApplicableForGroup(group) {
    return this.group === '*' || group === this.group
  }

  apply(target, key = 'value') {
    const r = this.func(target, key, this.parameters, UndoElement)
    if (r instanceof UndoElement) {
      return r
    }
    if (Array.isArray(r)) {
      return r.reduce((carry, element) => element instanceof UndoElement ? carry.concat(element) : carry, [])
    }
    return false
  }
}

export default Eval
