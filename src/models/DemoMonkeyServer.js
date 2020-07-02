/* global chrome */
import axios from 'axios'

/*
 * TODO: This class and ConfigurationSync share some functionality, would it make sense to merge them?
 */
class DemoMonkeyServer {
  constructor(url, connectionState) {
    this.url = url.replace(/\/*$/, '')
    this.connectionState = connectionState
  }

  isConnected() {
    return this.connectionState.toLowerCase() === 'connected'
  }

  urlFor(what) {
    return this.url + '/' + what
  }

  deleteGroup(gid) {
    return new Promise((resolve, reject) => {
      axios({
        url: this.urlFor('group') + '/' + gid,
        method: 'DELETE'
      }).then(response => {
        if (response.status === 200) {
          return resolve(response.data)
        }
        return reject(new Error(`Response status code was ${response.status}`))
      }).catch((error) => {
        return reject(error)
      })
    })
  }

  backupNow() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get('configurations', (data) => {
        axios({
          url: this.urlFor('backup'),
          method: 'POST',
          data: data.configurations
        }).then(response => {
          if (response.status === 200) {
            return resolve(response.data)
          }
          return reject(new Error(`Response status code was ${response.status}`))
        }).catch(error => {
          reject(error)
        })
      })
    })
  }

  saveAlias(alias) {
    return new Promise((resolve, reject) => {
      if (alias === '') {
        return reject(new Error('Alias is empty'))
      }
      axios({
        url: this.urlFor('user'),
        method: 'POST',
        data: {
          alias
        }
      }).then(response => {
        if (response.status === 200) {
          return resolve(response.data)
        }
        return reject(new Error(`Response status code was ${response.status}`))
      }).catch((error) => {
        return reject(error)
      })
    })
  }

  addGroup(name) {
    return new Promise((resolve, reject) => {
      if (name === '') {
        return reject(new Error('Group name is empty'))
      }
      axios({
        url: this.urlFor('group'),
        method: 'POST',
        data: {
          name
        }
      }).then(response => {
        if (response.status === 200) {
          return resolve(response.data)
        }
        return reject(new Error(`Response status code was ${response.status}`))
      }).catch((error) => {
        return reject(error)
      })
    })
  }

  load(what) {
    if (Array.isArray(what)) {
      return Promise.all(what.map(w => this.load(w)))
    }
    return new Promise((resolve, reject) => {
      if (!this.isConnected()) {
        return reject(new Error('Not connected'))
      }
      axios({
        url: this.urlFor(what),
        headers: {
          accept: 'text/json'
        }
      }).then(response => {
        if (response.status === 200 && response.data) {
          return resolve(response.data)
        }
        return reject(new Error(`Response status code was ${response.status}`))
      }).catch((error) => {
        return reject(error)
      })
    })
  }
}

export default DemoMonkeyServer
