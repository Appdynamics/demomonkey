import React from 'react'
import CodeMirror from 'react-codemirror'
import ToggleButton from 'react-toggle-button'
import '../codemirror/mode-mnky'
import 'codemirror/addon/edit/trailingspace'
import PropTypes from 'prop-types'
import GitHubConnectorForm from '../connectors/GitHub/ConnectorForm'

class Settings extends React.Component {
  static propTypes = {
    settings: PropTypes.object.isRequired,
    configurations: PropTypes.arrayOf(PropTypes.object).isRequired,
    onSetBaseTemplate: PropTypes.func.isRequired,
    onToggleOptionalFeature: PropTypes.func.isRequired,
    onConnected: PropTypes.func.isRequired,
    onDisconnected: PropTypes.func.isRequired
  }

  render() {
    var options = {
      lineNumbers: true,
      mode: 'properties',
      height: '100%',
      showTrailingSpace: true
    }

    return (
      <div className="content">
        <div className="settings">
        <h1>Settings</h1>
        <h2>Base Template</h2>
        <div className="template-box">
          <label htmlFor="template">New configuration template (will auto-save):</label>
          <CodeMirror value={this.props.settings.baseTemplate} name="template" onChange={this.props.onSetBaseTemplate} options={options}/>
        </div>
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
        <div className="toggle-group" style={{display: 'none'}}>
          <ToggleButton onToggle={() => this.props.onToggleOptionalFeature('syncGist')} value={this.props.settings.optionalFeatures.syncGist}/><label><b>Save all configurations as gist</b> on github. Please connect to GitHub below to use this feature.</label>
        </div>
        <div style={{display: 'none'}}>
        <h2>Remote Storage</h2>
        <p>You can use remote storages to easily backup, share, versionize your demo configurations.</p>
        <GitHubConnectorForm credentials={this.props.settings.connectors.github}
                         configurations={this.props.configurations}
                         onConnected={(credentials) => this.props.onConnected('github', credentials)}
                         onDisconnected={() => this.props.onDisconnected('github')}/>
        </div>
      </div>
    </div>
    )
  }
}

export default Settings
