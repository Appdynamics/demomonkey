import Configuration from './Configuration'

class Repository {
    constructor(configurations) {
      this.configurations = configurations
    }

    findByName(name) {
      if(typeof this.configurations[name] === "object") {
        return this.configurations[name];
      }
      return new Configuration('', null, false, {});
    }
}

export default Repository
