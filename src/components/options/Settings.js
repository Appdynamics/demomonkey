import React from 'react'
import ToggleButton from 'react-toggle-button'
import PropTypes from 'prop-types'
import AceEditor from 'react-ace'
import Popup from 'react-popup'
import axios from 'axios'
import { logger } from '../../helpers/logger'

import 'brace/theme/xcode'
import 'brace/theme/merbivore'
import 'brace/ext/searchbox'

import './editor/ace/mnky'

class Settings extends React.Component {
  static propTypes = {
    settings: PropTypes.object.isRequired,
    configurations: PropTypes.arrayOf(PropTypes.object).isRequired,
    connectionState: PropTypes.string.isRequired,
    onSetBaseTemplate: PropTypes.func.isRequired,
    onSetMonkeyInterval: PropTypes.func.isRequired,
    onSetDemoMonkeyServer: PropTypes.func.isRequired,
    onToggleOptionalFeature: PropTypes.func.isRequired,
    onDownloadAll: PropTypes.func.isRequired,
    isDarkMode: PropTypes.bool.isRequired,
    hasExtendedPermissions: PropTypes.bool.isRequired,
    onRequestExtendedPermissions: PropTypes.func.isRequired
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
    this.setState({
      remoteLocation: value,
      remoteLocationError: null
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
    if (this.state.remoteLocation.startsWith('http')) {
      axios({
        url: `${this.state.remoteLocation}/authenticated`
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

  renderSyncToggle() {
    if (!this.props.settings.optionalFeatures.beta_configSync) {
      return ''
    }
    return <div className="toggle-group" id="toggle-configSync">
      <ToggleButton onToggle={() => this.props.onToggleOptionalFeature('configSync')} value={this.props.settings.optionalFeatures.configSync}/><label><b>Synchronize Configurations.</b> This this feature on, to synchronize your configurations with an instance of Demo Monkey Server.</label>
    </div>
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
      <button className="delete-button" onClick={() => this.reconnectRemoteLocation()}>Reconnect</button>
      (Connection: <span className={`connection-status-${this.props.connectionState.toLowerCase()}`}>{this.props.connectionState}</span>)
      <div style={{ color: 'red' }}>{ this.state.remoteLocationError !== null ? this.state.remoteLocationError : ''}</div>
      { !backupLocation.startsWith('http') ? ''
        : <p>Demo Monkey Server keeps backups of your configurations. You can find them at <a href={backupLocation} target="_blank" rel="noopener noreferrer">{backupLocation}</a></p>
      }
    </div>
  }

  render() {
    console.log(this.props.hasExtendedPermissions)
    return (
      <div className="content">
        <div className="settings">
          <h1>Settings</h1>
          <h2>Base Template</h2>
          <div className="template-box">
            <label htmlFor="template">New configuration template (will auto-save):</label>
            <AceEditor height="200px" width="100%"
              minLines={20}
              theme={ this.props.isDarkMode ? 'merbivore' : 'xcode' }
              mode="mnky"
              value={this.props.settings.baseTemplate}
              name="template"
              editorProps={{ $blockScrolling: true }}
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
            <ToggleButton onToggle={() => this.props.onToggleOptionalFeature('debugBox')} value={this.props.settings.optionalFeatures.debugBox}/><label><b>Expand Debug Box</b> Turn this feature on, to show the debug box with statistics in full length when running demo monkey in <i>debug mode</i> </label>
          </div>
          <div className="toggle-group" id="toggle-keyboardHandlerVim">
            <ToggleButton onToggle={() => this.props.onToggleOptionalFeature('keyboardHandlerVim')} value={this.props.settings.optionalFeatures.keyboardHandlerVim}/><label><b>VIM Keyboard Handler.</b> Turn this feature on, to use the vim keyboard handler for the editor.</label>
          </div>
          <div className="toggle-group" id="toggle-withEvalCommand">
            <ToggleButton onToggle={() => this.props.onToggleOptionalFeature('withEvalCommand')} value={this.props.settings.optionalFeatures.withEvalCommand}/><label><b>Allow !eval.</b> By turning on this flag, you can use the command !eval which allows you to write arbitrary javascript code. Use with caution!</label>
          </div>
          <div className="toggle-group" id="toggle-hookIntoAjax">
            <ToggleButton onToggle={() => this.props.onToggleOptionalFeature('hookIntoAjax')} value={this.props.settings.optionalFeatures.hookIntoAjax}/><label><b>Hook into Ajax.</b> Turn this feature on, if you want to use commands !removeFlowmapNode, !addFlowmapNode, etc. Those commands are implemented by hooking into ajax calls, use with caution!</label>
          </div>
          <div className="toggle-group" id="toggle-syncDarkMode">
            <ToggleButton onToggle={() => this.props.onToggleOptionalFeature('syncDarkMode')} value={this.props.settings.optionalFeatures.syncDarkMode}/><label><b>Sync Dark/Light mode with OS setting.</b> Automatically switch between dark and light mode.</label>
          </div>
          <div className="toggle-group" id="toggle-preferDarkMode" style={{ display: this.props.settings.optionalFeatures.syncDarkMode ? 'none' : 'flex' }}>
            <ToggleButton onToggle={() => this.props.onToggleOptionalFeature('preferDarkMode')} value={this.props.settings.optionalFeatures.preferDarkMode}/><label><b>Use dark mode.</b> Use this toggle to set <i>dark mode</i> as your prefered theme.</label>
          </div>
          <div className="toggle-group" id="toggle-noWarningForMissingPermissions" style={{ display: this.props.hasExtendedPermissions ? 'none' : 'flex' }}>
            <ToggleButton onToggle={() => this.props.onToggleOptionalFeature('noWarningForMissingPermissions')} value={this.props.settings.optionalFeatures.noWarningForMissingPermissions}/><label><b>No warning for missing permissions.</b> To work best, DemoMonkey requires permissions to interact with all sites, and will warn you if you don&apos;t provide those permissions. Turn this feature on to remove this warning.</label>
          </div>
          <div className="toggle-group" id="toggle-registerProtocolHandler">
            <ToggleButton onToggle={() => this.props.onToggleOptionalFeature('registerProtocolHandler')} value={this.props.settings.optionalFeatures.registerProtocolHandler}/><label><b>Register Protocol Handler.</b> Turn this feature on to register web+mnky to be handled by demomonkey.</label>
          </div>
          <div className="toggle-group" id="toggle-beta_configSync" style={{ display: window.location.href.includes('?beta') ? 'flex' : 'none' }}>
            <ToggleButton onToggle={() => this.props.onToggleOptionalFeature('beta_configSync')} value={this.props.settings.optionalFeatures.beta_configSync}/><label><b>Config Sync Beta.</b> Turn on the option for config sync beta. </label>
          </div>
          { this.renderSyncToggle() }
          { this.renderSync() }
          <h2>Permissions</h2>
          For DemoMonkey to work optimal you have to grant permissions to access all websites.
          <div className="toggle-group" id="toggle-beta_configSync">
            <ToggleButton onToggle={() => this.props.onRequestExtendedPermissions(this.props.hasExtendedPermissions)} value={this.props.hasExtendedPermissions}/><label><b>Allow access on all sites.</b> Allow DemoMonkey to read and change data on all sites you visit.</label>
          </div>
          You can not revoke permissions from here. Go to the extensions page, choose Demo Monkey, click on <i>Details</i> and there set <i>Site Access</i> to <i>On click</i>
          <h2>Backup</h2>
          You can always open the <a href="backup.html">backup page</a> to download your files or manipulate your settings. Please use with caution!
          <button className="save-button" onClick={(event) => this.props.onDownloadAll(event)}>Download all configurations</button>
        </div>
      </div>
    )
  }
}

export default Settings
