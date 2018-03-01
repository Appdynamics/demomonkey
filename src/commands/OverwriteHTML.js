import Command from './Command'
import UndoElement from './UndoElement'
import uuidV4 from 'uuid/v4'

class OverwriteHTML extends Command {
  constructor(locationFilter, selector, html, location) {
    super()
    this.locationFilter = locationFilter
    this.selector = selector
    this.html = html
    this.location = location
    this.marker = uuidV4()
  }

  _checkLocation() {
    return typeof this.location === 'object' &&
      this.location.toString().includes(this.locationFilter)
  }

  isApplicableForGroup(group) {
    return group === 'document' || group === '*'
  }

  apply(target, key = 'value') {
    if (!this._checkLocation()) {
      return false
    }

    if (typeof this.selector === 'string' && this.selector.length > 0) {
      target = target[key].querySelector(this.selector)
    } else {
      target = target[key]
    }
    var original = target.innerHTML

    if (!original.includes(this.marker)) {
      // Since the browser might modify the HTML we add a comment marker
      // to the end of the HTML to identify applied modifications
      target.innerHTML = this.html + '<!-- ' + this.marker + ' -->'
      return new UndoElement(target, 'innerHTML', original, this.html)
    }

    return false
  }

  toString() {
    return this.search.toString() + '/' + this.replace.toString()
  }
}

export default OverwriteHTML
