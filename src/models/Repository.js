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

  getNames() {
    return Object.keys(this.configurations)
  }

  hasByName(name) {
    if (typeof this.configurations[name] === 'object') {
      return true
    }
    return false
  }
}

export default Repository
