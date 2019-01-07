import Configuration from './Configuration'

class Repository {
  constructor(configurations) {
    this.configurations = configurations
  }

  addConfiguration(name, configuration) {
    this.configurations[name] = configuration
  }

  findByName(name) {
    if (typeof this.configurations[name] === 'object') {
      return this.configurations[name]
    }
    return new Configuration('', null, false, {})
  }

  hasByName(name) {
    if (typeof this.configurations[name] === 'object') {
      return true
    }
    return false
  }
}

export default Repository
