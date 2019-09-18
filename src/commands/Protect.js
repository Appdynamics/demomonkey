import Command from './Command'
import UndoElement from './UndoElement'

class Protect extends Command {
  // Using '' as locationFilter and location as {} works with _checkLocation
  // since every string includes ''
  constructor(search, locationFilter = '', cssFilter = '', location = {}) {
    super()
    this.search = search
    this.locationFilter = locationFilter
    this.cssFilter = cssFilter
    this.location = location
  }

  _checkLocation() {
    return typeof this.location === 'object' &&
      this.location.toString().includes(this.locationFilter)
  }

  _checkCss(target) {
    if (this.cssFilter === '') {
      return true
    }
    return typeof target !== 'object' || target.parentNode === null || typeof target.parentNode !== 'object' || typeof target.parentNode.matches !== 'function' || target.parentNode.matches(this.cssFilter)
  }

  apply(target, key = 'value') {
    if (!this._checkLocation() || !this._checkCss(target)) {
      return false
    }

    if (typeof target[key] === 'undefined') {
      return false
    }

    var original = target[key].trim()
    if (this._match(original, this.search)) {
      target[key] = target[key].split('').join(String.fromCharCode(0x200B))
      return new UndoElement(target, key, original, target[key])
    }

    return false
  }

  toString() {
    return this.search.toString() + '/' + this.replace.toString()
  }
}

export default Protect
