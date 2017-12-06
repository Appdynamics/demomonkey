import React from 'react'
import TimeAgo from 'react-timeago'
import PropTypes from 'prop-types'
import ConfigurationUpload from './ConfigurationUpload'

class Navigation extends React.Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.object).isRequired,
    onNavigate: PropTypes.func.isRequired,
    onUpload: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)
    this.state = {
      search: ''
    }
  }

  handleClick(event, target) {
    event.preventDefault()
    this.props.onNavigate(target)
  }

  formatTime(value, unit, suffix, date, defaultFormatter) {
    var r = defaultFormatter()
    return r.substr(0, r.length - 4)
  }

  handleSearchUpdate(event) {
    console.log(event.target.value.toLowerCase())
    this.setState({ search: event.target.value.toLowerCase() })
  }

  render() {
    return (
      <div>
        <ul className='actions'>
          <li>
            <a href='#welcome' onClick={(event) => this.handleClick(event, 'welcome')} >Home</a>
          </li>
          <li>
            <a href={'#' + 'configuration/create'} onClick={(event) => this.handleClick(event, 'configuration/create')} >Create</a>
          </li>
          <li>
            <ConfigurationUpload onUpload={this.props.onUpload} id='upload' />
          </li>
          <li>
            <a href='#settings' onClick={(event) => this.handleClick(event, 'settings')} >Settings</a>
          </li>
        </ul>
        <ul className='items'>
          <li><input type="text" onChange={(event) => this.handleSearchUpdate(event)} value={this.state.search} placeholder="Search..." className="searchBox" /></li>
          {Object.keys(this.props.items).map((key, index) => {
            return <li key={index} className={this.props.items[key].name.toLowerCase().indexOf(this.state.search) === -1 ? 'hidden' : ''}>
              <a href={'#configuration/' + key} onClick={(event) => this.handleClick(event, 'configuration/' + key)} >
                <span className="configuration-name">{this.props.items[key].name}</span>
                <TimeAgo formatter={(value, unit, suffix, date, defaultFormatter) => this.formatTime(value, unit, suffix, date, defaultFormatter)} className="configuration-updated-at" date={this.props.items[key].updated_at} minPeriod="60" />
              </a>
            </li>
          })}
        </ul>
      </div>
    )
  }
}

export default Navigation
