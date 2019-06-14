import React from 'react'
import ToggleButton from 'react-toggle-button'
import PropTypes from 'prop-types'
import JSZip from 'jszip'
import AceEditor from 'react-ace'
import Popup from 'react-popup'
import axios from 'axios'

import 'brace/theme/textmate'
import 'brace/mode/ini'
import 'brace/ext/searchbox'

class Settings extends React.Component {
  static propTypes = {
    settings: PropTypes.object.isRequired,
    configurations: PropTypes.arrayOf(PropTypes.object).isRequired,
    connectionState: PropTypes.string.isRequired,
    onSetBaseTemplate: PropTypes.func.isRequired,
    onSetMonkeyInterval: PropTypes.func.isRequired,
    onSetDemoMonkeyServer: PropTypes.func.isRequired,
    onToggleOptionalFeature: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)
    this.state = {
      remoteLocation: props.settings.demoMonkeyServer || '',
      remoteLocationError: null
    }
    // this.props.settings.demoMonkeyServer
  }

  changeRemoteLocation(value) {
    console.log(value)
    this.setState({
      remoteLocation: value,
      remoteLocationError: null
    })
  }

  clearRemoteLocation() {
    this.setState({
      remoteLocation: '',
      remoteLocationError: null
    })
    this.props.onSetDemoMonkeyServer('')
  }

  saveRemoteLocation() {
    if (this.state.remoteLocation.startsWith('http')) {
      axios({
        url: `${this.state.remoteLocation}/authenticated`
      }).then(response => {
        if (response.data.loggedIn === true) {
          this.props.onSetDemoMonkeyServer(this.state.remoteLocation)
        } else {
          console.log('Authenticate')
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
        console.log(error)
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

  renderSync() {
    if (!this.props.settings.optionalFeatures.configSync) {
      return ''
    }

    const backupLocation = this.state.remoteLocation + '/backup'

    return <div><h2>Synchronization</h2>
      <b>Remote Location:</b>
      <input type="text" onChange={(e) => this.changeRemoteLocation(e.target.value)} value={this.state.remoteLocation} />
      <button className="save-button" onClick={() => this.saveRemoteLocation()}>Update</button>
      <button className="save-button" onClick={() => this.clearRemoteLocation()}>Clear</button>
      (Connection: {this.props.connectionState})
      <div style={{color: 'red'}}>{ this.state.remoteLocationError !== null ? this.state.remoteLocationError : ''}</div>
      { this.state.remoteLocation === '' ? ''
        : <p>Demo Monkey Server keeps backups of your configurations. You can find them at <a href={backupLocation} target="_blank" rel="noopener noreferrer">{backupLocation}</a></p>
      }
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
          <div className="toggle-group" id="toggle-undo">
            <ToggleButton onToggle={() => this.props.onToggleOptionalFeature('undo')} value={this.props.settings.optionalFeatures.undo}/><label><b>Undo replacements</b> when configuration is disabled</label>
          </div>
          <div className="toggle-group" id="toggle-autoReplace">
            <ToggleButton onToggle={() => this.props.onToggleOptionalFeature('autoReplace')} value={this.props.settings.optionalFeatures.autoReplace}/><label><b>Automatically apply replacements</b> when configuration is saved. <i>(This will also disable undo)</i></label>
          </div>
          <div className="toggle-group" id="toggle-autoSave">
            <ToggleButton onToggle={() => this.props.onToggleOptionalFeature('autoSave')} value={this.props.settings.optionalFeatures.autoSave}/><label><b>Save configuration on line break</b></label>
          </div>
          <div className="toggle-group" id="toggle-saveOnClose">
            <ToggleButton onToggle={() => this.props.onToggleOptionalFeature('saveOnClose')} value={this.props.settings.optionalFeatures.saveOnClose}/><label><b>Save configuration when it is closed</b></label>
          </div>
          <div className="toggle-group" id="toggle-adrumTracking">
            <ToggleButton onToggle={() => this.props.onToggleOptionalFeature('adrumTracking')} value={this.props.settings.optionalFeatures.adrumTracking}/><label><b>Allow browser monitoring.</b> DemoMonkey uses AppDynamics End-User Monitoring to analyze user behavior. You need to reload your browser window after changing this value!</label>
          </div>
          <div className="toggle-group" id="toggle-editorAutocomplete">
            <ToggleButton onToggle={() => this.props.onToggleOptionalFeature('editorAutocomplete')} value={this.props.settings.optionalFeatures.editorAutocomplete}/><label><b>Autocomplete.</b> The editor for configurations will display an auto completion for commands, options & imports.</label>
          </div>
          <div className="toggle-group" id="toggle-onlyShowAvailableConfigurations">
            <ToggleButton onToggle={() => this.props.onToggleOptionalFeature('onlyShowAvailableConfigurations')} value={this.props.settings.optionalFeatures.onlyShowAvailableConfigurations}/><label><b>Only show available configurations.</b> Set the default value for the popup toggle, which hides configurations that are not available for the current url.</label>
          </div>
          <div className="toggle-group" id="toggle-inDevTools">
            <ToggleButton onToggle={() => this.props.onToggleOptionalFeature('inDevTools')} value={this.props.settings.optionalFeatures.inDevTools}/><label><b>Integrate with Chrome Dev Tools.</b> Turn this option on to see the DemoMonkey dashboard within the Chrome Developer Toolbar.</label>
          </div>
          <div className="toggle-group" id="toggle-webRequestHook">
            <ToggleButton onToggle={() => this.props.onToggleOptionalFeature('webRequestHook')} value={this.props.settings.optionalFeatures.webRequestHook}/><label><b>Hook into Web Requests.</b> Turn this feature on, if you want to use the commands !delayUrl, !blockUrl and !redirectUrl. This will allow DemoMonkey to hook into web requests.</label>
          </div>
          <div className="toggle-group" id="toggle-debugBox">
            <ToggleButton onToggle={() => this.props.onToggleOptionalFeature('debugBox')} value={this.props.settings.optionalFeatures.debugBox}/><label><b>Debug Box.</b> Turn this feature on, to show a debug box with statistics when running demo monkey in <i>debug mode</i> </label>
          </div>
          <div className="toggle-group" id="toggle-configSync">
            <ToggleButton onToggle={() => this.props.onToggleOptionalFeature('configSync')} value={this.props.settings.optionalFeatures.configSync}/><label><b>Synchronize Configurations.</b> This this feature on, to synchronize your configurations with an instance of Demo Monkey Server.</label>
          </div>
          { this.renderSync() }
          <h2>Backup</h2>
          You can always open the <a href="backup.html">backup page</a> to download your files or manipulate your settings. Please use with caution!
          <button className="save-button" onClick={(event) => this.downloadAll(event)}>Download all configurations</button>
        </div>
      </div>
    )
  }
}

export default Settings
