import React from 'react'
import Navigation from './navigation/Navigation'
import { connect } from 'react-redux'
import Popup from 'react-popup'
import Welcome from './Welcome'
import Settings from './Settings'
import Editor from './editor/Editor'
import Configuration from '../../models/Configuration'
import PropTypes from 'prop-types'
import Repository from '../../models/Repository'

/* The OptionsPageApp will be defined below */
class App extends React.Component {
  static propTypes = {
    actions: PropTypes.objectOf(PropTypes.func).isRequired,
    configurations: PropTypes.arrayOf(PropTypes.object).isRequired,
    currentView: PropTypes.string.isRequired,
    settings: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props)
    this.vPageView = null
  }

  startTracking(view) {
    if (window.ADRUM) {
      console.log('URL', view)
      this.vPageView = new window.ADRUM.events.VPageView({
        url: view
      })
      this.vPageView.start()
      this.vPageView.markViewChangeStart()
      this.vPageView.markViewChangeEnd()
    }
  }

  stopTracking() {
    if (window.ADRUM) {
      this.vPageView.markViewDOMLoaded()
      this.vPageView.markXhrRequestsCompleted()
      this.vPageView.end()
      window.ADRUM.report(this.vPageView)
      this.vPageView = null
    }
  }

  componentWillMount() {
    this.startTracking(this.props.currentView)
  }

  componentWillUpdate(nextProps) {
    this.startTracking(nextProps.currentView)
  }

  componentDidUpdate() {
    this.stopTracking()
  }

  componentDidMount() {
    this.stopTracking()
  }

  navigateTo(target) {
    this.props.actions.setCurrentView(target)
  }

  saveConfiguration(configuration) {
    if (configuration.id === 'new') {
      this.addConfiguration(configuration)
    } else {
      this.props.actions.saveConfiguration(configuration.id, configuration)
    }
  }

  addConfiguration(configuration) {
    this.props.actions.addConfiguration(configuration)
    this.props.actions.setCurrentView('configuration/latest')
  }

  copyConfiguration(configuration) {
    this.addConfiguration({
      ...configuration,
      name: 'Copy of ' + configuration.name,
      id: 'new',
      enabled: false
    })
  }

  downloadConfiguration(configuration) {
    window.chrome.downloads.download({
      url: 'data:text/octet-stream;base64,' + window.btoa(configuration.content),
      filename: configuration.name + '.mnky' // Optional
    })
  }

  deleteConfiguration(configuration) {
    Popup.create({
      title: 'Please confirm',
      content: <span>Do you really want to remove <b>{configuration.name}</b>?</span>,
      buttons: {
        left: [{
          text: 'Cancel',
          action: () => Popup.close()
        }],
        right: [{
          text: 'Delete',
          className: 'danger',
          action: () => {
            Popup.close()
            this.props.actions.setCurrentView('welcome')
            this.props.actions.deleteConfiguration(configuration.id)
          }
        }]
      }
    })
  }

  getRepository() {
    var configurations = this.props.configurations.reduce(function (repo, rawConfig) {
      repo[rawConfig.name] = new Configuration(rawConfig.content)
      return repo
    }, {})

    return new Repository(configurations)
  }

  getConfiguration(id) {
    if (id === 'create') {
      return {
        name: '',
        content: this.props.settings.baseTemplate,
        id: 'new'
      }
    }
    if (id === 'latest') {
      return this.props.configurations[this.props.configurations.length - 1]
    }
    return this.props.configurations.find((item) => item.id === id)
  }

  toggleOptionalFeature(feature) {
    console.log(feature)
    this.props.actions.toggleOptionalFeature(feature)
  }

  setBaseTemplate(baseTemplate) {
    this.props.actions.setBaseTemplate(baseTemplate)
  }

  setMonkeyInterval(interval) {
    console.log(interval)
    this.props.actions.setMonkeyInterval(interval)
  }

  saveConnection(name, credentials) {
    var connector = {}
    connector[name] = credentials
    this.props.actions.addConnector(connector)
  }

  removeConnection(name) {
    this.props.actions.removeConnector(name)
  }

  getCurrentView() {
    var segments = this.props.currentView.split('/')

    switch (segments[0]) {
      case 'settings':
        return <Settings settings={this.props.settings}
          configurations={this.props.configurations}
          onToggleOptionalFeature={(feature) => this.toggleOptionalFeature(feature)}
          onSetBaseTemplate={(baseTemplate) => this.setBaseTemplate(baseTemplate)}
          onSetMonkeyInterval={(event) => this.setMonkeyInterval(event.target.value)}
          onConnected={(name, credentials) => this.saveConnection(name, credentials)}
          onDisconnected={(name) => this.removeConnection(name)}/>
      case 'configuration':
        var configuration = this.getConfiguration(segments[1])
        console.log(configuration)
        return <Editor repository={this.getRepository()} currentConfiguration={configuration}
          autoSave={this.props.settings.optionalFeatures.autoSave}
          saveOnClose={this.props.settings.optionalFeatures.saveOnClose}
          editorAutocomplete={this.props.settings.optionalFeatures.editorAutocomplete}
          onDownload={(configuration, _) => this.downloadConfiguration(configuration)}
          onSave={(_, configuration) => this.saveConfiguration(configuration)}
          onCopy={(configuration, _) => this.copyConfiguration(configuration)}
          onDelete={(configuration, _) => this.deleteConfiguration(configuration)}/>
      default:
        return <Welcome />
    }
  }

  render() {
    return <div className="main-grid">
      <Popup className="popup" btnClass="popup__btn" />
      <ul className="navigation">
        <li>
          <h2>DemoMonkey</h2>
          <Navigation onNavigate={(target) => this.navigateTo(target)} onUpload={(configuration) => this.addConfiguration(configuration)} items={this.props.configurations} />
        </li>
      </ul>
      <div className="current-view">
        {this.getCurrentView()}
      </div>
    </div>
  }
}

const OptionsPageApp = connect(
  // map state to props
  state => {
    return { configurations: state.configurations, currentView: state.currentView, settings: state.settings }
  },
  // map dispatch to props
  dispatch => ({
    actions: {
      setCurrentView: (key) => {
        dispatch({ 'type': 'SET_CURRENT_VIEW', view: key })
      },
      setMonkeyInterval: (monkeyInterval) => {
        dispatch({ 'type': 'SET_MONKEY_INTERVAL', monkeyInterval })
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
      },
      setBaseTemplate: (baseTemplate) => {
        dispatch({ 'type': 'SET_BASE_TEMPLATE', baseTemplate })
      },
      toggleOptionalFeature: (optionalFeature) => {
        dispatch({ 'type': 'TOGGLE_OPTIONAL_FEATURE', optionalFeature })
      },
      addConnector: (connector) => {
        dispatch({ 'type': 'ADD_CONNECTOR', connector })
      },
      removeConnector: (connector) => {
        dispatch({ 'type': 'REMOVE_CONNECTOR', connector })
      }
    }
  }))(App)

export default OptionsPageApp
