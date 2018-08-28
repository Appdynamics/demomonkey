import GitHub from 'github-api'

class Connector {
  constructor(credentials, configurations) {
    this.repos = credentials.repos
    this.directoryStructure = credentials.directoryStructure
    this.gh = new GitHub({token: credentials.token})
  }

  _createName(user, repoName, element) {
    var file = element.path.slice(0, -5)
    var directory = this.directoryStructure.replace(/\$\{u\}/, user).replace(/\$\{r\}/, repoName)
    return directory + '/' + file
  }

  upload(configurations) {
    return new Promise((resolve, reject) => {
      resolve([])
    })
  }

  download() {
    return Promise.all(this.repos.map((r) => {
      var [user, repoName] = (r.value.split('/'))

      var repo = this.gh.getRepo(user, repoName)

      return new Promise((resolve, reject) => {
        var result = {}
        repo.getTree('master?recursive=true').then((response) => {
          if (response.data.tree) {
            var promises = response.data.tree.filter((element) => element.path.endsWith('.mnky')).map((element) => {
              var name = this._createName(user, repoName, element)
              return repo.getBlob(element.sha, (_, blob) => {
                result[name] = {
                  name: name,
                  content: blob,
                  connector: 'github',
                  readOnly: true,
                  remoteLocation: {
                    user: user,
                    repository: repoName,
                    path: element.path
                  }
                }
              })
            })
            Promise.all(promises).then(() => {
              resolve(result)
            })
          } else {
            reject(new Error('No tree found'))
          }
        })
      })
    }))
  }

  sync(configurations, download) {
    if (download) {
      return Promise.all([this.upload(configurations), this.download()])
    }
    return Promise.all([this.upload(configurations)])
  }
}

export default Connector
