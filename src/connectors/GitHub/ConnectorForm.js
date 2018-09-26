/*
eslint no-template-curly-in-string: "off"
*/

import React from 'react'
import axios from 'axios'
import Popup from 'react-popup'
import PropTypes from 'prop-types'
import RepoList from './RepoList'
import GitHub from 'github-api'

class ConnectorForm extends React.Component {
  static propTypes = {
    onConnected: PropTypes.func.isRequired,
    onDisconnected: PropTypes.func.isRequired,
    onConnectionUpdated: PropTypes.func.isRequired,
    credentials: PropTypes.object,
    visible: PropTypes.bool.isRequired
  }

  constructor(props) {
    super(props)
    this.state = {
      username: '',
      password: '',
      otp: '',
      isLoaded: false,
      repos: {},
      tokenDescription: 'Demo Monkey ' + Date.now()
    }
  }

  handleChange(key, event) {
    event.preventDefault()
    var newState = this.state
    newState[key] = event.target.value
    this.setState(newState)
  }

  updateRepositories(selectedRepositories) {
    var credentials = this.props.credentials
    credentials.repos = selectedRepositories
    this.props.onConnectionUpdated(credentials)
  }

  updateDirectoryStructure(directoryStructure) {
    var credentials = this.props.credentials
    credentials.directoryStructure = directoryStructure
    this.props.onConnectionUpdated(credentials)
  }

  syncRemoteStorage(event) {
    event.preventDefault()
    this.props.onConnectionUpdated(this.props.credentials)
  }

  connect(event) {
    event.preventDefault()

    axios({
      url: 'https://api.github.com/authorizations',
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'X-GitHub-OTP': this.state.otp
      },
      data: {
        'scopes': ['repo', 'gist'],
        'note': this.state.tokenDescription
      },
      auth: { username: this.state.username, password: this.state.password }
    }).then((response) => {
      this.props.onConnected({
        id: response.data.id,
        token: response.data.token,
        description: response.data.note,
        created_at: response.data.created_at,
        updated_at: response.data.updated_at,
        scopes: response.data.scopes,
        repos: [],
        directoryStructure: '${u}/${r}'
      })
    }).catch((error) => {
      Popup.create({
        title: error.response.status + ' ' + error.response.statusText,
        className: 'error',
        content: 'Could not create access token, because an error occurred: ' + error.response.data.message,
        buttons: {
          right: [{
            text: 'Ok',
            className: 'danger',
            action: () => {
              Popup.close()
            }
          }]
        }
      })
    })
  }

  disconnect(event) {
    event.preventDefault()
    this.props.onDisconnected()
  }

  _renderConnectForm() {
    return <div>
      <h3>Connect with GitHub</h3>
      <p>
        Please provide your username and password to connect with GitHub.
        This will create a <a href="https://github.com/settings/tokens">
        personal access token</a> with scope <i>repo</i>.
        So neither your password, nor your username are stored locally.
        You can revoce the access token any time.
      </p>
      <div className="input-row">
        <label>Username</label>
        <input type="text" onChange={(event) => this.handleChange('username', event)} placeholder="username" />
      </div>
      <div className="input-row">
        <label>Password</label>
        <input type="password" onChange={(event) => this.handleChange('password', event)} placeholder="password" />
      </div>
      <div className="input-row">
        <label>One Time Password</label>
        <input type="text" onChange={(event) => this.handleChange('otp', event)} placeholder="OTP" />
        <div className="help">Required, if you have activated 2-factor authentication</div>
      </div>
      <div className="input-row">
        <label>Token description</label>
        <input type="text" value={this.state.tokenDescription} onChange={(event) => this.handleChange('tokenDescription', event)} placeholder="OTP" />
        <div className="help">Please make sure, that this description is unique or you will get a validation error.</div>
      </div>
      <div>
        <button onClick={(event) => this.connect(event)} className="save-button">Connect</button>
      </div>
    </div>
  }

  _renderRepoList() {
    if (this.state.isLoaded) {
      return <div>
        <label>Directory Structure</label>
        <div className="input-row">
          <input type="text" value={this.props.credentials.directoryStructure} onChange={(event) => this.updateDirectoryStructure(event.target.value)} />
          <div className="help">All configurations loaded from github will be put within the given structure. {'Use ${r} for the repository name and ${u} for the github user/organization name'} </div>
        </div>
        <div>
          <label>Selected Repositories</label>
          <RepoList
            repositories={this.state.repos}
            selected={this.props.credentials.repos}
            onSelect={(selectedRepositories) => this.updateRepositories(selectedRepositories)} />
        </div>
      </div>
    }
    return <div>loading...</div>
  }

  _renderDisconnectButton() {
    return <div>
      <h3>Connect with GitHub</h3>
      <p>
        You are already connected with GitHub using the access token <a
          href={'https://github.com/settings/tokens/' + this.props.credentials.id}
          target="_blank" rel='noopener noreferrer'>
          {this.props.credentials.description}
        </a>. Please choose the repositories, which can be used to store/retrieve configurations:
      </p>
      <div>
        { this._renderRepoList() }
      </div>
      <button onClick={(event) => this.disconnect(event)} className="delete-button">Disconnect</button>
      <button onClick={(event) => this.syncRemoteStorage(event)} className="save-button">Sync now</button>
    </div>
  }

  _hasCredentials() {
    return typeof this.props.credentials === 'object' && typeof this.props.credentials.token === 'string'
  }

  componentDidMount() {
    if (this._hasCredentials()) {
      var gh = new GitHub({ token: this.props.credentials.token })
      var ghUser = gh.getUser()

      ghUser.listRepos((err, repos) => {
        if (err) {
          return
        }
        this.setState({
          isLoaded: true,
          repos: repos.map(function (repo) {
            return {
              value: repo.full_name,
              label: repo.full_name
            }
          })
        })
      })
    }
  }

  render() {
    if (!this.props.visible) {
      return false
    }

    if (this._hasCredentials()) {
      return this._renderDisconnectButton()
    }
    return this._renderConnectForm()
  }
}

export default ConnectorForm
