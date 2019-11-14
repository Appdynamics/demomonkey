import Command from '../Command'

class AddFlowmapNode extends Command {
  static types = {
    'java': ['APP_AGENT', 'Application Server'],
    'nodejs': ['NODEJS_APP_AGENT', 'Node.JS Server'],
    'php': ['PHP_APP_AGENT', 'PHP Application Server'],
    'python': ['PYTHON_APP_AGENT', 'Python Server'],
    'native': ['NATIVE_SDK', 'C/C++ SDK'],
    'dotnet': ['DOT_NET_APP_AGENT', '.NET Application Server'],
    'go': ['GOLANG_SDK', 'Golang SDK'],
    'wmb': ['WMB_AGENT', 'WMB Agent']
  }

  constructor(name, type = 'java') {
    super()
    this.name = name
    this.type = type.toLowerCase()
  }

  isApplicableForGroup(group) {
    return group === 'ajax' || group === '*'
  }

  apply(target, key) {
    const [agentType, componentType] = AddFlowmapNode.types[this.type]

    const id = Math.floor(Math.random() * (73741824) + 1000000000)

    target.add(function (url, response, context) {
      if (!url.match(/applicationFlowMapUiService/i)) {
        return response
      }

      const j = JSON.parse(response)
      const from = j.nodes.find(x => x.id.startsWith('Type:APPLICATION_COMPONENT'))
      if (typeof from === 'undefined') {
        console.log('Could not find node.')
        return response
      }

      const node = JSON.parse(JSON.stringify(from))
      node.name = context.name
      node.id = 'Type:APPLICATION_COMPONENT, id:' + context.id
      // node.preferenceValue.position.x = 400
      // node.preferenceValue.position.y = 100
      node.agentType = context.agentType
      node.componentType = context.componentType
      node.productType = context.agentType
      j.nodes.push(node)
      return JSON.stringify(j)
    }, { name: this.name, agentType, componentType, id })

    return false
  }
}

export default AddFlowmapNode
