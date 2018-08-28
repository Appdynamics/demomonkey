import React from 'react'
import PropTypes from 'prop-types'
import AceEditor from 'react-ace'

import 'brace/theme/xcode'
import './ace/mnky'
import 'brace/ext/language_tools'
import 'brace/ext/searchbox'

class CodeEditor extends React.Component {
  constructor(props) {
    super(props)
    this.bound = false
  }

  static propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    onAutoSave: PropTypes.func.isRequired,
    readOnly: PropTypes.bool,
    editorAutocomplete: PropTypes.bool.isRequired
  }

  handleChange(content, event) {
    if (event) {
      event.preventDefault()
    }
    this.props.onChange(content)
  }

  render() {
    return <div className="editor-box"><AceEditor
      value={this.props.value}
      onChange={(content) => this.handleChange(content)}
      width="100%"
      height="100%"
      theme="xcode"
      mode="mnky"
      readOnly = {this.props.readOnly === true}
      className = {this.props.readOnly === true ? 'disabled' : ''}
      setOptions={{
        enableBasicAutocompletion: this.props.editorAutocomplete,
        enableLiveAutocompletion: this.props.editorAutocomplete
      }}
      editorProps={{$blockScrolling: 'Infinity'}}
      name="contentarea"
      commands={[
        {
          name: 'Save On Enter',
          bindKey: {win: 'Enter', mac: 'Enter'},
          exec: (editor) => {
            editor.insert('\n')
            console.log('AUTOSAVE')
            this.props.onAutoSave(event)
          }
        }
      ]}
    />
    </div>
  }
}
export default CodeEditor
