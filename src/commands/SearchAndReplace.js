import Command from './Command'
import UndoElement from './UndoElement'

class SearchAndReplace extends Command {
  // Using '' as locationFilter and location as {} works with _checkLocation
  // since every string includes ''
  // cssFilter is not yet implemented
  constructor(search, replace, locationFilter = '', cssFilter = '', location = {}) {
    super()
    this.search = search
    this.replace = replace
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

    var original = target[key]
    var replacement = target[key].replace(this.search, this.replace)
    if (replacement !== original) {
      target[key] = replacement
      return new UndoElement(target, key, original, replacement)
    }
    return false
  }

  toString() {
    return this.search.toString() + '/' + this.replace.toString()
  }
}

export default SearchAndReplace
