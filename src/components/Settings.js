import React from 'react'
import CodeMirror from 'react-codemirror'
import ToggleButton from 'react-toggle-button'
import '../codemirror/mode-mnky'
import 'codemirror/addon/edit/trailingspace'

class Settings extends React.Component {
  static propTypes = {
    settings: React.PropTypes.object.isRequired,
    onSetBaseTemplate: React.PropTypes.func.isRequired,
    onToggleOptionalFeature: React.PropTypes.func.isRequired
  }

  render() {
    var options = {
      lineNumbers: true,
      mode: 'properties',
      height: '100%',
      showTrailingSpace: true
    }

    return (
      <div className="inner-content settings">
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
      </div>
    )
  }
}

export default Settings
