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

  apply(target, key = 'value') {
    var original = target[key]

    var search = this._lookupImage(this.search)

    // An empty replacement seems to break the image, so we ignore it.
    if (this.replace === '') {
      return false
    }

    if (this._match(original, search, this.replace)) {
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
