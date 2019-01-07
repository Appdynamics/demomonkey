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
    editorAutocomplete: PropTypes.bool.isRequired,
    annotations: PropTypes.func.isRequired
  }

  handleChange(content, event) {
    if (event) {
      event.preventDefault()
    }
    this.props.onChange(content)
    // annotations={annotations} on the AceEditor
    // does not work properly (probably due my misunderstanding of react;) )
    // the following works and also adds some soft delay on the annotation update
    setTimeout(() => this._updateAnnotations(), 150)
  }

  _updateAnnotations() {
    if (this.editor) {
      this.editor.session.setAnnotations(this.props.annotations(this.editor.getValue()))
    }
  }

  render() {
    return <div className="editor-box"><AceEditor
      value={this.props.value}
      onChange={(content) => this.handleChange(content)}
      onLoad={(editor) => {
        this.editor = editor
        this._updateAnnotations()
      }}
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
