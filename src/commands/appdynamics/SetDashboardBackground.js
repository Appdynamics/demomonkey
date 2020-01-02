import Command from '../Command'
import UndoElement from '../UndoElement'
import Color from 'color'

class SetDashboardBackground extends Command {
  constructor(dashboardId = '', opacity = 0, value, location) {
    super()
    this.dashboardId = dashboardId
    const [newValue, isImage] = typeof value === 'string' ? SetDashboardBackground._getValue(value) : [false, false]
    this.opacity = opacity
    this.value = newValue
    this.isImage = isImage
    this.location = location
  }

  static _getValue(value) {
    // We want to accept colors from hex 'xxxxxx' and 'xxx'
    if (value.match(/^[0-9a-f]{3}(?:[0-9a-f]{3})?$/i) !== null) {
      return [Color('#' + value).rgb().string(), false]
    }
    // Try to parse a color from the value. If it fails we have assume an image
    try {
      return [Color(value).rgb().string(), false]
    } catch (e) {
      return ['url("' + value + '")', true]
    }
  }

  isApplicableForGroup(group) {
    return group === 'ad-dashboard' || group === '*'
  }

  _checkDashboardId() {
    return typeof this.location === 'object' && this.location.toString().includes('dashboard=' + this.dashboardId)
  }

  apply(target, key = 'style') {
    if (!this._checkDashboardId() || !this.value) {
      return false
    }

    var r = []

    const attribute = this.isImage ? 'backgroundImage' : 'backgroundColor'
    var original = target.style[attribute]
    var replacement = this.value
    if (replacement !== original) {
      target.style[attribute] = replacement
      r.push(new UndoElement(target, 'style.' + attribute, original, replacement))
    }

    const originalBackgroundSize = target.style.backgroundSize
    const replacementBackgroundSize = 'cover'

    if (originalBackgroundSize !== replacementBackgroundSize) {
      target.style.backgroundSize = replacementBackgroundSize
      r.push(new UndoElement(target, 'style.backgroundSize', originalBackgroundSize, replacementBackgroundSize))
    }

    if (this.opacity && this.isImage) {
      const originalColor = target.style.backgroundColor
      const replacementColor = `rgba(255, 255, 255, ${this.opacity})`

      if (originalColor !== replacementColor) {
        target.style.backgroundColor = replacementColor
        r.push(new UndoElement(target, 'style.backgroundColor', originalColor, replacementColor))
      }

      const originalBlendMode = target.style.backgroundBlendMode
      const replacementBlendMode = 'screen'

      if (originalBlendMode !== replacementBlendMode) {
        target.style.backgroundBlendMode = replacementBlendMode
        r.push(new UndoElement(target, 'style.backgroundBlendMode', originalBlendMode, replacementBlendMode))
      }
    }

    return r
  }
}

export default SetDashboardBackground
