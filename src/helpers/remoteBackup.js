// this.gapi.client.drive.files.list({ q: 'properties has { key="dmid" and value="ab315878-0a9f-4a90-82b2-070f5052fef7" }' }).then(console.log)

import { logger } from './logger'
class RemoteStorage {
  constructor(scope, gapi, store, rootFolderName, apiKey) {
    this.scope = scope
    this.gapi = gapi
    this.store = store
    this.rootFolderName = rootFolderName
    this.apiKey = apiKey
  }

  authenticate() {
    return new Promise((resolve, reject) => {
      this.gapi.load('client:auth2', () => {
        this.scope.chrome.identity.getAuthToken({ interactive: true }, function (token) {
          this.gapi.auth.setToken({
            access_token: token
          })
          resolve()
        })
      })
    })
  }

  /*
  createFolder(name, parent) {
    return new Promise((resolve, reject) => {
      this.gapi.client.drive.files.create({
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [
          parent
        ]
      }, (err, file) => {
        if (err) {
          reject(err)
        } else {
          resolve(file)
        }
      })
    })
  }
  */

  getRootFolder() {
    return new Promise((resolve, reject) => {
      this.gapi.client.drive.files.list({
        q: `mimeType = "application/vnd.google-apps.folder" and name="${this.rootFolderName}"`
      }).then(response => {
        if (response.status !== 200 || response.result.files.length < 1) {
          reject(new Error(`Could not find root folder for Backup at ${this.rootFolderName}`))
        }
        const folder = response.result.files[0].id
        resolve(folder)
      }).catch(error => {
        reject(error)
      })
    })
  }

  createRequestFromConfiguration(folder, configuration, monkeyID) {
    const boundary = '-------218561905198132535618'
    const delimiter = '\r\n--' + boundary + '\r\n'
    const closeDelimiter = '\r\n--' + boundary + '--'
    const mimeType = 'text/plain'

    const metadata = configuration.file_id
      ? {
          name: `${configuration.name}.mnky`,
          modifiedTime: new Date(configuration.updated_at).toISOString(),
          properties: {
            dmid: configuration.id,
            demoMonkey: '1',
            monkeyID
          }
        }
      : {
          name: `${configuration.name}.mnky`,
          mimeType,
          createdTime: new Date(configuration.created_at).toISOString(),
          modifiedTime: new Date(configuration.updated_at).toISOString(),
          trashed: typeof configuration.deleted_at === 'number',
          properties: {
            dmid: configuration.id,
            demoMonkey: '1',
            monkeyID
          },
          parents: [
            folder
          ]
        }

    const multipartRequestBody = delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: ' + mimeType + '\r\n\r\n' +
      configuration.content +
      closeDelimiter

    return this.gapi.client.request({
      path: '/upload/drive/v3/files/' + (configuration.file_id ? configuration.file_id : ''),
      method: configuration.file_id ? 'PATCH' : 'POST',
      params: {
        uploadType: 'multipart'
      },
      headers: {
        'Content-Type': 'multipart/related; boundary="' + boundary + '"'
      },
      body: multipartRequestBody
    })
  }

  backup() {
    logger('info', 'Starting to Synchronize').write()
    this.authenticate().then(() => {
      this.getRootFolder().then(folder => {
        const requests = this.store.getState().configurations.reduce((result, configuration) => {
          if (configuration.deleted_at && typeof configuration.file_id === 'undefined') {
            return result
          }
          result.push({
            request: this.createRequestFromConfiguration(folder, configuration, this.store.getState().monkeyID),
            configuration
          })
          return result
        }, [])

        const errors = []

        const run = (counter) => {
          if (counter >= requests.length) {
            return
          }
          const { request, configuration } = requests[counter]
          request.execute((result) => {
            // we got a 404
            if (!result) {
              configuration.file_id = undefined
              this.store.dispatch({ type: 'SAVE_CONFIGURATION', id: configuration.id, configuration })
            }
            if (result.error) {
              errors.push(result)
              logger('error', result.message).write()
            }
            if (result.kind && result.id) {
              logger('debug', `Successfully synced ${configuration.id} to ${result.id}`).write()
              configuration.file_id = result.id
              this.store.dispatch({ type: 'SAVE_CONFIGURATION', id: configuration.id, configuration })
            }
            // console.log(result) // error or file
            run(counter + 1)
          })
        }
        run(0)
      }).catch(error => {
        logger('error', error).write()
      })
    })
  }
}

function remoteBackup (scope, gapi, store) {
  const remoteStorage = new RemoteStorage(
    scope,
    gapi,
    store,
    'Demo Monkey Backup',
    '<API_KEY>'
  )
  remoteStorage.backup()
}

export default remoteBackup
