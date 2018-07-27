import Command from '../Command'
import UndoElement from '../UndoElement'

class RecolorTimeseriesGraph extends Command {
  constructor(search, replace) {
    super()
    this.search = isNaN(parseInt(search, 16)) ? search : '#' + search
    this.replace = replace
  }

  isApplicableForGroup(group) {
    return group === 'ad-timeseries-graph' || group === '*'
  }

  apply(node, key = 'value') {
    var svg = node.querySelector('svg')

    if (!svg) {
      return false
    }

    var r = []

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

    return r
  }
}

export default RecolorTimeseriesGraph
