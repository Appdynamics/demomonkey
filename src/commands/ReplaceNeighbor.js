import Command from './Command'
import UndoElement from './UndoElement'

class ReplaceNeighbor extends Command {
  constructor(search, replace, nthParent, cssSelector, locationFilter = '', property = '', location = {}, cb = null) {
    super()
    this.search = search
    this.replace = replace
    this.nthParent = nthParent
    this.cssSelector = cssSelector
    this.locationFilter = locationFilter
    this.property = property
    this.location = location
    this.cb = cb
  }

  _checkLocation() {
    return typeof this.location === 'object' &&
      this.location.toString().includes(this.locationFilter)
  }

  apply(target, key = 'value') {
    if (typeof this.replace === 'undefined') {
      return false
    }

    if (!this._checkLocation()) {
      return false
    }

    // Check if we can find search in the current node
    if (typeof target[key] !== 'undefined' && this._match(target[key].trim(), this.search, null) && this._checkLocation()) {
      // Walk up some parent nodes
      var parentNode = this._walk(target, this.nthParent)
      // Check if the parent node exists and has a querySelector, _walk can return false
      if (parentNode && typeof parentNode.querySelector === 'function') {
        var neighbor = parentNode.querySelector(this.cssSelector)
        // Check if we found a proper neighbor:
        // - If cb is defined, we use it for updating the found neighbor
        // - Otherwise, if this neighbor has at least one childNode, we assume that the child is a textNode
        if (neighbor) {
          if (typeof this.cb === 'function') {
            return this.cb(this.search, this.replace, neighbor)
          } else if (this.property === 'src') {
            let original = neighbor.src
            // Make sure that also relative paths are matched
            if (original !== this.replace && !original.endsWith(this.replace)) {
              neighbor.src = this.replace
              return new UndoElement(neighbor, 'src', original, neighbor.src)
            }
          } else if (this.property === 'href.baseVal') {
            let original = neighbor.href.baseVal
            if (original !== this.replace && !original.endsWith(this.replace)) {
              neighbor.href.baseVal = this.replace
              return new UndoElement(neighbor, 'href.baseVal', original, neighbor.href)
            }
          } else if (this.property !== '') {
            let original = neighbor.style[this.property]
            if (original !== this.replace) {
              neighbor.style[this.property] = this.replace
              return new UndoElement(neighbor, 'style.' + this.property, original, neighbor.style[this.property])
            }
          } else if (neighbor.childNodes && neighbor.childNodes.length > 0) {
            let neighborText = Array.from(neighbor.childNodes).filter(node => node.nodeType === 3)[0]
            let original = neighborText.data
            if (original !== this.replace) {
              neighborText.data = this.replace
              return new UndoElement(neighborText, 'data', original, this.replace)
            }
          }
        }
      }
    }
    return false
  }
}

export default ReplaceNeighbor
