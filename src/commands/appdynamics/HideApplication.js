import Command from '../Command'

class HideApplication extends Command {
  constructor(appName, _, context) {
    super()
    this.appName = appName
    this.context = context
  }

  _checkNode(node, className) {
    return node !== false && node.style.display !== 'none' && typeof node.className.includes === 'function' && node.className.includes(className)
  }

  apply(node, key) {
    if (typeof node[key] !== 'undefined' && node[key].trim() === this.appName && typeof this.context === 'string' && this.context.includes('APPS_ALL_DASHBOARD')) {
      // Delete in box view
      var parentNode = this._walk(node, 4)
      if (this._checkNode(parentNode, 'ads-application-card')) {
        return this._hideNode(parentNode)
      }
      // Delete in list view
      parentNode = this._walk(node, 3)
      if (this._checkNode(parentNode, 'x-grid-row')) {
        return this._hideNode(parentNode)
      }
    }
    return false
  }
}

export default HideApplication
