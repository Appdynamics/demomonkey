import Command from '../Command'
import Hide from '../Hide'

class HideBrowserApplication extends Command {
  constructor(appName, _, context) {
    super()
    this.helpers = [
      new Hide(appName, 4, 'x-grid-row', '', 'EUM_WEB_ALL_APPS', location),
      new Hide(appName, 2, 'ads-home-list-item', '', 'AD_HOME_OVERVIEW', location, function (_, parentNode) {
        return parentNode.getAttribute('ng-click').includes('ViewEumWebApplication')
      })
    ]
  }

  apply(node, key) {
    return this.helpers.reduce((acc, cmd) => {
      return acc || cmd.apply(node, key)
    }, false)
  }
}

export default HideBrowserApplication
