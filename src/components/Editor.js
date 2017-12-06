import React from 'react'
import Tabs from './Tabs'
import Pane from './Pane'
import Variable from './Variable'
import CodeEditor from './CodeEditor'
import Configuration from '../models/Configuration'
import Repository from '../models/Repository'
import PropTypes from 'prop-types'
import Mousetrap from 'mousetrap'
import showdown from 'showdown'

class Editor extends React.Component {
  static propTypes = {
    currentConfiguration: PropTypes.object.isRequired,
    repository: PropTypes.instanceOf(Repository).isRequired,
    onSave: PropTypes.func.isRequired,
    onCopy: PropTypes.func.isRequired,
    onDownload: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    autoSave: PropTypes.bool.isRequired,
    saveOnClose: PropTypes.bool.isRequired,
    editorAutocomplete: PropTypes.bool.isRequired
  }

  constructor(props) {
    super(props)
    this.state = {
      currentConfiguration: props.currentConfiguration,
      unsavedChanges: false
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props !== nextProps) {
      if (this.props.saveOnClose && this.state.unsavedChanges) {
        this.props.onSave(this.props.currentConfiguration, this.state.currentConfiguration)
      }

      this.setState({
        currentConfiguration: nextProps.currentConfiguration,
        unsavedChanges: false
      })
    }
  }

  handleUpdate(key, value, event = false) {
    if (event) {
      event.preventDefault()
    }
    var config = this.state.currentConfiguration
    config[key] = value
    this.setState({ currentConfiguration: config, unsavedChanges: true })
  }

  updateVariable(name, value) {
    var values = this.state.currentConfiguration.values ? this.state.currentConfiguration.values : {}
    values[name] = value
    this.handleUpdate('values', values)
  }

  componentDidMount() {
    setInterval(() => {
      var node = document.getElementById('testarea')
      var configuration = new Configuration(this.state.currentConfiguration.content, this.props.repository,
        true, this.state.currentConfiguration.values)

      if (node) {
        configuration.apply(node)
      }
    }, 150)
    Mousetrap.prototype.stopCallback = function (e, element, combo) {
      if (combo === 'mod+s') {
        return false
      }
      if ((' ' + element.className + ' ').indexOf(' mousetrap ') > -1) {
        return false
      }
      return element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA' || (
        element.contentEditable && element.contentEditable === 'true')
    }

    Mousetrap.bind('mod+s', (event) => {
      event.preventDefault()
      this.props.onSave(this.props.currentConfiguration, this.state.currentConfiguration)
      this.setState({ unsavedChanges: false })
      return false
    })
  }

  componentWillUnmount() {
    Mousetrap.unbind('mod+s')
  }

  handleClick(event, action) {
    event.preventDefault()
    if (action === 'save') {
      this.setState({ unsavedChanges: false })
    }
    action = 'on' + action.charAt(0).toUpperCase() + action.substr(1)
    this.props[action](this.props.currentConfiguration, this.state.currentConfiguration)
  }

  render() {
    var current = this.state.currentConfiguration
    var hiddenIfNew = current.id === 'new' ? { display: 'none' } : {}
    var tmpConfig = (new Configuration(current.content, this.props.repository, false, current.values))
    var variables = tmpConfig.getVariables()

    var showTemplateWarning = tmpConfig.isTemplate() || tmpConfig.isRestricted() ? 'no-warning-box' : 'warning-box'

    var shortcuts = require('../../SHORTCUTS.md')
    var converter = new showdown.Converter({
      'tables': true
    })

    var shortcutsHtml = converter.makeHtml(shortcuts)

    return (
      <div className="editor">
        <div className="title">
          <b>Title</b>
          <input type="text" id="configuration-title" placeholder="Please provide a title for your configuration" value={current.name} onChange={(event) => this.handleUpdate('name', event.target.value, event)}/>
          <button className={'save-button ' + (this.state.unsavedChanges ? '' : 'disabled')} onClick={(event) => this.handleClick(event, 'save')}>Save</button>
          <button className="copy-button" style={hiddenIfNew} onClick={(event) => this.handleClick(event, 'copy')}>Duplicate</button>
          <button className="download-button" style={hiddenIfNew} onClick={(event) => this.handleClick(event, 'download')}>Download</button>
          <button className="delete-button" style={hiddenIfNew} onClick={(event) => this.handleClick(event, 'delete')}>Delete</button>
        </div>
        <div className={showTemplateWarning}>
          <b>Warning:</b> Without <b>@include</b> or <b>@exclude</b> defined, your configuration can not be enabled.
         You can only import it as template into another configuration. If this is intended, add <b>@template</b> to remove this warning.
        </div>
        <Tabs selected={0}>
          <Pane label="Configuration" id="current-configuration-editor">
            <CodeEditor value={current.content}
              onChange={(content) => this.handleUpdate('content', content)}
              onAutoSave={(event) => this.props.autoSave ? this.handleClick(event, 'save') : event.preventDefault() }
              editorAutocomplete={this.props.editorAutocomplete}/>
          </Pane>
          <Pane label="Variables">
            {variables.length > 0 ? '' : <div className="no-variables">No variables defined</div>}
            {variables.map((variable, index) => {
              return <Variable key={variable.name} onValueUpdate={(name, value) => this.updateVariable(name, value)} variable={variable}/>
            })}
          </Pane>
          <Pane label="Testing">
            <textarea value={current.test} style={{
              width: '100%',
              height: '50%'
            }} onChange={(event) => this.handleUpdate('test', event.target.value)}/>
            <textarea value={current.test} id="testarea" className="read-only" readOnly="readOnly" style={{
              width: '100%',
              height: '50%'
            }}/>
          </Pane>
          <Pane label="Shortcuts">
            <div>
              <div dangerouslySetInnerHTML={{__html: shortcutsHtml}}></div>
            </div>
          </Pane>
        </Tabs>
      </div>
    )
  }
}

export default Editor
