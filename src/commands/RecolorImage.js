import Command from './Command'
import UndoElement from './UndoElement'
import Color from 'color'
import uuidV4 from 'uuid/v4'

class RecolorImage extends Command {
  constructor(search, replace) {
    super()
    this.search = search
    this.replace = typeof replace === 'string' ? RecolorImage._getValue(replace) : false
  }

  static _getValue(value) {
    // We want to accept colors from hex 'xxxxxx' and 'xxx'
    if (value.match(/^[0-9a-f]{3}(?:[0-9a-f]{3})?$/i) !== null) {
      value = '#' + value
    }
    var color = false
    try {
      color = Color(value)
    } catch (e) {
      console.log(e.message)
    }
    return color
  }

  isApplicableForGroup(group) {
    return group === 'image' || group === '*'
  }

  apply(target, key = 'value') {
    /* if (this._match(target[key], this.search) && target.parentElement && (!target.dataset.demomonkeyRecolorMarker || !target.dataset.demomonkeyRecolorMarker.includes(this.marker))) {
      target.dataset.demomonkeyRecolorMarker = target.dataset.demomonkeyRecolorMarker ? target.dataset.demomonkeyRecolorMarker + this.marker : this.marker
      var colorId = 'demomonkey-color-' + uuidV4()
      target.parentElement.innerHTML += '<svg height="0px" width="0px"><defs><filter id="' + colorId + '"><feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 0 0 0 0 1 0"/></filter></defs></svg>'
      target.style.backgroundColor = 'green'
      target.style.filter = `url(#${colorId})`
      console.log(target)
      console.log(target.style)
      /* if (target.parentElement && !target.parentElement.innerHTML.includes(this.marker)) {
        var colorId = 'demomonkey-color-' + uuidV4()
        target.parentElement.innerHTML += this._addMarker('<svg height="0px" width="0px"><defs><filter id="' + colorId + '"><feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 0 0 0 0 1 0"/></filter></defs></svg>')
        console.log(target, target.parentElement)
        target.style.backgroundColor = 'green'
        target.style.filter = `sepia()`
        console.log(target.style)
      }
    }
    */
    if (this._match(target[key], this.search) && !target.style.filter.includes('#demomonkey-color-')) {
      var original = target.style.filter
      var colorId = 'demomonkey-color-' + uuidV4()
      // Note: For some reason it does not work to add the SVG first and apply the filter second.
      target.style.filter += `url(#${colorId})`
      target.dataset.demoMonkeyId = `dmid-${uuidV4()}`
      var [ red, green, blue ] = this.replace.rgb().color.map(v => v / 255)
      var alpha = this.replace.rgb().valpha
      target.parentElement.innerHTML += `<svg height="0px" width="0px"><defs><filter id="${colorId}"><feColorMatrix type="matrix" values="0 0 0 0 ${red} 0 0 0 0 ${green} 0 0 0 0 ${blue} 0 0 0 0 ${alpha}"/></filter></defs></svg>`
      return new UndoElement(target.dataset.demoMonkeyId, 'style.filter', original, target.style.filter)
    }
    return false
  }

  toString() {
    return this.search.toString() + '/' + this.replace.toString()
  }
}

export default RecolorImage
