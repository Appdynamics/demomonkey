import Command from '../Command'
// import UndoElement from '../UndoElement'

class ReplaceFlowmapConnection extends Command {
  constructor(tier1, tier2, value) {
    super()
    this.tier1 = tier1
    this.tier2 = tier2
    this.value = value
    console.log(this.tier1, this.tier2, value)
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
          g.parentElement.childNodes.forEach(
            (node, index) => {
              node.className.baseVal = node.className.baseVal.replace(
                /ads(Normal|Critical|Warning)NodeColor/, 'ads' + this.value + 'NodeColor')
            }
          )
        }
      }
    }
    return false
  }
}

export default ReplaceFlowmapConnection
