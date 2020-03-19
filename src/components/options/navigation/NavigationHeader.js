import React from 'react'
import PropTypes from 'prop-types'

import ConfigurationUpload from '../../shared/ConfigurationUpload'

class NavigationHeader extends React.Component {
  static propTypes = {
    onUpload: PropTypes.func.isRequired,
    onNavigate: PropTypes.func.isRequired,
    onDownloadAll: PropTypes.func.isRequired,
    connectionState: PropTypes.string.isRequired,
    remoteLocation: PropTypes.string.isRequired
  }

  handleClick(event, target) {
    event.preventDefault()
    this.props.onNavigate(target)
  }

  render() {
    return <ul className='actions'>
      <li>
        <a href='#welcome' onClick={(event) => this.handleClick(event, 'welcome')} >Home</a>
      </li>
      <li>
        <a href={'#' + 'configuration/new'} onClick={(event) => this.handleClick(event, 'configuration/new')} >Create</a>
      </li>
      <li>
        <ConfigurationUpload onUpload={this.props.onUpload} id='upload' />
      </li>
      <li>
        <a href='#settings' onClick={(event) => this.handleClick(event, 'settings')} >Settings</a>
      </li>
      <li>
        { this.props.connectionState === 'unknown'
          ? <a href='#settings' onClick={this.props.onDownloadAll} >Backup</a>
          : <a href={this.props.remoteLocation.replace(/\/*$/, '') + '/backup'} rel="noopener noreferrer" target="_blank">Backups</a>
        }
      </li>
      <li>
        <a href='#settings' onClick={(event) => this.handleClick(event, 'logs')} >Logs</a>
      </li>
    </ul>
  }
}

export default NavigationHeader
