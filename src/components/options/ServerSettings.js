import React from 'react'
import PropTypes from 'prop-types'
import Popup from 'react-popup'
import axios from 'axios'
import moment from 'moment'
import { logger } from '../../helpers/logger'

class ServerSettings extends React.Component {
  static propTypes = {
    connectionState: PropTypes.string.isRequired,
    demoMonkeyServer: PropTypes.string.isRequired,
    onDownloadAll: PropTypes.func.isRequired,
    onSetDemoMonkeyServer: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)
    this.state = {
      remoteLocation: props.demoMonkeyServer || '',
      remoteLocationError: null,
      backups: null,
      groups: null,
      newGroupName: '',
      remoteAlias: null
    }
  }

  _getBackupUrl() {
    return this.state.remoteLocation.replace(/\/*$/, '') + '/backup'
  }

  _getGroupUrl() {
    return this.state.remoteLocation.replace(/\/*$/, '') + '/group'
  }

  _loadGroups() {
    if (this.props.connectionState.toLowerCase() === 'connected') {
      const url = this._getGroupUrl()
      axios({
        url,
        headers: {
          accept: 'text/json'
        }
      }).then(response => {
        if (response.status === 200 && Array.isArray(response.data)) {
          this.setState({
            groups: response.data
          })
        }
      }).catch(() => {
        this.setState({
          groups: null
        })
      })
    } else {
      this.setState({
        groups: null
      })
    }
  }

  _loadRemoteAlias() {
  }

  _loadBackups() {
    if (this.props.connectionState.toLowerCase() === 'connected') {
      const url = this._getBackupUrl()
      axios({
        url,
        headers: {
          accept: 'text/json'
        }
      }).then(response => {
        if (response.status === 200 && Array.isArray(response.data)) {
          this.setState({
            backups: response.data
          })
        }
      }).catch(() => {
        this.setState({
          backups: null
        })
      })
    } else {
      this.setState({
        backups: null
      })
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.demoMonkeyServer !== this.props.demoMonkeyServer || prevProps.connectionState !== this.props.connectionState) {
      this._loadBackups()
      this._loadGroups()
      this._loadRemoteAlias()
    }
  }

  componentDidMount() {
    this._loadBackups()
    this._loadGroups()
    this._loadRemoteAlias()
  }

  changeRemoteLocation(value) {
    this.setState({
      remoteLocation: value,
      remoteLocationError: null
    })
  }

  changeAlias(remoteAlias) {
    this.setState({
      remoteAlias
    })
  }

  reconnectRemoteLocation() {
    this.props.onSetDemoMonkeyServer('')
    this.props.onSetDemoMonkeyServer(this.state.remoteLocation)
  }

  clearRemoteLocation() {
    this.setState({
      remoteLocation: '',
      remoteLocationError: null
    })
    this.props.onSetDemoMonkeyServer('')
  }

  saveRemoteLocation() {
    const url = `${this.state.remoteLocation}/authenticated`
    if (this.state.remoteLocation.startsWith('http')) {
      axios({
        url
      }).then(response => {
        if (response.data.loggedIn === true) {
          this.props.onSetDemoMonkeyServer(this.state.remoteLocation)
        } else {
          const authUrl = `${this.state.remoteLocation}/auth/google`
          Popup.create({
            title: 'Please authenticate',
            content: <span>Before you can continue, you have to <a href={authUrl} target="_blank" rel="noopener noreferrer">authenticate</a>  with {this.state.remoteLocation}.</span>,
            buttons: {
              left: [{
                text: 'Cancel',
                action: () => Popup.close()
              }],
              right: [{
                text: 'Save',
                className: 'success',
                action: () => {
                  Popup.close()
                  this.saveRemoteLocation()
                }
              }]
            }
          })
        }
      }).catch(error => {
        logger('error', error).write()
        this.setState({
          remoteLocationError: error.toString()
        })
      })
    } else {
      this.setState({
        remoteLocationError: `${this.state.remoteLocation} is not a valid URL.`
      })
    }
  }

  _renderBackupList() {
    if (this.connectionState === 'unknown' || this.state.backups === null) {
      return ''
    }

    return <div>
      <h2>Backups</h2>
      <ul>
        {
          this.state.backups.slice(0, 5).map((backup, index) => {
            return (<li key={index}>
              <a href={`${this._getBackupUrl()}/${backup._id}.zip`}>{moment(backup.created_at).format('Y-MM-DD HH:mm:ss')}</a>
            </li>)
          })
        }
        <li>
          <a href={this._getBackupUrl()}>more...</a>
        </li>
      </ul>
    </div>
  }

  handleGroupNameChange(event) {
    this.setState({
      newGroupName: event.target.value
    })
  }

  addNewGroup(event) {
    if (this.state.newGroupName !== '') {
      const url = this._getGroupUrl()
      axios({
        url,
        method: 'POST',
        data: {
          name: this.state.newGroupName
        }
      }).then(response => {
        if (response.status === 200) {
          this._loadGroups()
        }
      }).catch((error) => {
        console.log(error)
      })
    }
    event.preventDefault()
  }

  _renderGroupList() {
    if (this.connectionState === 'unknown' || this.state.groups === null) {
      return ''
    }

    return <div>
      <h2>Groups</h2>
      <ul>
        {
          this.state.groups.map((group, index) => {
            return (<li key={index}>
              <a href={`${this._getGroupUrl()}/${group.gid}`} target="_blank" rel="noreferrer noopener">{group.name}</a> ({group.members.length})
            </li>)
          })
        }
        <li>
          <input type="text" value={this.state.newGroupName} onChange={(e) => this.handleGroupNameChange(e)} />
          <button onClick={(e) => this.addNewGroup(e)}>add</button>
        </li>
      </ul>
    </div>
  }

  render() {
    return <div>
      <label>
        Connect to a demo monkey server to sync your configurations across devices and backup your settings to the server.
        This is a beta feature. Before turning this feature on,
        <a href="#" onClick={(event) => this.props.onDownloadAll(event)}>backup all your configurations locally</a>.
      </label>
      <h2>Connection Details</h2>
      <b>Remote Location: </b>
      <input size="55" type="text" onChange={(e) => this.changeRemoteLocation(e.target.value)} value={this.state.remoteLocation} />
      <button className="save-button" onClick={() => this.saveRemoteLocation()}>Save</button>
      <button className="copy-button" onClick={() => this.clearRemoteLocation()}>Clear</button>
      <button className="delete-button" onClick={() => this.reconnectRemoteLocation()}>Reconnect</button>
      (Connection: <span className={`connection-status-${this.props.connectionState.toLowerCase()}`}>{this.props.connectionState}</span>)
      <div style={{ color: 'red' }}>{ this.state.remoteLocationError !== null ? this.state.remoteLocationError : ''}</div>
      <h2>User Details</h2>
      <div>
        <input size="55" type="text" onChange={(e) => this.changeAlias(e.target.value)} value={this.state.remoteAlias} />
        <button className="save-button" onClick={() => this.saveAlias()}>Save</button>
      </div>
      {this._renderBackupList()}
      {this._renderGroupList()}
    </div>
  }
}

export default ServerSettings
