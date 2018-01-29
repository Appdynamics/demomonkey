import Command from '../Command'
import Hide from '../Hide'

class HideDatabase extends Command {
  constructor(dbName, location) {
    super()
    this.helpers = [
      new Hide(dbName, 9, 'ads-database-card', '', 'DB_MONITORING_SERVER_LIST', location),
      new Hide(dbName, 4, 'x-grid-row', '', 'DB_MONITORING_SERVER_LIST', location),
      new Hide(dbName, 2, 'ads-home-list-item', '', 'AD_HOME_OVERVIEW', location, function (_, parentNode) {
        return parentNode.getAttribute('ng-click').includes('ViewDbServer')
      })
    ]
  }

  apply(node, key) {
    return this.helpers.reduce((acc, cmd) => {
      return acc || cmd.apply(node, key)
    }, false)
  }
}

export default HideDatabase
