import axios from 'axios'

class ConfigurationSync {
  constructor(storage, actions, remoteUrl) {
    this.storage = storage
    this.actions = actions
    this.remoteUrl = remoteUrl
    this.started = false
    this.connected = false
    this.backuped_at = 0
  }

  getChanges(olds, news, addMarker = false) {
    return news.reduce((result, config, index) => {
      var old = (olds[index] && olds[index].id === config.id) ? olds[index] : olds.find(o => o.id === config.id)
      if (typeof old === 'undefined' || old.updated_at < config.updated_at) {
        if (addMarker) {
          config.changeType = typeof old === 'undefined' ? 'insert' : 'update'
        }
        result.push(config)
      }
      return result
    }, [])
  }

  changeListener(changes, namespace) {
    if (typeof changes.configurations !== 'undefined' && namespace === 'local') {
      var localUpdates = this.getChanges(changes.configurations.oldValue, changes.configurations.newValue)
      if (localUpdates.length > 0) {
        this.sendUpdates(localUpdates)
      }
    }
  }

  backup() {
    console.log('Trying to backup...')
    this.storage.local.get('configurations', (data) => {
      axios({
        url: `${this.remoteUrl}/backup`,
        method: 'POST',
        data: data.configurations}
      ).then(response => {
        console.log(response.data.created_at)
        this.backuped_at = response.data.created_at
      }).catch(error => console.log(error))
    })
  }

  heartbeat() {
    clearTimeout(this.heartbeatTimer)
    this.heartbeatTimer = setTimeout(() => this.reconnect('no heartbeat for 60 seconds'), 60000)
  }

  connect() {
    if (this.connected) {
      console.log('Please disconnect before connecting again.')
      return
    }
    console.log('Connecting')
    this.configStream = new EventSource(`${this.remoteUrl}/configuration`)

    this.configStream.onopen = () => {
      console.log('Connection to server opened.')
      this.connectionRetries = 0
      this.connected = true
      this.heartbeat()

      console.log(this.backuped_at, Date.now())
      if (this.backuped_at + 86400000 < Date.now()) {
        this.backup()
      }
    }

    this.configStream.addEventListener('heartbeat', (e) => {
      this.heartbeat()
    })

    this.configStream.onerror = (e) => {
      console.log(e)
      this.reconnect('an error occured')
    }

    this.configStream.addEventListener('list', (e) => {
      this.storage.local.get('configurations', (data) => {
        this.initialSync(data.configurations, JSON.parse(e.data))
      })
    })

    this.configStream.addEventListener('update', (e) => {
      const config = JSON.parse(e.data)
      this.actions.saveConfiguration(config.id, config)
    })

    this.configStream.addEventListener('insert', (e) => {
      const config = JSON.parse(e.data)
      this.actions.addConfiguration(config)
    })
  }

  sendUpdates(localUpdates) {
    axios({
      url: `${this.remoteUrl}/configuration`,
      method: 'POST',
      data: localUpdates}
    ).then(response => {
      console.log(response)
    }).catch(error => {
      console.log(error)
    })
  }

  initialSync(local, remote) {
    console.log('Running initial sync ...')
    const remoteUpdates = this.getChanges(local, remote, true)
    if (remoteUpdates.length > 0) {
      remoteUpdates.forEach((config) => {
        const changeType = config.changeType
        delete config.changeType
        if (changeType === 'update') {
          this.actions.saveConfiguration(config.id, config)
        } else {
          this.actions.addConfiguration(config)
        }
      })
    }
    const localUpdates = this.getChanges(remote, local)
    if (localUpdates.length > 0) {
      this.sendUpdates(localUpdates)
    }
  }

  start() {
    console.log('Starting to sync with ', this.remoteUrl)
    this.listener = (changes, namespace) => this.changeListener(changes, namespace)
    this.storage.onChanged.addListener(this.listener)

    this.connect()

    this.started = true
  }

  reconnect(reason) {
    this.disconnect()
    console.log('Trying to reconnect', reason)

    if (this.connectionRetries < 10) {
      setTimeout(() => this.connect(), (2 ** this.connectionRetries) * 100)
      this.connectionRetries++
    } else {
      console.log('Could not reach server after 10 retries, stopping.')
    }
  }

  disconnect() {
    if (this.configStream && typeof this.configStream.close === 'function') {
      this.configStream.close()
    }
    this.connected = false
    clearTimeout(this.heartbeatTimer)
  }

  stop() {
    if (this.started) {
      this.disconnect()
      this.storage.onChanged.removeListener(this.listener)
      this.started = false
    }
  }
}

export default ConfigurationSync
