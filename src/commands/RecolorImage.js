import Command from './Command'
import UndoElement from './UndoElement'
import uuidV4 from 'uuid/v4'

class RecolorImage extends Command {
  constructor(search, replace) {
    super()
    this.search = search
    this.replace = typeof replace === 'string' ? Command._getColorFromValue(replace) : false
  }

  isApplicableForGroup(group) {
    return group === 'image' || group === '*'
  }

  apply(target, key = 'value') {
    if (!this.replace) {
      return false
    }

    var search = this._lookupImage(this.search)

    if (this._match(target[key], search) && !target.style.filter.includes('#demomonkey-color-')) {
      var original = target.style.filter
      var colorId = 'demomonkey-color-' + uuidV4()
      // Note: For some reason it does not work to add the SVG first and apply the filter second.
      target.style.filter += `url(#${colorId})`
      target.dataset.demoMonkeyId = `dmid-${uuidV4()}`
      var [red, green, blue] = this.replace.rgb().color.map(v => v / 255)
      var alpha = this.replace.rgb().valpha
      target.parentElement.innerHTML += `<svg height="0px" width="0px"><defs><filter id="${colorId}"><feColorMatrix type="matrix" values="0 0 0 0 ${red} 0 0 0 0 ${green} 0 0 0 0 ${blue} 0 0 0 ${alpha} 0"/></filter></defs></svg>`
      return new UndoElement(target.dataset.demoMonkeyId, 'style.filter', original, target.style.filter)
    }
    return false
  }

  toString() {
    return this.search.toString() + '/' + this.replace.toString()
  }
}

export default RecolorImage
