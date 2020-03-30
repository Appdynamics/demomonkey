import React from 'react'
import PropTypes from 'prop-types'
import Popup from 'react-popup'
import axios from 'axios'
import moment from 'moment'
import { logger } from '../../../helpers/logger'
import DemoMonkeyServer from '../../../models/DemoMonkeyServer'

class ServerSettings extends React.Component {
  static propTypes = {
    demoMonkeyServer: PropTypes.instanceOf(DemoMonkeyServer).isRequired,
    onDownloadAll: PropTypes.func.isRequired,
    onSetDemoMonkeyServer: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)
    this.state = {
      remoteLocation: props.demoMonkeyServer.url || '',
      remoteLocationError: null,
      backups: null,
      groups: null,
      newGroupName: '',
      remoteAlias: ''
    }
  }

  _load() {
    this.setState({
      backups: null,
      groups: null
    })
    this.props.demoMonkeyServer.load(['backup', 'group', 'user']).then(result => {
      this.setState({
        backups: result[0],
        groups: result[1],
        remoteAlias: result[2].alias
      })
    }).catch(error => {
      console.log(error)
    })
  }

  componentDidUpdate(prevProps) {
    if (prevProps.demoMonkeyServer !== this.props.demoMonkeyServer || prevProps.demoMonkeyServer.isConnected() !== this.props.demoMonkeyServer.isConnected()) {
      this._load()
    }
  }

  componentDidMount() {
    this._load()
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
    if (this.state.backups === null) {
      return ''
    }

    const url = this.props.demoMonkeyServer.urlFor('backup')

    return <div>
      <h2>Backups</h2>
      <label>
        When connected DemoMonkey will send a backup to the server on a daily basis. <a href="#backupnow" onClick={(e) => this.backupNow(e)}>Backup now.</a>
      </label>
      <ul>
        {
          this.state.backups.map((backup, index) => {
            return (<li key={index}>
              <a href={`${url}/${backup._id}.zip`}>{moment(backup.created_at).format('Y-MM-DD HH:mm:ss')}</a>
            </li>)
          })
        }
        <li>
          <a href={url}>more...</a>
        </li>
      </ul>
    </div>
  }

  backupNow(e) {
    this.props.demoMonkeyServer.backupNow().then((backup) => {
      this.setState({
        backups: [backup].concat(this.state.backups)
      })
    }).catch(error => {
      console.log(error)
    })
    e.preventDefault()
  }

  handleGroupNameChange(event) {
    this.setState({
      newGroupName: event.target.value
    })
  }

  saveAlias(event) {
    this.props.demoMonkeyServer.saveAlias(this.state.remoteAlias).then((data) => {
      this.setState({
        remoteAlias: data.alias
      })
    }).catch(error => {
      console.log(error)
    })
  }

  addNewGroup(event) {
    this.props.demoMonkeyServer.addGroup(this.state.newGroupName).then((data) => {
      this.setState({
        groups: this.state.groups.concat([data])
      })
    }).catch(error => {
      console.log(error)
    })
  }

  deleteGroup(gid) {
    this.props.demoMonkeyServer.deleteGroup(gid).then((data) => {
      this.setState({
        groups: this.state.groups.filter(group => group.gid !== data.gid)
      })
    }).catch(error => {
      console.log(error)
    })
  }

  _renderGroupList() {
    if (this.state.groups === null) {
      return ''
    }

    const url = this.props.demoMonkeyServer.urlFor('j')

    return <div>
      <h2>Groups</h2>
      <ul>
        {
          this.state.groups.map((group, index) => {
            return (<li key={index}>
              <a href={`${url}/${group.gid}`} target="_blank" rel="noreferrer noopener">{group.name}</a> ({group.members.length})
              <button onClick={() => this.deleteGroup(group.gid)} className="delete-button">Delete</button>
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
    const connectionState = this.props.demoMonkeyServer.connectionState

    return <div>
      <h2>Connection Details</h2>
      <label>
        Connect to a demo monkey server to sync your configurations across devices and backup your settings to the server.
        This is a beta feature. Before turning this feature
        on, <a href="#" onClick={(event) => this.props.onDownloadAll(event)}>backup all your configurations locally</a>.
      </label>
      <b>Remote Location: </b>
      <input size="55" type="text" onChange={(e) => this.changeRemoteLocation(e.target.value)} value={this.state.remoteLocation} />
      <button className="save-button" onClick={() => this.saveRemoteLocation()}>Save</button>
      <button className="copy-button" onClick={() => this.clearRemoteLocation()}>Clear</button>
      <button className="delete-button" onClick={() => this.reconnectRemoteLocation()}>Reconnect</button>
      (Connection: <span className={`connection-status-${connectionState.toLowerCase()}`}>{connectionState}</span>)
      <div style={{ color: 'red' }}>{ this.state.remoteLocationError !== null ? this.state.remoteLocationError : ''}</div>
      <h2>User Details</h2>
      <label>Provide an alias name that will be displayed to other users when they search the gallery or are in the same group as you are:</label>
      <div>
        <b>Alias: </b>
        <input size="55" type="text" onChange={(e) => this.changeAlias(e.target.value)} value={this.state.remoteAlias} />
        <button className="save-button" onClick={() => this.saveAlias()}>Save</button>
      </div>
      {this._renderBackupList()}
      {this._renderGroupList()}
    </div>
  }
}

export default ServerSettings
