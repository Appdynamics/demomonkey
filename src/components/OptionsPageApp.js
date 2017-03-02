import React from 'react'
import Content from './Content'
import NavigationList from './NavigationList'
import {connect} from 'react-redux'

const App = ({ configurations, currentView, actions }) => (
  <div id="main-grid">
        <ul id="navigation">
            <li>
                <h2>Configurations</h2>
                <NavigationList type="configuration" actions={actions} items={configurations} currentView={currentView}/>
            </li>
        </ul>
        <Content actions={actions} configurations={configurations} currentView={currentView}/>
    </div>
)

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
