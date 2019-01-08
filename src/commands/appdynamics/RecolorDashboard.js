import Command from '../Command'
import Color from 'color'
import UndoElement from '../UndoElement'

class RecolorDashboard extends Command {
  constructor(search, replace, dashboardId = '', location) {
    super()
    this.dashboardId = dashboardId
    this.search = typeof search === 'string' ? RecolorDashboard._getValue(search) : false
    this.replace = typeof replace === 'string' ? RecolorDashboard._getValue(replace) : false
    this.location = location
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

  _checkDashboardId() {
    return typeof this.location === 'object' && this.location.toString().includes('dashboard=' + this.dashboardId)
  }

  isApplicableForGroup(group) {
    return group === 'ad-dashboard' || group === '*'
  }

  _recolorTimeseriesGraph(node) {
    var svgs = node.querySelectorAll('ad-widget-timeseries-graph svg')

    var r = []

    svgs.forEach((svg) => {
      var dots = svg.querySelectorAll('path[fill="' + this.search.hex() + '"], path[fill="' + this.search.hex().toLowerCase() + '"], path[fill="' + this.search.rgb().string() + '"]')

      var lines = svg.querySelectorAll('path[stroke="' + this.search.hex() + '"], path[stroke="' + this.search.hex().toLowerCase() + '"], path[stroke="' + this.search.rgb().string() + '"]')

      dots.forEach(path => {
        path.setAttribute('fill', this.replace.hex())
        r.push(new UndoElement(path.attributes.fill, 'value', this.search.hex(), this.replace.hex()))
      })

      lines.forEach(path => {
        path.setAttribute('stroke', this.replace.hex())
        r.push(new UndoElement(path.attributes.stroke, 'value', this.search.hex(), this.replace.hex()))
      })
    })
    return r
  }

  _recolorLabels(node) {
    var labels = node.querySelectorAll('ad-widget-label')
    var r = []

    labels.forEach((label) => {
      var currentBackgroundColor = Color(label.parentElement.style.backgroundColor)

      if (this.search.hex() === currentBackgroundColor.hex()) {
        var original = label.parentElement.style.backgroundColor
        label.parentElement.style.backgroundColor = this.replace.hex()
        r.push(new UndoElement(label.parentElement.style, 'backgroundColor', original, label.parentElement.style.backgroundColor))
      }

      var textLabel = label.querySelector('.ad-widget-label')
      if (textLabel !== null) {
        var currentTextColor = Color(textLabel.style.color)

        if (this.search.hex() === currentTextColor.hex()) {
          var original2 = textLabel.style.color
          textLabel.style.color = this.replace.hex()
          r.push(new UndoElement(textLabel.style, 'color', original2, textLabel.style.color))
        }
      }
    })
    return r
  }

  _recolorImages(node) {
    var images = node.querySelectorAll('ad-widget-image')

    var r = []

    images.forEach((image) => {
      var img = image.querySelector('img:not([class])')
      if (!img || !img.src.includes('<svg')) {
        return
      }
      var original = img.src
      img.src = img.src.replace(new RegExp('(fill|stroke)="' + this.search.hex() + '"'), '$1="' + this.replace.hex() + '"')
      if (original !== img.src) {
        r.push(new UndoElement(img, 'src', original, img.src))
      }
    })

    return r
  }

  apply(node, key = 'value') {
    if (!this._checkDashboardId() || !this.search || !this.replace) {
      return false
    }
    var tsg = this._recolorTimeseriesGraph(node)
    var labels = this._recolorLabels(node)
    var images = this._recolorImages(node)

    return tsg.concat(labels).concat(images)
  }
}

export default RecolorDashboard
