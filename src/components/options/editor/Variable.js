import React from 'react'
import VariableModle from '../../../models/Variable'
import PropTypes from 'prop-types'
import AceEditor from 'react-ace'

import 'brace/theme/textmate'
import 'brace/mode/html'

class Variable extends React.Component {
  static propTypes = {
    onValueUpdate: PropTypes.func.isRequired,
    variable: PropTypes.instanceOf(VariableModle)
  }

  updateVariable(value) {
    this.props.onValueUpdate(this.props.variable.name, value)
  }

  render() {
    return <div className="variable-box">
      <label htmlFor="variable-1">{this.props.variable.name}</label>
      {/* <input name={this.props.variable.name} type="text"
        onChange={(event) => this.updateVariable(event)}
        placeholder={this.props.variable.placeholder}
        defaultValue={this.props.variable.value}/> */}
      <AceEditor height="4.5em"
        name={this.props.variable.name}
        minLines={1}
        maxLines="Infinity"
        theme="textmate"
        mode="html"
        highlightActiveLine={false}
        showGutter={false}
        autoScrollEditorIntoView={true}
        value={this.props.variable.value}
        ref={(c) => { this.editor = c }}
        onChange={(event) => this.updateVariable(event)}
      />
      <div className="help">{this.props.variable.description}</div>
    </div>
  }
}

export default Variable
