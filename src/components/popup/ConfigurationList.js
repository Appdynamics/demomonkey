/* global chrome */
import React from 'react'
import ToggleConfiguration from '../shared/ToggleConfiguration'
import PropTypes from 'prop-types'

class ConfigurationList extends React.Component {
  static propTypes = {
    settings: PropTypes.object.isRequired,
    currentUrl: PropTypes.string.isRequired,
    configurations: PropTypes.arrayOf(PropTypes.object).isRequired,
    actions: PropTypes.objectOf(PropTypes.func).isRequired
  }

  constructor(props) {
    super(props)
    this.currentDirectory = ''
    console.log(props.settings)
    this.state = {
      search: '',
      onlyShowAvailable: props.settings.optionalFeatures.onlyShowAvailableConfigurations === true
    }
  }

  handleSearchUpdate(event) {
    console.log(event.target.value.toLowerCase())
    this.setState({ search: event.target.value.toLowerCase() })
  }

  toggleOnlyShowAvailable() {
    this.setState({ onlyShowAvailable: !this.state.onlyShowAvailable })
  }

  renderPath(configuration, index) {
    return <div key={configuration.id}>{this.renderItem(configuration, index)}</div>
  }

  renderItem(configuration, index) {
    return <div><ToggleConfiguration onlyShowAvailable={this.state.onlyShowAvailable} currentUrl={this.props.currentUrl} className={configuration.name.toLowerCase().indexOf(this.state.search) === -1 ? 'hidden' : 'visible'}
      index={index}
      actions={this.props.actions}
      configuration={configuration}/></div>
  }

  renderList() {
    return <div>
      {this.props.configurations.sort((a, b) => {
        return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
      }).map((configuration, index) => this.renderPath(configuration, index))}
    </div>
  }

  renderEmpty() {
    return <i>
      No configuration found. Open the <a href="#" onClick={(e) => {
        e.preventDefault()
        chrome.runtime.openOptionsPage()
      }}>Dashboard</a> to create configurations
    </i>
  }

  render() {
    return <div>
      <div><input type="text" onChange={(event) => this.handleSearchUpdate(event)} value={this.state.search} placeholder="Search..." className="searchBox" /></div>
      <div><input type="checkbox" checked={this.state.onlyShowAvailable} onChange={(event) => this.toggleOnlyShowAvailable()} /> Only show configurations available for the current url</div>
      <div className="configurations-list">
        {this.props.configurations.length < 1 ? this.renderEmpty() : this.renderList() }
      </div>
    </div>
  }
}

export default ConfigurationList
