import React from 'react'
import PropTypes from 'prop-types'

import ConfigurationUpload from '../../shared/ConfigurationUpload'

class NavigationHeader extends React.Component {
  static propTypes = {
    onUpload: PropTypes.func.isRequired,
    onNavigate: PropTypes.func.isRequired,
    onDownloadAll: PropTypes.func.isRequired,
    showLogs: PropTypes.bool.isRequired
  }

  handleClick(event, target) {
    event.preventDefault()
    this.props.onNavigate(target)
  }

  render() {
    return <ul className='actions'>
      <li>
        <a href='#help' onClick={(event) => this.handleClick(event, 'help')} >Help</a>
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
        <a href='#backup' onClick={this.props.onDownloadAll} >Backup</a>
      </li>
      <li>
        { this.props.showLogs
          ? <a href='#logs' onClick={(event) => this.handleClick(event, 'logs')} >Logs</a>
          : ''
        }
      </li>
    </ul>
  }
}

export default NavigationHeader
