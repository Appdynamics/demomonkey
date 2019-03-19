import Command from '../Command'
import Color from 'color'
import colorString from 'color-string'
import UndoElement from '../UndoElement'

class RecolorDashboard extends Command {
  constructor(search, replace, dashboardId = '', location) {
    super()
    this.dashboardId = dashboardId
    this.search = typeof search === 'string' ? Command._getColorFromValue(search) : false
    this.replace = typeof replace === 'string' ? Command._getColorFromValue(replace) : false
    this.location = location
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

      var rects = svg.querySelectorAll('rect[fill="' + this.search.hex() + '"], rect[fill="' + this.search.hex().toLowerCase() + '"], rect[fill="' + this.search.rgb().string() + '"]')

      var lines = svg.querySelectorAll('path[stroke="' + this.search.hex() + '"], path[stroke="' + this.search.hex().toLowerCase() + '"], path[stroke="' + this.search.rgb().string() + '"]')

      var stops = svg.querySelectorAll('stop[stop-color="' + this.search.hex() + '"], stop[stop-color="' + this.search.hex().toLowerCase() + '"], stop[stop-color="' + this.search.rgb().string() + '"]')

      dots.forEach(path => {
        path.setAttribute('fill', this.replace.rgb().toString())
        r.push(new UndoElement(path.attributes.fill, 'value', this.search.rgb().toString(), this.replace.rgb().toString()))
      })

      rects.forEach(rect => {
        rect.setAttribute('fill', this.replace.rgb().toString())
        r.push(new UndoElement(rect.attributes.fill, 'value', this.search.rgb().toString(), this.replace.rgb().toString()))
      })

      lines.forEach(path => {
        path.setAttribute('stroke', this.replace.rgb().toString())
        r.push(new UndoElement(path.attributes.stroke, 'value', this.search.rgb().toString(), this.replace.rgb().toString()))
      })

      stops.forEach(stop => {
        stop.setAttribute('stop-color', this.replace.rgb().toString())
        r.push(new UndoElement(stop.attributes['stop-color'], 'value', this.search.rgb().toString(), this.replace.rgb().toString()))
      })
    })

    return r
  }

  _recolorLabels(node) {
    var labels = node.querySelectorAll('ad-widget-label')
    var r = []

    labels.forEach((label) => {
      var currentBackgroundColor = Color(label.parentElement.style.backgroundColor)

      if (this.search.rgb().toString() === currentBackgroundColor.rgb().toString()) {
        var original = label.parentElement.style.backgroundColor
        label.parentElement.style.backgroundColor = this.replace.rgb().toString()
        r.push(new UndoElement(label.parentElement.style, 'backgroundColor', original, label.parentElement.style.backgroundColor))
      }

      var textLabel = label.querySelector('.ad-widget-label')
      if (textLabel !== null) {
        var currentTextColor = Color(textLabel.style.color)

        if (this.search.rgb().toString() === currentTextColor.rgb().toString()) {
          var original2 = textLabel.style.color
          textLabel.style.color = this.replace.rgb().toString()
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

      img.src = img.src.replace(new RegExp('(fill|stroke)="(%23|#)' + (this.search.hex().slice(1)) + '"', 'gi'), '$1="$2' + this.replace.hex().slice(1) + '"')
      // Rerun with short color code
      var shortHex = colorString.to.hex(this.search.array()).split('').filter((_, i) => [1, 3, 5, 7].includes(i)).join('')
      img.src = img.src.replace(new RegExp('(fill|stroke)="(%23|#)' + (shortHex) + '"', 'gi'), '$1="$2' + this.replace.hex().slice(1) + '"')

      if (original !== img.src) {
        r.push(new UndoElement(img, 'src', original, img.src))
      }
    })

    return r
  }

  _recolorAnalytics(node) {
    var analyticsWidgets = node.querySelectorAll('ad-widget-analytics')

    var r = []

    analyticsWidgets.forEach((widget) => {
      var currentBackgroundColor = Color(widget.parentElement.style.backgroundColor)
      if (this.search.rgb().toString() === currentBackgroundColor.rgb().toString()) {
        Array.from(widget.querySelectorAll('[style*="background-color"]')).concat(widget.parentElement).forEach(element => {
          var original = element.style.backgroundColor
          element.style.backgroundColor = this.replace.rgb().toString()
          r.push(new UndoElement(element.style, 'backgroundColor', original, element.style.backgroundColor))
        })
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
    var analytics = this._recolorAnalytics(node)

    return tsg.concat(labels).concat(images).concat(analytics)
  }
}

export default RecolorDashboard
