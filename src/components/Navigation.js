import React from 'react'
import ConfigurationUpload from './ConfigurationUpload'

class Navigation extends React.Component {
  static propTypes = {
    items: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    onNavigate: React.PropTypes.func.isRequired,
    onUpload: React.PropTypes.func.isRequired
  }

  handleClick(event, target) {
    event.preventDefault()
    this.props.onNavigate(target)
  }

  render() {
    return (
      <div>
            <ul className='actions'>
              <li>
                <a href='#' onClick={(event) => this.handleClick(event, '')} >Home</a>
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
              {Object.keys(this.props.items).map((key, index) => <li key={index}><a href={'#configuration/' + key} onClick={(event) => this.handleClick(event, 'configuration/' + key)} >{this.props.items[key].name}</a></li>)}
            </ul>
          </div>
    )
  }
}

export default Navigation
