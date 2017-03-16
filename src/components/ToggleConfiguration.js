/* global chrome */
import React from 'react'
import ToggleButton from 'react-toggle-button'

class ToggleConfiguration extends React.Component {
  static propTypes = {
    actions: React.PropTypes.objectOf(React.PropTypes.func).isRequired,
    configuration: React.PropTypes.object,
    index: React.PropTypes.number
  }

  toggle(id) {
    this.props.actions.toggleConfiguration(id)
  }

  openEditor(event, id) {
    event.preventDefault()
    chrome.runtime.openOptionsPage(function () {
      setTimeout(function () {
        chrome.runtime.sendMessage({
          receiver: 'options',
          anchor: 'configuration/' + id
        })
      }, 150)
    })
  }

  render() {
    return <div style={{display: 'flex'}} className="toggle-configuration">
            <ToggleButton value={this.props.configuration.enabled} onToggle={() => { this.toggle(this.props.configuration.id) }}/>
            <div style={{margin: '8px'}}>
                <a href="#" onClick={(event) => this.openEditor(event, this.props.index)}>{this.props.configuration.name}</a>
            </div>
        </div>
  }
}

export default ToggleConfiguration
