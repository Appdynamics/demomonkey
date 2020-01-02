import Command from '../Command'
import UndoElement from '../UndoElement'

class ReplaceGeoStatus extends Command {
  static images = {
    normal: 'max_load_circle_green.svg',
    warning: 'max_load_circle_orange.svg',
    critical: 'max_load_circle_red.svg',
    green: 'max_load_circle_green.svg',
    orange: 'max_load_circle_orange.svg',
    yellow: 'max_load_circle_orange.svg',
    red: 'max_load_circle_red.svg'
  }

  static status = {
    'images/eum/max_load_circle_green.svg': 'normal',
    'images/eum/max_load_circle_orange.svg': 'warning',
    'images/eum/max_load_circle_red.svg': 'critical'
  }

  constructor(search, replace) {
    super()
    this.search = search
    this.replace = (typeof replace === 'string' && ['normal', 'warning', 'critical', 'green', 'orange', 'yellow', 'red'].includes(replace.toLowerCase())) ? 'images/eum/' + ReplaceGeoStatus.images[replace] : null
  }

  isApplicableForGroup(group) {
    return group === 'document' || group === '*'
  }

  apply(target, key) {
    // Array.from(franceCircle.parentElement.children).filter(image => { const {x,y} = image.getBBox(); return (b.x < x && x < b.x+b.width && b.y < y && y < b.y+b.height); })[0].href.baseVal = 'images/eum/max_load_circle_red.svg';
    if (target === null) {
      return false
    }

    const document = target[key]
    const country = document.querySelector(`.ads-geo-map-svg-layer path[name="${this.search}"]`)
    const circles = Array.from(document.querySelectorAll('.ads-geo-map-svg-layer .ads-geo-map-load-circle'))

    if (country && typeof country.getBBox === 'function' && circles.length > 0) {
      const b = country.getBBox()
      const image = circles.filter(image => { const { x, y } = image.getBBox(); return (b.x < x && x < b.x + b.width && b.y < y && y < b.y + b.height) })[0]

      if (typeof image !== 'undefined') {
        var original = image.href.baseVal
        image.href.baseVal = this.replace
        if (original !== this.replace) {
          const result = []
          result.push(new UndoElement(image, 'href.baseVal', original, this.newIcon))
          return result
        }
      }
    }

    return false
  }
}

export default ReplaceGeoStatus
