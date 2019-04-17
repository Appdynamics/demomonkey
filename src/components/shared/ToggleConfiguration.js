/* global chrome */
import React from 'react'
import ToggleButton from 'react-toggle-button'
import PropTypes from 'prop-types'

class ToggleConfiguration extends React.Component {
  static propTypes = {
    currentUrl: PropTypes.string.isRequired,
    onlyShowAvailable: PropTypes.bool.isRequired,
    actions: PropTypes.objectOf(PropTypes.func).isRequired,
    configuration: PropTypes.object,
    index: PropTypes.number,
    className: PropTypes.string
  }

  toggle(id) {
    this.props.actions.toggleConfiguration(id)
  }

  openEditor(event, id) {
    event.preventDefault()
    this.props.actions.setCurrentView('configuration/' + id)
    chrome.runtime.openOptionsPage()
  }

  render() {
    return <div className={'toggle-group ' + this.props.className}>
      <ToggleButton colors={{active: {base: '#5c832f', hover: '#90c256'}}} value={this.props.configuration.enabled} onToggle={() => { this.toggle(this.props.configuration.id) }}/>
      <label>
        <a href="#" onClick={(event) => this.openEditor(event, this.props.configuration.id)}>{this.props.configuration.name}</a>
      </label>
    </div>
  }
}

export default ToggleConfiguration
