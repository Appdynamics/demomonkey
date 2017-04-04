import Command from './Command'
import UndoElement from './UndoElement'

class SearchAndReplace extends Command {
  constructor(search, replace) {
    super()
    this.search = search
    this.replace = replace
  }

  apply(target, key = 'value') {
    var original = target[key]
    var replacement = target[key].replace(this.search, this.replace)
    target[key] = replacement
    if (replacement !== original) {
      return new UndoElement(target, key, original, replacement)
    }
    return false
  }

  toString() {
    return this.search.toString() + '/' + this.replace.toString()
  }
}

export default SearchAndReplace
