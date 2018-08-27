import GitHub from 'github-api'

class Connector {
  constructor(credentials, configurations) {
    this.repos = credentials.repos
    this.gh = new GitHub({token: credentials.token})
  }

  upload(configurations) {
    return new Promise((resolve, reject) => {
      resolve([])
    })
  }

  download(configurations) {
    return Promise.all(this.repos.map((r) => {
      var [user, repoName] = (r.value.split('/'))

      var repo = this.gh.getRepo(user, repoName)

      return new Promise((resolve, reject) => {
        var result = []
        repo.getTree('master?recursive=true').then((response) => {
          if (response.data.tree) {
            var promises = response.data.tree.filter((element) => element.path.endsWith('.mnky')).map((element) => {
              return repo.getBlob(element.sha, (_, blob) => result.push({name: repoName + '/' + element.path.slice(0, -5), content: blob}))
            })
            Promise.all(promises).then((results) => {
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
    return Promise.all([this.upload(configurations), this.download()])
  }
}

export default Connector
