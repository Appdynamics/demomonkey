import React from 'react'
import PropTypes from 'prop-types'
import Variable from '../../../models/Variable'
import AceEditor from 'react-ace'

import 'brace/theme/xcode'
import 'brace/theme/merbivore'
import 'brace/mode/html'

class GlobalVariables extends React.Component {
  static propTypes = {
    onSaveGlobalVariables: PropTypes.func.isRequired,
    globalVariables: PropTypes.array.isRequired,
    isDarkMode: PropTypes.bool.isRequired
  }

  constructor(props) {
    super(props)
    this.state = {
      globalVariables: props.globalVariables
    }
  }

  addVariable() {
    this.setState({
      globalVariables: this.state.globalVariables.concat({
        key: '',
        value: ''
      })
    })
  }

  deleteVariable(index) {
    const globalVariables = this.state.globalVariables.filter((v, i) => i !== index)

    console.log(globalVariables)

    this.setState({
      globalVariables
    })
  }

  updateVariable(index, key, value) {
    const { globalVariables } = this.state
    globalVariables[index] = {
      key, value
    }
    this.setState({
      globalVariables
    })
  }

  save() {
    const globalVariables = this.state.globalVariables.filter((v) => v.key !== '')
    this.props.onSaveGlobalVariables(globalVariables)
  }

  render() {
    const variables = this.state.globalVariables.filter(v => v != null).map(v => new Variable(v.key, v.value))

    return (<div>
      {variables.length > 0 ? '' : <div className="no-variables">No variables defined</div>}
      {variables.map((variable, index) => {
        return (<div className="variable-box" key={index}>
          <label htmlFor="variable-1">
            <input type="text" value={variable.name} onChange={(e) => this.updateVariable(index, e.target.value, variable.value)} />&nbsp;
            <small><a href="#" onClick={(e) => this.deleteVariable(index)}>(delete)</a></small>
          </label>
          <AceEditor height="4.5em" width="700px"
            name={variable.id}
            minLines={1}
            theme={ this.props.isDarkMode ? 'merbivore' : 'xcode' }
            mode="html"
            highlightActiveLine={false}
            showGutter={false}
            autoScrollEditorIntoView={true}
            value={variable.value}
            ref={(c) => { this.editor = c }}
            onChange={(value) => this.updateVariable(index, variable.name, value)}
            editorProps={{ $blockScrolling: 'Infinity' }}
          />
          <div className="help">{variable.description}</div>
        </div>)
      })}
      <button className="save-button" onClick={() => this.addVariable()}>Add Variable</button>
      <button className="save-button" onClick={() => this.save()}>Save</button></div>
    )
  }
}

export default GlobalVariables
