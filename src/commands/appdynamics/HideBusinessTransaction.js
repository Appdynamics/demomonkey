import Command from '../Command'

class HideBusinessTransaction extends Command {
  constructor(btName, _, context) {
    super()
    this.btName = btName
    this.context = context
  }

  _checkNode(node, className) {
    return node !== false && node.style.display !== 'none' && typeof node.className.includes === 'function' && node.className.includes(className)
  }

  apply(node, key) {
    if (typeof node[key] !== 'undefined' && node[key].trim() === this.btName && typeof this.context === 'string' && this.context.includes('APP_BT_LIST')) {
      // Delete in list view
      var parentNode = this._walk(node, 3)
      if (this._checkNode(parentNode, 'x-grid-row')) {
        this._hideNode(parentNode)
      }
    }
    return false
  }
}

export default HideBusinessTransaction
