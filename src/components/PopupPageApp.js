/* global chrome */
import React from 'react'
import Tabs from './Tabs'
import Pane from './Pane'
import Manifest from '../models/Manifest'
import { connect } from 'react-redux'
import ToggleConfiguration from './ToggleConfiguration'
import PropTypes from 'prop-types'

const manifest = new Manifest()

/* The PopupPageApp will be defined below */
class App extends React.Component {
  static propTypes = {
    actions: PropTypes.objectOf(PropTypes.func).isRequired,
    configurations: PropTypes.arrayOf(PropTypes.object).isRequired
  }

  render() {
    return <div>
            <Tabs>
                <Pane label="Apply">
                {this.props.configurations.map((configuration, index) => (<ToggleConfiguration key={configuration.id} index={index} actions={this.props.actions} configuration={configuration}/>))}
                {this.props.configurations.length < 1
                      ? <i>
                        No configuration found. Open the <a href="#" onClick={(e) => {
                          e.preventDefault()
                          chrome.runtime.openOptionsPage()
                        }}>Dashboard</a> to create configurations
                      </i>
                        : ''
                    }
                </Pane>
                <Pane label="Help">
                    <div>
                        <b>Author:&nbsp;
                        </b>
                        {manifest.author()}
                    </div>
                    <div>
                        <b>Homepage:&nbsp;
                        </b>
                        {manifest.homepage()}
                    </div>
                    <div>
                        <b>Version:&nbsp;
                        </b>
                        {manifest.version()}
                    </div>
                </Pane>
                <Pane link={(e) => {
                  e.preventDefault()
                  chrome.runtime.openOptionsPage()
                }} label="Dashboard"/>
            </Tabs>
        </div>
  }
}

const PopupPageApp = connect(
  // map state to props
  state => {
    return { configurations: state.configurations }
  },
  // map dispatch to props
  dispatch => ({
    actions: {
      setCurrentView: (key) => {
        dispatch({ 'type': 'SET_CURRENT_VIEW', view: key })
      },
      toggleConfiguration: (id) => {
        dispatch({ 'type': 'TOGGLE_CONFIGURATION', id: id })
      }
    }
  }))(App)

export default PopupPageApp
