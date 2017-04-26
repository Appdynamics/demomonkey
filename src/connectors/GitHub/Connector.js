import GitHub from 'github-api'

class Connector {
  constructor(credentials, configurations) {
    this.gh = new GitHub({ token: credentials.token })
    this.lastUpdates = configurations.reduce((result, configuration) => {
      result[configuration.id] = configuration.updated_at
    }, {})
    console.log(this.lastUpdates)
  }

  sync(configurations) {
    configurations.slice(1, 2).forEach((item, index) => {
      console.log(item)
      var gist = this.gh.getGist()
      var files = {}
      files[item.name + '.mnky'] = { content: item.content }

      gist.create({
        public: false,
        description: item.name,
        files: files
      }).then(({data}) => {
        console.log(data.id)
      })
    })
  }
}

export default Connector
