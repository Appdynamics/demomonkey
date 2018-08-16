import Command from '../Command'
import Color from 'color'
import UndoElement from '../UndoElement'

class RecolorDashboard extends Command {
  constructor(dashboardId, search, replace, location) {
    super()
    this.dashboardId = dashboardId
    this.search = RecolorDashboard._getValue(search)
    this.replace = replace
    this.location = location
  }

  static _getValue(value) {
    if (!isNaN(parseInt(value, 16))) {
      return '#' + value
    }

    return Color(value).rgb().string()
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
      var dots = svg.querySelectorAll('path[fill="' + this.search + '"]')

      var lines = svg.querySelectorAll('path[stroke="' + this.search + '"]')

      dots.forEach(path => {
        path.setAttribute('fill', this.replace)
        r.push(new UndoElement(path.attributes.fill, 'value', this.search, this.replace))
      })

      lines.forEach(path => {
        path.setAttribute('stroke', this.replace)
        r.push(new UndoElement(path.attributes.stroke, 'value', this.search, this.replace))
      })
    })
    return r
  }

  _recolorLabels(node) {
    var labels = node.querySelectorAll('ad-widget-label')
    var r = []

    var searchedColor = Color(this.search)

    labels.forEach((label) => {
      var currentBackgroundColor = Color(label.parentElement.style.backgroundColor)

      if (searchedColor.rgb().string() === currentBackgroundColor.rgb().string()) {
        var original = label.parentElement.style.backgroundColor
        label.parentElement.style.backgroundColor = Color(this.replace).rgb().string()
        r.push(new UndoElement(label.parentElement.style, 'backgroundColor', original, label.parentElement.style.backgroundColor))
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
      img.src = img.src.replace(new RegExp('(fill|stroke)="' + this.search + '"'), '$1="' + this.replace + '"')
      if (original !== img.src) {
        r.push(new UndoElement(img, 'src', original, img.src))
      }
    })

    return r
  }

  apply(node, key = 'value') {
    if (!this._checkDashboardId()) {
      return false
    }
    return this._recolorTimeseriesGraph(node).concat(this._recolorLabels(node)).concat(this._recolorImages(node))
  }
}

export default RecolorDashboard
