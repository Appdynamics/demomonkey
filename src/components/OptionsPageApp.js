import React from 'react'
import Content from './Content'
import NavigationList from './NavigationList'
import {connect} from 'react-redux'

/* The OptionsPageApp will be defined below */
class App extends React.Component {
  static propTypes = {
    actions: React.PropTypes.objectOf(React.PropTypes.func).isRequired,
    configurations: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    currentView: React.PropTypes.string.isRequired
  }

  render() {
    return <div id="main-grid">
          <ul id="navigation">
              <li>
                  <h2>Configurations</h2>
                  <NavigationList type="configuration" actions={this.props.actions} items={this.props.configurations} currentView={this.props.currentView}/>
              </li>
          </ul>
          <Content actions={this.props.actions} configurations={this.props.configurations} currentView={this.props.currentView}/>
      </div>
  }
}

const OptionsPageApp = connect(
  // map state to props
  state => {
    return { configurations: state.configurations, currentView: state.currentView }
  },
  // map dispatch to props
  dispatch => ({
    actions: {
      setCurrentView: (key) => {
        dispatch({ 'type': 'SET_CURRENT_VIEW', view: key })
      },
      toggleConfiguration: (id) => {
        dispatch({ 'type': 'TOGGLE_CONFIGURATION', id: id })
      },
      saveConfiguration: (id, configuration) => {
        dispatch({ 'type': 'SAVE_CONFIGURATION', id, configuration })
      },
      deleteConfiguration: (id) => {
        dispatch({ 'type': 'DELETE_CONFIGURATION', id })
      },
      addConfiguration: (configuration) => {
        dispatch({ 'type': 'ADD_CONFIGURATION', configuration })
      }
    }
  }))(App)

export default OptionsPageApp
