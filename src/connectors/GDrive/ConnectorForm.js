/*
eslint no-template-curly-in-string: "off"
*/

import React from 'react'
import PropTypes from 'prop-types'

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
      isLoaded: false,
      token: null,
      status: 'unknown'
    }
  }

  connect(event) {
    event.preventDefault()
    window.chrome.identity.getAuthToken({interactive: true}, (token) => {
      this.updateStatus(token)
      this.props.onConnected({
        authorized: true
      })
    })
  }

  disconnect(event) {
    event.preventDefault()
    this.props.onDisconnected()
  }

  syncRemoteStorage(event) {
    event.preventDefault()
    this.props.onConnectionUpdated(this.props.credentials)
  }

  connectGDrive() {
    window.chrome.identity.getAuthToken({interactive: true}, function (token) {
      let init = {
        method: 'GET',
        async: true,
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        'contentType': 'json'
      }
      fetch(
        'https://www.googleapis.com/drive/v3/files?key=AIzaSyBCO8GUzvY2rW0iF2M2prG__gSaL7lsNXI&spaces=appDataFolder',
        init)
        .then((response) => response.json())
        .then(function (data) {
          console.log(data)
        })
    })
  }

  updateStatus(token) {
    this.setState({
      isLoaded: true,
      token: token,
      status: (typeof token === 'string') ? 'authorized' : 'not authorized'
    })
  }

  componentDidMount() {
    window.chrome.identity.getAuthToken({interactive: false}, (token) => {
      console.log(token)
      this.updateStatus(token)
    })
  }

  _renderConnect() {
    return <div>
      <h3>Connect with Google Drive</h3>
      <p>Click on the <b>Connect</b> button, to authorize DemoMonkey to write data into your Google Drive.</p>
      <button onClick={(event) => this.connect(event)} className="save-button">Connect</button>
    </div>
  }

  _renderDisconnect() {
    return <div>
      <h3>Connect with Google Drive</h3>
      <p>Click on the <b>Disconnect</b> button, to disable Google Drive Sync.</p>
      <button onClick={(event) => this.disconnect(event)} className="delete-button">Disconnect</button>
      <button onClick={(event) => this.syncRemoteStorage(event)} className="save-button">Sync now</button>
      <p>
        Note, that this will only disable the functionality. You have to
        visit <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">https://myaccount.google.com/permissions</a> to
        revoke access for DemoMonkey.
      </p>
    </div>
  }

  render() {
    if (!this.props.visible) {
      return false
    }

    if (!this.state.isLoaded) {
      return <p>Loading...</p>
    }

    if (this.props.credentials && this.state.status === 'authorized' && this.props.credentials.authorized) {
      return this._renderDisconnect()
    }

    return this._renderConnect()
  }
}

export default ConnectorForm
