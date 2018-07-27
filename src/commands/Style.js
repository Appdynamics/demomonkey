import Command from './Command'
import UndoElement from './UndoElement'

class Style extends Command {
  constructor(search, property, nthParent, value) {
    super()
    this.search = search
    this.nthParent = parseInt(nthParent) || 1
    this.property = property
    this.value = value
  }

  apply(node, key = 'value') {
    if (typeof node[key] !== 'undefined' && node[key].trim() === this.search) {
      node = node.parentElement
      node = this._walk(node, this.nthParent)
      var original = node.style[this.property]
      node.style[this.property] = this.value
      if (original !== this.value) {
        return new UndoElement(node.style, this.property, original, this.value)
      }
    }
    return false
  }
}

export default Style
