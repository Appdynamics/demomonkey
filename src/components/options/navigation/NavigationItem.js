import React from 'react'
import PropTypes from 'prop-types'
import TimeAgo from 'react-timeago'

class NavigationItem extends React.Component {
  static propTypes = {
    item: PropTypes.object.isRequired,
    search: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired
  }

  formatTime(value, unit, suffix, date, defaultFormatter) {
    var r = defaultFormatter()
    return r.substr(0, r.length - 4)
  }

  handleClick() {
    this.props.onClick(this.props.item.id)
  }

  render() {
    const item = this.props.item
    return <li className={item.name.toLowerCase().indexOf(this.props.search) === -1 ? 'hidden' : ''}>
      <a href={'#configuration/' + item.id} onClick={(event) => this.handleClick(event)} >
        <span className="configuration-name">{item.name}</span>
        <TimeAgo formatter={(value, unit, suffix, date, defaultFormatter) => this.formatTime(value, unit, suffix, date, defaultFormatter)} className="configuration-updated-at" date={item.updated_at} minPeriod="60" />
      </a>
    </li>
  }
}

export default NavigationItem
