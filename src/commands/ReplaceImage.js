import Command from './Command'
import UndoElement from './UndoElement'

class ReplaceImage extends Command {
  constructor(search, replace, withRatio = true) {
    super()
    this.search = search
    this.replace = replace
    this.withRatio = withRatio === '1' || withRatio === 'true'
  }

  isApplicableForGroup(group) {
    return group === 'image' || group === '*'
  }

  apply(target, key = 'value') {
    const original = key === 'style.backgroundImage' ? target.style.backgroundImage : target[key]

    const search = this._lookupImage(this.search)

    // An empty replacement seems to break the image, so we ignore it.
    if (this.replace === '') {
      return false
    }

    if (this._match(original, search, this.replace)) {
      const result = []
      if (this.withRatio && typeof target.width === 'number' && typeof target.height === 'number') {
        const oldWidth = target.width
        const oldHeight = target.height
        const undoPlaceholder = new UndoElement()
        const el = function (e) {
          const widthFactor = this.naturalWidth / oldWidth
          const heightFactor = this.naturalHeight / oldHeight
          if (this.naturalWidth > this.naturalHeight) {
            const originalHeight = this.style.height
            this.style.height = (oldHeight * heightFactor / widthFactor) + 'px'
            undoPlaceholder.update(this, 'style.height', originalHeight, this.style.height)
          } else {
            const originalWidth = this.style.width
            this.style.width = (oldWidth * widthFactor / heightFactor) + 'px'
            undoPlaceholder.update(this, 'style.height', originalWidth, this.style.width)
          }
          this.removeEventListener('load', el)
        }
        target.addEventListener('load', el)
        result.push(undoPlaceholder)
      }

      if (key === 'style.backgroundImage') {
        target.style.backgroundImage = `url("${this.replace}")`
        console.log(new UndoElement(target, key, original, `url("${this.replace}")`))
        result.push(new UndoElement(target, key, original, `url("${this.replace}")`))
      } else {
        target[key] = this.replace
        result.push(new UndoElement(target, key, original, this.replace))
      }

      return result
    }
    return false
  }

  toString() {
    return this.search.toString() + '/' + this.replace.toString()
  }
}

export default ReplaceImage
