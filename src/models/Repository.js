class Repository {
    constructor(configurations) {
      this.configurations = configurations
    }

    findByName(name) {
      return this.configurations[name];
    }
}

export default Repository
