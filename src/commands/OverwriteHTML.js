import Command from './Command'
import UndoElement from './UndoElement'
import uuidV4 from 'uuid/v4'

class OverwriteHTML extends Command {
  constructor(locationFilter, selector, html, location, conditionCallback) {
    super()
    this.locationFilter = locationFilter
    this.selector = selector
    this.html = html
    this.location = location
    this.marker = uuidV4()
    this.conditionCallback = typeof conditionCallback === 'function' ? conditionCallback : function () { return true }
  }

  _checkLocation() {
    return typeof this.location === 'object' &&
      this.location.toString().includes(this.locationFilter)
  }

  _addMarker(string) {
    return string + '<!-- ' + this.marker + ' -->'
  }

  isApplicableForGroup(group) {
    return group === 'document' || group === '*'
  }

  _applyOnTarget(target) {
    if (target === null || typeof target !== 'object' || typeof target.innerHTML !== 'string') {
      return false
    }

    var original = target.innerHTML

    if (!original.includes(this.marker)) {
      // Since the browser might modify the HTML we add a comment marker
      // to the end of the HTML to identify applied modifications
      var replacement = this._addMarker(this.html)
      target.innerHTML = replacement
      return new UndoElement(target, 'innerHTML', original, replacement)
    }

    return false
  }

  apply(target, key = 'value') {
    if (!this._checkLocation()) {
      return false
    }

    if (target === null) {
      return false
    }

    if (!this.conditionCallback(target)) {
      return false
    }

    if (typeof this.selector === 'string' && this.selector.length > 0) {
      var targetList = target[key].querySelectorAll(this.selector)
      switch (targetList.length) {
        case 0:
          return false
        case 1:
          target = targetList[0]
          break
        default:
          return Array.from(targetList).map(t => this._applyOnTarget(t))
      }
    } else {
      target = target[key]
    }

    return this._applyOnTarget(target)
  }

  toString() {
    return this.search.toString() + '/' + this.replace.toString()
  }
}

export default OverwriteHTML
