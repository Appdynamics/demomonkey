import React from 'react'
import CodeMirror from 'react-codemirror'
import 'codemirror/mode/properties/properties'
import 'codemirror/addon/edit/trailingspace'

class Settings extends React.Component {
  static propTypes = {
    settings: React.PropTypes.object.isRequired
  }

  render() {
    var options = {
      lineNumbers: true,
      mode: 'properties',
      height: '100%',
      showTrailingSpace: true
    }

    return (
      <div className="inner-content">
        <h1>Settings</h1>
        <div className="template-box">
          <label htmlFor="template">New configuration template (will auto-save):</label>
          <CodeMirror value={this.props.settings.baseTemplate} name="template" onChange={this.props.onSetBaseTemplate} options={options}/>
        </div>
      </div>
    )
  }
}

export default Settings
