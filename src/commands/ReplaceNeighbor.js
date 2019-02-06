import Command from './Command'
import UndoElement from './UndoElement'

class ReplaceNeighbor extends Command {
  constructor(search, replace, nthParent, cssSelector, locationFilter = '', location = {}) {
    super()
    this.search = search
    this.replace = replace
    this.nthParent = nthParent
    this.cssSelector = cssSelector
    this.locationFilter = locationFilter
    this.location = location
  }

  _checkLocation() {
    return typeof this.location === 'object' &&
      this.location.toString().includes(this.locationFilter)
  }

  apply(target, key = 'value') {
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
        // Check if we found a proper neighbor and this neighbor has at least one childNode
        // We assume that the child is a textNode
        if (neighbor && neighbor.childNodes && neighbor.childNodes.length > 0) {
          var neighborText = Array.from(neighbor.childNodes).filter(node => node.nodeType === 3)[0]
          var original = neighborText.data
          if (original !== this.replace) {
            neighborText.data = this.replace
            return new UndoElement(neighborText, 'data', original, this.replace)
          }
        }
      }
    }
    return false
  }
}

export default ReplaceNeighbor
