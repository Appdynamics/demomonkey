import Command from './Command'
import UndoElement from './UndoElement'
import uuidV4 from 'uuid/v4'

class InsertBefore extends Command {
  // Using '' as locationFilter and location as {} works with _checkLocation
  // since every string includes ''
  // cssFilter is not yet implemented
  constructor(search, insert, cssSelector, locationFilter = '', location = {}) {
    super()
    this.search = search
    console.log(search, insert, cssSelector, locationFilter)
    this.insert = insert
    this.cssSelector = cssSelector
    this.locationFilter = locationFilter
    this.location = location
    this.marker = uuidV4()
  }

  _checkLocation() {
    return typeof this.location === 'object' &&
      this.location.toString().includes(this.locationFilter)
  }

  _addMarker(string) {
    return string + '<!-- ' + this.marker + ' -->'
  }

  apply(target, key = 'value') {
    if (!this._checkLocation()) {
      console.log('Location Check Failed')
      return false
    }

    // Check if we can find search in the current node
    if (this.input !== '' && typeof target[key] !== 'undefined' && this._match(target[key].trim(), this.search, null) && this._checkLocation()) {
      var parentElement = target.parentElement
      if (parentElement && !parentElement.innerHTML.includes(this.marker)) {
        var original = parentElement.innerHTML
        parentElement.insertAdjacentHTML('afterbegin', this._addMarker(this.insert))
        return new UndoElement(parentElement, 'innerHTML', original, parentElement.innerHTML)
      }
    }
    return false
  }
}

export default InsertBefore
