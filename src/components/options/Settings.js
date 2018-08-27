import React from 'react'
import ToggleButton from 'react-toggle-button'
import PropTypes from 'prop-types'
import JSZip from 'jszip'
import AceEditor from 'react-ace'
import GitHubConnectorForm from '../../connectors/GitHub/ConnectorForm'

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
    onDisconnected: PropTypes.func.isRequired,
    onConnectionUpdated: PropTypes.func.isRequired
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
          <h2>Backup</h2>
          You can always open the <a href="backup.html">backup page</a> to download your files or manipulate your settings. Please use with caution!
          <button className="save-button" onClick={(event) => this.downloadAll(event)}>Download all configurations</button>
          <div>
            <h2>Remote Storage</h2>
            <p>You can use remote storages to easily backup, share, versionize your demo configurations.</p>
            <GitHubConnectorForm credentials={this.props.settings.connectors.github}
              configurations={this.props.configurations}
              onConnected={(credentials) => this.props.onConnected('github', credentials)}
              onDisconnected={() => this.props.onDisconnected('github')}
              onConnectionUpdated={(credentials) => this.props.onConnectionUpdated('github', credentials)}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default Settings
