import React from 'react'
import ConfigurationUpload from './ConfigurationUpload'

class NavigationList extends React.Component {
  static propTypes = {
    actions: React.PropTypes.objectOf(React.PropTypes.func).isRequired,
    type: React.PropTypes.string.isRequired,
    items: React.PropTypes.arrayOf(React.PropTypes.object).isRequired
  }

  showItemEditor(event, key) {
    event.preventDefault()
    this.props.actions.setCurrentView(this.props.type + '/' + key)
  }

  showNewEditor(event) {
    event.preventDefault()
    this.props.actions.setCurrentView(this.props.type + '/create')
  }

  render() {
    return (
      <div>
            <ul id='navigation-actions'>
              <li className='navigation-action'>
                <a href={'#' + this.props.type + '/create'} onClick={(event) => this.showNewEditor(event)} >Create</a>
              </li>
              <li className='navigation-action'>
                <ConfigurationUpload actions={this.props.actions} type={this.props.type} id='upload' />
              </li>
            </ul>
            <ul id='navigation-items'>
              {Object.keys(this.props.items).map((key, index) => <li className='navigation-item' key={index}><a href={'#' + this.props.type + '/' + key} onClick={(event) => this.showItemEditor(event, key)} >{this.props.items[key].name}</a></li>)}
            </ul>
          </div>
    )
  }
}

export default NavigationList
