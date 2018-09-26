import JSON5 from 'json5'

class Connector {
  upload(configurations) {
    return new Promise((resolve, reject) => {
      window.chrome.identity.getAuthToken({interactive: true}, (token) => {
        this._getConfigId(token, (id) => {
          this._uploadConfigurations(token, id, configurations, resolve, reject)
        }, (error) => {
          reject(error)
        })
      })
    })
  }

  _downloadConfigurations(token, id, resolve, reject) {
    // No config found, so no upload happened yet, we can skip the download
    if (id === null) {
      resolve(false)
    }
    this._request('drive/v3/files/' + id + '?alt=media', token, {}, (data) => {
      resolve(data)
    })
  }

  _uploadConfigurations(token, id, configurations, resolve, reject) {
    const boundary = '-------425260374469080434957'
    const delimiter = '\r\n--' + boundary + '\r\n'
    const closeDelim = '\r\n--' + boundary + '--'

    var metadata = {
      'name': 'config.json',
      'parents': ['appDataFolder'],
      'spaces': 'appDataFolder',
      'mimeType': 'application/json\r\n\r\n'
    }

    var fileId = ''

    if (id !== null) {
      fileId = '/' + id
      delete metadata.parents
    }

    fetch(
      'https://www.googleapis.com/upload/drive/v3/files' + fileId + '?uploadType=multipart',
      {
        method: id !== null ? 'PATCH' : 'POST',
        async: true,
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'multipart/related; boundary="' + boundary + '"'
        },
        'contentType': 'json',
        body: delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON5.stringify(metadata) +
        delimiter +
        'Content-Type: ' +
        'application/json\r\n\r\n' +
        JSON.stringify({uploaded_at: Date.now(), configurations}) +
        closeDelim
      })
      .then((response) => response.json())
      .then(function (data) {
        resolve(false)
      })
  }

  _request(path, token, options = {}, cb, text = false) {
    options = Object.assign({
      method: 'GET',
      async: true,
      headers: {
        Authorization: 'Bearer ' + token
      }
    }, options)
    fetch(
      'https://www.googleapis.com/' + path,
      options
    ).then((response) => {
      if (text) {
        return response.text()
      }
      return response.json()
    }).then(cb)
  }

  _getConfigId(token, cb, err) {
    this._request('drive/v3/files?spaces=appDataFolder', token, {}, (data) => {
      if (data.hasOwnProperty('error')) {
        // Case 1: Error
        return err(data.error)
      } else if (data.hasOwnProperty('files') && data.files.length > 0) {
        // Case 2: File exists
        var file = data.files.find((file) => {
          return file.name === 'config.json'
        })
        return cb(file.id)
      } else {
        // Case 3: Create id
        cb(null)
      }
    })
  }

  download(run) {
    if (!run) {
      return false
    }

    return new Promise((resolve, reject) => {
      window.chrome.identity.getAuthToken({interactive: true}, (token) => {
        this._getConfigId(token, (id) => {
          this._downloadConfigurations(token, id, resolve, reject)
        }, (error) => {
          reject(error)
        })
      })
    })
  }

  sync(store, withDownload) {
    var configurations = store.getState().configurations
    return Promise.all([this.download(withDownload), this.upload(configurations)]).then((results) => {
      console.log('GDrive processing: ', results)
      if (!Array.isArray(results[0])) {
        return false
      }

      var downloads = results[0]

      var result = false

      console.log(downloads.uploaded_at)

      downloads.configurations.forEach(download => {
        var existing = configurations.find(element => {
          return download.id === element.id
        })
        // Only sync unknown configurations that have not been deleted.
        if (typeof existing === 'undefined' && typeof download.deleted_at === 'undefined') {
          console.log('Adding', name)
          store.dispatch({ 'type': 'ADD_CONFIGURATION', configuration: download })
          result = true
        } else {
          // Only update configurations that have been updated remote more recently
          if (existing.updated_at <= download.updated_at) {
            existing = Object.assign(existing, download)
            console.log('Updating', name)
            store.dispatch({ 'type': 'SAVE_CONFIGURATION', id: existing.id, configuration: existing })
            result = true
          }
        }
      })

      return result
    })
  }
}

export default Connector
