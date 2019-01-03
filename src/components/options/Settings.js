import React from 'react'
import ToggleButton from 'react-toggle-button'
import PropTypes from 'prop-types'
import JSZip from 'jszip'
import AceEditor from 'react-ace'

import 'brace/theme/textmate'
import 'brace/mode/ini'
import 'brace/ext/searchbox'

class Settings extends React.Component {
  static propTypes = {
    settings: PropTypes.object.isRequired,
    configurations: PropTypes.arrayOf(PropTypes.object).isRequired,
    onSetBaseTemplate: PropTypes.func.isRequired,
    onSetMonkeyInterval: PropTypes.func.isRequired,
    onToggleOptionalFeature: PropTypes.func.isRequired,
    onConnected: PropTypes.func.isRequired,
    onDisconnected: PropTypes.func.isRequired
  }

  constructor(props) {
    super()
    this.state = {
      connections: props.settings.remoteConnections.concat({label: '', url: '', key: false})
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.settings.remoteConnections.length + 1 !== prevState.connections.length) {
      return {
        connections: nextProps.settings.remoteConnections.concat({label: '', url: '', key: false})
      }
    }
    return null
  }

  downloadAll() {
    event.preventDefault()
    var zip = new JSZip()

    this.props.configurations.forEach((configuration) => {
      zip.file(configuration.name + '.mnky', configuration.content)
    })

    zip.generateAsync({ type: 'base64' })
      .then(function (content) {
        window.chrome.downloads.download({
          url: 'data:application/zip;base64,' + content,
          filename: 'demomonkey-' + (new Date()).toISOString().split('T')[0] + '.zip' // Optional
        })
      })
  }

  _handleConnectionUpdate(id, property, newValue) {
    var connections = this.state.connections
    connections[id][property] = newValue
    connections[id].saved = false
    this.setState(connections)
  }

  _saveConnection(key) {
    var connection = this.state.connections[key]
    this.props.onConnected({
      key: connection.key,
      label: connection.label,
      url: connection.url
    })
  }

  _deleteConnection(key) {
    this.props.onDisconnected(key)
  }

  _renderConnectionRow(connection, id) {
    return <tr key={id}>
      <td>
        <input onChange={(e) => this._handleConnectionUpdate(id, 'url', e.target.value)} value={connection.url} style={{width: '300px'}} />
      </td>
      <td>
        <input onChange={(e) => this._handleConnectionUpdate(id, 'label', e.target.value)} value={connection.label} style={{width: '100px'}} />
      </td>
      <td>
        <button onClick={(e) => this._saveConnection(id)}>Save</button>
        <button style={{ display: connection.key === false ? 'none' : 'inherit' }} onClick={(e) => this._deleteConnection(connection.key)}>Delete</button>
      </td>
    </tr>
  }

  _renderSynchronizationSettings() {
    const connections = this.state.connections

    console.log('rendering')

    return <div><h2>Synchronization</h2>
      <p>
        You can synchronize multiple instances of DemoMonkey using a remote <a href="http://couchdb.apache.org/" target="_blank" rel="noopener noreferrer">CouchDB</a>.
        Each database you provide can have a label, that can be selected on the configuration editor for storing configurations in different locations. Use this, if you
        have private and shared databases.
      </p>
      <table>
        <thead>
          <tr>
            <th>URL</th>
            <th>Label</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {
            connections.map((connection, id) => this._renderConnectionRow(connection, id))
          }
        </tbody>
      </table>
    </div>
  }

  render() {
    return (
      <div className="content">
        <div className="settings">
          <h1>Settings</h1>
          <h2>Base Template</h2>
          <div className="template-box">
            <label htmlFor="template">New configuration template (will auto-save):</label>
            <AceEditor height="200px" width="100%"
              minLines={20}
              theme="textmate"
              mode="mnky"
              value={this.props.settings.baseTemplate}
              name="template"
              editorProps={{$blockScrolling: true}}
              onChange={this.props.onSetBaseTemplate} />
          </div>
          <h2>{'Monkey\'s Behavior'}</h2>
          <b>Update interval:</b> <input type="text" value={this.props.settings.monkeyInterval} onChange={this.props.onSetMonkeyInterval} />
          <h2>Optional Features</h2>
          <div className="toggle-group">
            <ToggleButton onToggle={() => this.props.onToggleOptionalFeature('undo')} value={this.props.settings.optionalFeatures.undo}/><label><b>Undo replacements</b> when configuration is disabled</label>
          </div>
          <div className="toggle-group">
            <ToggleButton onToggle={() => this.props.onToggleOptionalFeature('autoReplace')} value={this.props.settings.optionalFeatures.autoReplace}/><label><b>Automatically apply replacements</b> when configuration is saved. <i>(This will also disable undo)</i></label>
          </div>
          <div className="toggle-group">
            <ToggleButton onToggle={() => this.props.onToggleOptionalFeature('autoSave')} value={this.props.settings.optionalFeatures.autoSave}/><label><b>Save configuration on line break</b></label>
          </div>
          <div className="toggle-group">
            <ToggleButton onToggle={() => this.props.onToggleOptionalFeature('saveOnClose')} value={this.props.settings.optionalFeatures.saveOnClose}/><label><b>Save configuration when it is closed</b></label>
          </div>
          <div className="toggle-group">
            <ToggleButton onToggle={() => this.props.onToggleOptionalFeature('adrumTracking')} value={this.props.settings.optionalFeatures.adrumTracking}/><label><b>Allow browser monitoring.</b> DemoMonkey uses AppDynamics End-User Monitoring to analyze user behavior. You need to reload your browser window after changing this value!</label>
          </div>
          <div className="toggle-group">
            <ToggleButton onToggle={() => this.props.onToggleOptionalFeature('editorAutocomplete')} value={this.props.settings.optionalFeatures.editorAutocomplete}/><label><b>Autocomplete on existing words.</b> The editor for configurations will display an auto completion providing words that are already existing within your configuration.</label>
          </div>
          <div className="toggle-group">
            <ToggleButton onToggle={() => this.props.onToggleOptionalFeature('onlyShowAvailableConfigurations')} value={this.props.settings.optionalFeatures.onlyShowAvailableConfigurations}/><label><b>Only show available configurations.</b> Set the default value for the popup toggle, which hides configurations that are not available for the current url.</label>
          </div>
          <div className="toggle-group">
            <ToggleButton onToggle={() => this.props.onToggleOptionalFeature('inDevTools')} value={this.props.settings.optionalFeatures.inDevTools}/><label><b>Integrate with Chrome Dev Tools.</b> Turn this option on to see the DemoMonkey dashboard within the Chrome Developer Toolbar.</label>
          </div>
          { this._renderSynchronizationSettings() }
          <h2>Backup</h2>
          You can always open the <a href="backup.html">backup page</a> to download your files or manipulate your settings. Please use with caution!
          <button className="save-button" onClick={(event) => this.downloadAll(event)}>Download all configurations</button>
        </div>
      </div>
    )
  }
}

export default Settings
