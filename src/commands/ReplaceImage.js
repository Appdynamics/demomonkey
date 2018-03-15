import Command from './Command'
import UndoElement from './UndoElement'

class ReplaceImage extends Command {
  constructor(search, replace) {
    super()
    this.search = search
    this.replace = replace
  }

  isApplicableForGroup(group) {
    return group === 'image' || group === '*'
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

  apply(target, key = 'value') {
    var original = target[key]

    if (this._match(original)) {
      target[key] = this.replace
      return new UndoElement(target, key, original, this.replace)
    }
    return false
  }

  toString() {
    return this.search.toString() + '/' + this.replace.toString()
  }
}

export default ReplaceImage
