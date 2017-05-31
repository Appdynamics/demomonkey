/* global chrome */
import React from 'react'
import ToggleButton from 'react-toggle-button'
import Configuration from '../models/Configuration'
import PropTypes from 'prop-types'

class ToggleConfiguration extends React.Component {
  static propTypes = {
    actions: PropTypes.objectOf(PropTypes.func).isRequired,
    configuration: PropTypes.object,
    index: PropTypes.number
  }

  toggle(id) {
    this.props.actions.toggleConfiguration(id)
  }

  openEditor(event, id) {
    event.preventDefault()
    chrome.runtime.openOptionsPage(() => {
      this.props.actions.setCurrentView('configuration/' + id)
    })
  }

  render() {
    var tmpConfig = (new Configuration(this.props.configuration.content, null, false, this.props.configuration.values))

    if (tmpConfig.isTemplate() || !tmpConfig.isRestricted()) {
      return <div></div>
    }

    return <div className="toggle-group">
            <ToggleButton colors={{active: {base: '#5c832f', hover: '#90c256'}}} value={this.props.configuration.enabled} onToggle={() => { this.toggle(this.props.configuration.id) }}/>
            <label>
                <a href="#" onClick={(event) => this.openEditor(event, this.props.index)}>{this.props.configuration.name}</a>
            </label>
        </div>
  }
}

export default ToggleConfiguration
