import React from 'react'
import PropTypes from 'prop-types'
import Mousetrap from 'mousetrap'
import AceEditor from 'react-ace';

import 'brace/theme/xcode';
import '../ace/mnky';
import 'brace/ext/searchbox';

class CodeEditor extends React.Component {
  constructor(props) {
    super(props)
    this.bound = false
  }

  static propTypes = {
    value: PropTypes.string.isRequired,
    options: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onAutoSave: PropTypes.func.isRequired
  }

  handleChange(content, event) {
    if (event) {
      event.preventDefault()
    }
    this.props.onChange(content)
  }


  render() {
    return <div className="editor-box">{window.isTesting === true
      ? <textarea id="contentarea" value={this.props.value} onChange={(event) => this.handleChange(event.target.value, event)} />
      : <AceEditor
          value={this.props.value}
          onChange={(content) => this.handleChange(content)}
          width="100%"
          height="100%"
          theme="xcode"
          mode="mnky"
          editorProps={{$blockScrolling: true}}
          name="contentarea"
          commands={[
            {
              name: "Save On Enter",
              bindKey: {win: "Enter", mac: "Enter"},
              exec: (editor) => {
                editor.insert('\n')
                console.log('AUTOSAVE')
                this.props.onAutoSave(event)
              }
            }
          ]}
        />
    }</div>
  }
}
export default CodeEditor
