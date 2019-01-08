import Command from '../Command'
import UndoElement from '../UndoElement'
import Color from 'color'

class SetDashboardBackground extends Command {
  constructor(dashboardId = '', value, location) {
    super()
    this.dashboardId = dashboardId
    const [ newValue, isImage ] = typeof value === 'string' ? SetDashboardBackground._getValue(value) : [false, false]
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
      console.log('NOPE')
      return false
    }

    const attribute = this.isImage ? 'backgroundImage' : 'backgroundColor'
    var original = target.style[attribute]
    var replacement = this.value
    if (replacement !== original) {
      target.style[attribute] = replacement
      return new UndoElement(target.style, attribute, original, replacement)
    }
    return false
  }
}

export default SetDashboardBackground
