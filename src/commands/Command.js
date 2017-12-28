import UndoElement from './UndoElement'

class Command {
  apply(target) {
    return target
  }

  _walk(node, count) {
    if (count === 0) {
      return node
    }

    if (node.parentElement !== null && typeof node.parentElement !== 'undefined') {
      return this._walk(node.parentElement, count - 1)
    }

    return false
  }

  _hideNode(node) {
    var original = node.style.display
    node.style.display = 'none'
    if (original !== node.style.display) {
      return new UndoElement(node.style, 'display', original, 'none')
    }
    return false
  }
}

export default Command
