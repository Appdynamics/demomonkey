import Command from '../Command'
import Hide from '../Hide'

class HideApplication extends Command {
  constructor(appName, location) {
    super()
    this.helpers = [
      new Hide(appName, 4, 'ads-application-card', '', 'APPS_ALL_DASHBOARD', location),
      new Hide(appName, 3, 'x-grid-row', '', 'APPS_ALL_DASHBOARD', location),
      new Hide(appName, 2, 'ads-home-list-item', '', 'AD_HOME_OVERVIEW', location, function (_, parentNode) {
        return parentNode.getAttribute('ng-click').includes('ViewApplicationDashboard')
      })
    ]
  }

  apply(node, key) {
    return this.helpers.reduce((acc, cmd) => {
      return acc || cmd.apply(node, key)
    }, false)
  }
}

export default HideApplication
