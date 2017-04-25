import CodeMirror from 'react-codemirror'
import React from 'react'
import PropTypes from 'prop-types'
import Mousetrap from 'mousetrap'

class CodeEditor extends React.Component {
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

  componentDidMount() {
    var rcm = document.querySelector('.ReactCodeMirror')
    console.log(rcm)

    Mousetrap.prototype.stopCallback = () => { return false }

    Mousetrap(rcm).bind('enter', () => {
      this.props.onAutoSave(event)
      return false
    })
  }

  render() {
    return <div>{window.isTesting === true
      ? <textarea id="contentarea" value={this.props.value} onChange={(event) => this.handleChange(event.target.value, event)} />
      : <CodeMirror value={this.props.value} onChange={(content) => this.handleChange(content)} options={this.props.options}/>
    }</div>
  }
}
export default CodeEditor
