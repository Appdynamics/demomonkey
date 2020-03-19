import axios from 'axios'

class ProtocolHandler {
  constructor(protocol, server) {
    this.protocol = protocol
    this.server = server
    console.log(server)
  }

  handle(search) {
    return new Promise((resolve, reject) => {
      const s = new URLSearchParams(search).get('s')
      if (typeof s !== 'string') {
        return resolve(false)
      }

      let url = new URL(s)
      if (url.protocol !== this.protocol) {
        reject(new Error(`Presented url '${url}' does not start with expected protocol ${this.protocol}`))
      }

      // Right now new URL with custom protocol puts everything into the pathname, so we fix this early
      url = new URL(url.href.replace(this.protocol, 'http:'))

      console.log(url.host)

      if (url.host === 'gist' || url.host === 'g') {
        const id = url.pathname.substr(1)
        return this._handleGist(id, resolve, reject)
      }

      if (url.host === 'sync' || url.host === 's') {
        const id = url.pathname.substr(1)
        console.log(id)
        return this._handleSyncServer(id, resolve, reject)
      }

      this._handleDefault(url, resolve, reject)
    })
  }

  _buildConfiguration(name, content) {
    if (content.includes('@author')) {
      const match = content.match(/@author(?:\[\])?\s*=\s*([^<\r\n]*)/)
      if (match[1]) {
        name = `Shared/from ${match[1]}`
      }
    }
    return {
      name,
      id: 'new',
      enabled: false,
      content
    }
  }

  _handleSyncServer(id, resolve, reject) {
    const url = this.server + '/s/' + id
    axios({ url }).then(response => {
      console.log(response)
      if (response.status === 200 && typeof response.data === 'object') {
        resolve(this._buildConfiguration(`Shared/${response.data.name}`, response.data.content))
      }
    }).catch(error => {
      error.message = `Could not handle ${url}, error was: ${error.message}`
      reject(error)
    })
  }

  _handleDefault(url, resolve, reject) {
    axios({ url }).then(response => {
      if (response.status === 200 && typeof response.data === 'string') {
        resolve(this._buildConfiguration(`Shared/${url.href}`, response.data))
      }
    }).catch(error => {
      error.message = `Could not handle ${url}, error was: ${error.message}`
      reject(error)
    })
  }

  _handleGist(id, resolve, reject) {
    const url = `https://gist.github.com/${id}/`
    axios({
      url
    }).then(response => {
      if (response.status === 200) {
        const url = response.request.responseURL + '/raw'
        axios({
          url
        }).then(response => {
          resolve(this._buildConfiguration(`Shared/${id}`, response.data))
        }).catch(error => {
          error.message = `Could not handle ${url}, error was: ${error.message}`
          reject(error)
        })
      }
    }).catch(error => {
      error.message = `Could not handle ${url}, error was: ${error.message}`
      reject(error)
    })
  }
}

export default ProtocolHandler
