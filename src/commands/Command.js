import UndoElement from './UndoElement'

class Command {
  apply() {
    return false
  }

  isApplicableForGroup(group) {
    return group === 'text' || group === 'input' || group === '*'
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

  _match(original) {
    if (this.search === this.replace || original === this.replace) {
      return false
    }

    var startsWithStar = this.search.charAt(0) === '*'
    var endsWithStar = this.search.slice(-1) === '*'

    if (startsWithStar && endsWithStar) {
      return original.includes(this.search.slice(1, -1))
    }

    if (startsWithStar) {
      return original.endsWith(this.search.slice(1))
    }

    if (endsWithStar) {
      return original.startsWith(this.search.slice(0, -1))
    }

    return original === this.search
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
