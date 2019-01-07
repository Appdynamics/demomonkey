import React from 'react'
import PropTypes from 'prop-types'
import PouchDB from 'pouchdb'
import Popup from 'react-popup'
import Connection from './Connection'

class Synchronization extends React.Component {
  static propTypes = {
    remoteConnections: PropTypes.arrayOf(PropTypes.object).isRequired,
    onConnected: PropTypes.func.isRequired,
    onDisconnected: PropTypes.func.isRequired
  }

  _saveConnection(key, url, label) {
    return new Promise((resolve, reject) => {
      var connection = this.props.remoteConnections.find(c => c.key === key)
      if (connection) {
        connection.url = url
        connection.label = label
      } else {
        connection = {url, label, key: false}
      }

      var testDb = new PouchDB(connection.url)

      testDb.info((error, info) => {
        if (error) {
          console.log(error)
          Popup.create({
            title: 'An error occurred',
            content: <span>The following error occurred, while connecting to the remote database: <b>{error.toString()}</b>!</span>,
            buttons: {
              left: [{
                text: 'Go back',
                action: () => {
                  Popup.close()
                  resolve(false)
                }
              }],
              right: [{
                text: 'Ignore & Save',
                className: 'danger',
                action: () => {
                  Popup.close()
                  this.props.onConnected({
                    key: connection.key,
                    label: connection.label,
                    url: connection.url
                  })
                  resolve(true)
                }
              }]
            }
          })
        } else {
          this.props.onConnected({
            key: connection.key,
            label: connection.label,
            url: connection.url
          })
          resolve(true)
        }
      })

      testDb.close(() => console.log('Closed...'))
    })
  }

  _deleteConnection(key) {
    this.props.onDisconnected(key)
  }

  render() {
    return <div><h2>Synchronization</h2>
      <p>
        You can synchronize multiple instances of DemoMonkey using a remote <a href="http://couchdb.apache.org/" target="_blank" rel="noopener noreferrer">CouchDB</a>.
        Each database you provide can have a directory, that can be selected on the configuration editor for storing configurations in different locations. Use this, if you
        have private and shared databases, e.g. everything in <i>team/</i> will be stored in a team database. Leave the directory empty to sync all configurations.
      </p>
      <table>
        <thead>
          <tr>
            <th>URL</th>
            <th>Directory</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {
            this.props.remoteConnections.map((connection) => {
              return <Connection
                key={connection.key}
                connection={connection}
                deleteConnection={() => this._deleteConnection(connection.key)}
                saveConnection={(url, label) => this._saveConnection(connection.key, url, label)} />
            })
          }
          <Connection connection={{label: '', url: ''}} saveConnection={(url, label) => this._saveConnection(false, url, label)} />
        </tbody>
      </table>
    </div>
  }
}

export default Synchronization
