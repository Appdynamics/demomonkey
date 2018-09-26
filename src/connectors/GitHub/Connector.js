import GitHub from 'github-api'

class Connector {
  constructor(credentials) {
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
      resolve(false)
    })
  }

  download(run) {
    if (!run) {
      return false
    }

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

  sync(store, withDownload) {
    var configurations = store.getState().configurations
    return Promise.all([this.download(withDownload), this.upload(configurations)]).then((results) => {
      console.log('Github processing: ', results)
      if (!results[0]) {
        return false
      }

      var downloads = results[0][0]

      var allExistings = configurations.filter(element => {
        return element.connector === 'github'
      })

      var keepIds = []
      var result = false

      if (typeof downloads !== 'undefined') {
        Object.keys(downloads).forEach(name => {
          var existing = allExistings.find(element => {
            return element.name === name
          })
          if (typeof existing === 'undefined') {
            console.log('Adding', name)
            store.dispatch({ 'type': 'ADD_CONFIGURATION', configuration: downloads[name] })
            result = true
          } else {
            if (existing.content !== downloads[name].content) {
              existing = Object.assign(existing, downloads[name])
              console.log('Updating', name)
              store.dispatch({ 'type': 'SAVE_CONFIGURATION', id: existing.id, configuration: existing })
              result = true
            }
            keepIds.push(existing.id)
          }
        })
      }

      allExistings.forEach(element => {
        if (!keepIds.includes(element.id)) {
          console.log('Removing', element.name)
          store.dispatch({ 'type': 'DELETE_CONFIGURATION', id: element.id })
          result = true
        }
      })
      return result
    })
  }
}

export default Connector
