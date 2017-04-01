import Command from '../Command'

class HideApplication extends Command {
  constructor(appName, _) {
    super()
    this.appName = appName
  }

  apply(node, key) {
    if (typeof node[key] !== 'undefined' && node[key].trim() === this.appName) {
      var parent = this._walk(node, 4)
      if (parent !== false && parent.style.display !== 'none' && parent.className.includes('ads-application-card')) {
        parent.style.display = 'none'
      }
    }
  }
}

export default HideApplication
