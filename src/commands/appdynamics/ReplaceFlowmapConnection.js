import Command from '../Command'
import UndoElement from '../UndoElement'

class ReplaceFlowmapConnection extends Command {
  constructor(tier1, tier2, value, force) {
    super()
    this.tier1 = tier1
    this.tier2 = tier2
    this.value = value
    this.force = force === '1' || force === 'true'
  }

  apply(node, key) {
    // It would be probably more efficient to run the following directly on the document
    // and search for the connection. This is currently not possible with DemoMonkey
    // An "advantage" of this approach is, that by going from the node "up" makes sure that we are within the (right) flowmap
    if (node[key].trim() === this.tier1) {
      var topLevelGraphics = this._walk(node, 3)
      if (topLevelGraphics.className.baseVal === 'topLevelGraphics') {
        var tier1id = ''
        var tier2id = ''
        var nodes = topLevelGraphics.querySelectorAll('g.adsFlowMapNode')
        nodes.forEach((node) => {
          var id = node.id
          var text = node.querySelector('title').innerHTML
          if (text === this.tier1) {
            tier1id = id
          }
          if (text === this.tier2) {
            tier2id = id
          }
        })

        var flowmapid = ''
        // Check if this is Appd4.3+ and we have a "flowmapid"
        if (tier1id.split('_').length === 3) {
          flowmapid = '_' + tier1id.split('_').pop()
          tier1id = tier1id.substring(0, tier1id.lastIndexOf('_'))
          tier2id = tier2id.substring(0, tier2id.lastIndexOf('_'))
        }

        var g = document.getElementById(tier1id + '_' + tier2id + flowmapid)
        if (g && g.parentElement) {
          var r = []
          g.parentElement.childNodes.forEach(
            (node, index) => {
              this.value.split(',').forEach(replacement => {
                replacement = replacement.charAt(0).toUpperCase() + replacement.slice(1).toLowerCase()
                if (['Normal', 'Critical', 'Warning', 'UnknownFlowMap'].includes(replacement)) {
                  var searchPattern = this.force ? /ads((Normal|Critical|Warning)Node|UnknownFlowMap)Color/ : /ads(Normal|Critical|Warning)NodeColor/
                  var newValue = node.className.baseVal.replace(
                    searchPattern, 'ads' + replacement + 'NodeColor')
                  if (newValue !== node.className.baseVal) {
                    var original = node.className.baseVal
                    node.className.baseVal = newValue
                    r.push(new UndoElement(node, 'className.baseVal', original, newValue))
                  }
                }
                if (replacement === 'Async') {
                  // Dash the line between the nodes.
                  if (node.hasAttribute('stroke-dasharray')) {
                    var origstroke = node.attributes['stroke-dasharray'].value
                    if (origstroke !== '5,5') {
                      node.attributes['stroke-dasharray'].value = '5,5'
                      r.push(new UndoElement(node.attributes['stroke-dasharray'], 'value', origstroke, '5,5'))
                    }
                  }
                  if (node.className.baseVal.includes('adsFlowMapStatsDetails') && !node.innerHTML.includes('(async)')) {
                    var innerHTML = node.innerHTML
                    node.innerHTML += ' (async)'
                    r.push(new UndoElement(node, 'innerHTML', innerHTML, node.innerHTML))
                  }
                }
                if (replacement === 'Hide') {
                  var oldDisplay = node.style.display
                  node.style.display = 'none'
                  r.push(new UndoElement(node, 'style.display', oldDisplay, node.style.display))
                }
              })
            }
          )
          return r
        }
      }
    }
    return false
  }
}

export default ReplaceFlowmapConnection
