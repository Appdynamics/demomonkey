import Command from '../Command'

class RemoveFlowmapNode extends Command {
  constructor(search) {
    super()
    this.search = search
  }

  isApplicableForGroup(group) {
    return group === 'ajax' || group === '*'
  }

  apply(target, key) {
    target.add(function (url, response, context) {
      if (url.match(/applicationFlowMapUiService/i)) {
        var j = JSON.parse(response)
        console.log(j.nodes)
        j.nodes = j.nodes.filter(node => node.name !== context.search)
        return JSON.stringify(j)
      }
      return response
    }, { search: this.search })
    return false
  }
}

export default RemoveFlowmapNode
