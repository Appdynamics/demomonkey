import GitHubConnector from '../connectors/GitHub/Connector'
import GDriveConnector from '../connectors/GDrive/Connector'

class Settings {
  constructor(settings) {
    this.baseTemplate = typeof settings.baseTemplate === 'string' ? settings.baseTemplate : ''
    this.optionalFeatures = typeof settings.optionalFeatures === 'object' ? settings.optionalFeatures : {}
    this.connectors = typeof settings.connectors === 'object' ? settings.connectors : {}
    this.monkeyInterval = typeof settings.monkeyInterval === 'number' ? settings.monkeyInterval : parseInt(settings.monkeyInterval)
  }

  isFeatureEnabled(featureName) {
    return typeof this.optionalFeatures[featureName] !== 'undefined' && this.optionalFeatures[featureName] === true
  }

  isConnectedWith(name) {
    return typeof this.connectors[name] !== 'undefined'
  }

  getConnectorCredentials(name) {
    if (this.isConnectedWith(name)) {
      return this.connectors[name]
    }
    return {}
  }

  getConnector(name) {
    if (name === 'github') {
      return new GitHubConnector(this.getConnectorCredentials(name))
    }
    if (name === 'gdrive') {
      return new GDriveConnector(this.getConnectorCredentials(name))
    }
    return {
      sync: () => {
        return false
      }
    }
  }
}

export default Settings
