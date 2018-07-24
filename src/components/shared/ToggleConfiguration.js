/* global chrome */
import React from 'react'
import ToggleButton from 'react-toggle-button'
import Configuration from '../../models/Configuration'
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
    var tmpConfig = (new Configuration(this.props.configuration.content, null, false, this.props.configuration.values))
    var name = this.props.configuration.name // .split('/').pop()

    if ((this.props.onlyShowAvailable && !tmpConfig.isAvailableForUrl(this.props.currentUrl)) || tmpConfig.isTemplate() || !tmpConfig.isRestricted()) {
      return <div></div>
    }

    return <div className={'toggle-group ' + this.props.className}>
      <ToggleButton colors={{active: {base: '#5c832f', hover: '#90c256'}}} value={this.props.configuration.enabled} onToggle={() => { this.toggle(this.props.configuration.id) }}/>
      <label>
        <a href="#" onClick={(event) => this.openEditor(event, this.props.configuration.id)}>{name}</a>
      </label>
    </div>
  }
}

export default ToggleConfiguration
