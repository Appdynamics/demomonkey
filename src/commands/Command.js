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

  _match(original, search, replace) {
    // This also works with "startsWithNot" (see below)
    // !search === replace becomes search !== replace
    // original === replace is evaluated before the code below
    if (search === replace || original === replace) {
      return false
    }

    var startsWithNot = search.charAt(0) === '!'
    var startsWithStar = search.charAt(0) === '*'
    var endsWithStar = search.slice(-1) === '*'

    if (startsWithNot) {
      return !this._match(original, search.slice(1), replace)
    }

    if (startsWithStar && endsWithStar) {
      return original.includes(search.slice(1, -1))
    }

    if (startsWithStar) {
      return original.endsWith(search.slice(1))
    }

    if (endsWithStar) {
      return original.startsWith(search.slice(0, -1))
    }

    return original === search
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
