import React from 'react'
import VariableModle from '../../../models/Variable'
import PropTypes from 'prop-types'
import AceEditor from 'react-ace'

import 'brace/theme/xcode'
import 'brace/theme/merbivore'
import 'brace/mode/html'

class Variable extends React.Component {
  static propTypes = {
    onValueUpdate: PropTypes.func.isRequired,
    variable: PropTypes.instanceOf(VariableModle),
    isDarkMode: PropTypes.bool.isRequired
  }

  updateVariable(value) {
    this.props.onValueUpdate(this.props.variable.id, value)
  }

  resetVariable(event) {
    event.preventDefault()
    this.updateVariable(null)
  }

  render() {
    return <div className="variable-box">
      <label htmlFor="variable-1">
        {this.props.variable.name}&nbsp;
        {this.props.variable.owner === '' ? '' : `(from: ${this.props.variable.owner})`}&nbsp;
        <small><a href="#" onClick={(e) => this.resetVariable(e)}>(reset value)</a></small>
      </label>
      <AceEditor height="4.5em" width="700px"
        name={this.props.variable.id}
        minLines={1}
        theme={ this.props.isDarkMode ? 'merbivore' : 'xcode' }
        mode="html"
        highlightActiveLine={false}
        showGutter={false}
        autoScrollEditorIntoView={true}
        value={this.props.variable.value}
        ref={(c) => { this.editor = c }}
        onChange={(event) => this.updateVariable(event)}
        editorProps={{$blockScrolling: 'Infinity'}}
      />
      <div className="help">{this.props.variable.description}</div>
    </div>
  }
}

export default Variable
