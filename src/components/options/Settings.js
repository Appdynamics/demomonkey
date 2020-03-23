import React from 'react'
import ToggleButton from 'react-toggle-button'
import PropTypes from 'prop-types'
import AceEditor from 'react-ace'
import Tabs from '../shared/Tabs'
import Pane from '../shared/Pane'
import ServerSettings from './ServerSettings'

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
    onRequestExtendedPermissions: PropTypes.func.isRequired,
    activeTab: PropTypes.string,
    onNavigate: PropTypes.func.isRequired,
    onArchive: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)
    this.state = {
      monkeyInterval: this.props.settings.monkeyInterval,
      archiveValue: 30
    }
  }

  updateMonkeyInterval(e) {
    this.setState({
      monkeyInterval: e.target.value
    })
  }

  updateArchiveValue(e) {
    this.setState({
      archiveValue: e.target.value
    })
  }

  saveMonkeyInterval() {
    this.props.onSetMonkeyInterval(this.state.monkeyInterval)
  }

  render() {
    console.log(this.props.hasExtendedPermissions)
    return (
      <div className="content">
        <div className="settings">
          <h1>Settings</h1>
          <Tabs activeTab={this.props.activeTab} onNavigate={this.props.onNavigate}>
            <Pane label="Optional Features" name="optionalFeatures">
              <label>
                Optional features can be toggled on or off to influence the behaviour of DemoMonkey.
              </label>
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
            </Pane>
            <Pane label="Base Template" name="baseTemplate">
              <div className="template-box">
                <label htmlFor="template">This base template will be used for new configurations you create. It will auto-save while you edit it.</label>
                <AceEditor
                  height="400px"
                  width="100%"
                  minLines={20}
                  theme={ this.props.isDarkMode ? 'merbivore' : 'xcode' }
                  mode="mnky"
                  value={this.props.settings.baseTemplate}
                  name="template"
                  editorProps={{ $blockScrolling: true }}
                  onChange={this.props.onSetBaseTemplate} />
              </div>
            </Pane>
            <Pane label="Demo Monkey Server (beta)" name="demoMonkeyServer">
              <ServerSettings
                connectionState={this.props.connectionState}
                demoMonkeyServer={this.props.settings.demoMonkeyServer}
                onSetDemoMonkeyServer={this.props.onSetDemoMonkeyServer}
                onDownloadAll={this.props.onDownloadAll}
              />
            </Pane>
            <Pane label="More" name="more">
              <h2>{'Monkey\'s Behavior'}</h2>
              <label>Change this value if you experience performance issues with DemoMonkey. A higher value means less frequent updates. Default is 100.</label>
              <b>Update interval: </b>
              <input type="number" min="50" max="1000" value={this.state.monkeyInterval} onChange={(e) => this.updateMonkeyInterval(e)} />
              <button className="save-button" onClick={(e) => this.saveMonkeyInterval(e)}>save</button>
              <h2>Permissions</h2>
              For DemoMonkey to work optimal you have to grant permissions to access all websites.
              <div className="toggle-group" id="toggle-beta_configSync">
                <ToggleButton onToggle={() => this.props.onRequestExtendedPermissions(this.props.hasExtendedPermissions)} value={this.props.hasExtendedPermissions}/><label><b>Allow access on all sites.</b> Allow DemoMonkey to read and change data on all sites you visit.</label>
              </div>
              You can not revoke permissions from here. Go to the extensions page, choose Demo Monkey, click on <i>Details</i> and there set <i>Site Access</i> to <i>On click</i>
              <h2>Archive</h2>
              <label>You can archive your old configurations by moving them into the <i>Archive</i> folder. Automate this process by setting a age in days and clicking the <i>Archive</i> button.</label>
              <input type="number" min="1" value={this.state.archiveValue} onChange={(e) => this.updateArchiveValue(e)} />
              <button className="delete-button" onClick={() => this.props.onArchive(this.state.archiveValue)} >Archive</button>
              <h2>Backup</h2>
              You can always open the <a href="backup.html">backup page</a> to download your files or manipulate your settings. Please use with caution!
              <button className="save-button" onClick={(event) => this.props.onDownloadAll(event)}>Download all configurations</button>
            </Pane>
          </Tabs>
        </div>
      </div>
    )
  }
}

export default Settings
