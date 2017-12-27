import React from 'react'
import PropTypes from 'prop-types'
import NavigationHeader from './NavigationHeader'
import NavigationItem from './NavigationItem'

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

  handleClick(id) {
    this.props.onNavigate('configuration/' + id)
  }

  handleSearchUpdate(event) {
    console.log(event.target.value.toLowerCase())
    this.setState({ search: event.target.value.toLowerCase() })
  }

  render() {
    return (
      <div>
        <NavigationHeader onUpload={this.props.onUpload} onNavigate={this.props.onNavigate} />
        <ul className='items'>
          <li><input type="text" onChange={(event) => this.handleSearchUpdate(event)} value={this.state.search} placeholder="Search..." className="searchBox" /></li>
          {Object.keys(this.props.items).map((key, index) => {
            var config = this.props.items[key]
            return <NavigationItem key={index} item={config} onClick={(id) => this.handleClick(id)} search={this.state.search} />
          })}
        </ul>
      </div>
    )
  }
}

export default Navigation
