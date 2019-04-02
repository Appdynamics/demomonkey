/* global chrome */
import React from 'react'
import Tabs from '../shared/Tabs'
import Pane from '../shared/Pane'
import Manifest from '../../models/Manifest'
import { connect } from 'react-redux'
import ConfigurationList from './ConfigurationList'
import PropTypes from 'prop-types'

const manifest = new Manifest()

/* The PopupPageApp will be defined below */
class App extends React.Component {
  static propTypes = {
    currentUrl: PropTypes.string.isRequired,
    actions: PropTypes.objectOf(PropTypes.func).isRequired,
    configurations: PropTypes.arrayOf(PropTypes.object).isRequired,
    settings: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props)
    this.vPageView = null
  }

  render() {
    var configurations = this.props.configurations.filter((config) => typeof config.deleted_at === 'undefined' && typeof config._deleted === 'undefined')
    return <div>
      <Tabs>
        <Pane label="Apply">
          <ConfigurationList currentUrl={this.props.currentUrl} configurations={configurations} settings={this.props.settings} actions={this.props.actions}/>
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
    return { configurations: state.configurations, settings: state.settings }
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
      toggleDebugMode: () => {
        dispatch({ 'type': 'TOGGLE_DEBUG_MODE' })
      }
    }
  }))(App)

export default PopupPageApp
