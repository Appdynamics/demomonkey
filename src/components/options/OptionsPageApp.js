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
import { Base64 } from 'js-base64'
import ErrorBox from '../shared/ErrorBox'

/* The OptionsPageApp will be defined below */
class App extends React.Component {
  static propTypes = {
    actions: PropTypes.objectOf(PropTypes.func).isRequired,
    configurations: PropTypes.arrayOf(PropTypes.object).isRequired,
    currentView: PropTypes.string.isRequired,
    connectionState: PropTypes.string.isRequired,
    settings: PropTypes.object.isRequired
  }

  navigateTo(target) {
    this.props.actions.setCurrentView(target)
  }

  saveConfiguration(configuration) {
    if (configuration.id === 'new') {
      this.addConfiguration(configuration)
    } else {
      const variables = (new Configuration(configuration.content, this.getRepository(), false, configuration.values)).getVariables().map(v => v.id)

      console.log('BEFORE', configuration.values)

      Object.keys(configuration.values).forEach(name => {
        if (!variables.includes(name)) {
          delete configuration.values[name]
        }
      })


      console.log('AFTER', configuration.values)

      this.props.actions.saveConfiguration(configuration.id, configuration)
    }
  }

  addConfiguration(configuration) {
    this.props.actions.addConfiguration(configuration).then(() => {
      var latest = this.props.configurations[this.props.configurations.length - 1]
      this.props.actions.setCurrentView('configuration/' + latest.id)
    })
  }

  copyConfiguration(configuration) {
    var path = configuration.name.split('/')
    var name = 'Copy of ' + path.pop()
    if (configuration.connector) {
      delete configuration.connector
      delete configuration.remoteLocation
    }
    this.addConfiguration({
      ...configuration,
      name: path.length > 0 ? (path.join('/') + '/' + name) : name,
      id: 'new',
      enabled: false,
      readOnly: false
    })
  }

  downloadConfiguration(configuration) {
    window.chrome.downloads.download({
      url: 'data:text/octet-stream;base64,' + Base64.encode(configuration.content),
      filename: configuration.name.split('/').pop() + '.mnky'
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
            // Delete all configurations within it if a directory is given
            if (configuration.nodeType === 'directory') {
              configuration.children.forEach(c => {
                this.props.actions.deleteConfigurationByPrefix(configuration.id.split('').reverse().join(''))
              })
            } else {
              this.props.actions.deleteConfiguration(configuration.id)
            }
          }
        }]
      }
    })
  }

  getRepository() {
    return this._repo
  }

  updateRepository() {
    this._repo = new Repository(this.props.configurations.reduce(function (repo, rawConfig) {
      repo[rawConfig.name] = new Configuration(rawConfig.content)
      return repo
    }, {}))
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
    this.props.actions.setMonkeyInterval(interval)
  }

  setDemoMonkeyServer(value) {
    this.props.actions.setDemoMonkeyServer(value)
  }

  getCurrentView() {
    try {
      var segments = this.props.currentView.split('/')

      this.updateRepository()

      switch (segments[0]) {
        case 'settings':
          return <Settings settings={this.props.settings}
            configurations={this.props.configurations}
            connectionState={this.props.connectionState}
            onToggleOptionalFeature={(feature) => this.toggleOptionalFeature(feature)}
            onSetBaseTemplate={(baseTemplate) => this.setBaseTemplate(baseTemplate)}
            onSetMonkeyInterval={(event) => this.setMonkeyInterval(event.target.value)}
            onSetDemoMonkeyServer={(value) => this.setDemoMonkeyServer(value)}/>
        case 'configuration':
          var configuration = this.getConfiguration(segments[1])
          // If an unknown ID is selected, we throw an error.
          if (typeof configuration === 'undefined') {
            return <ErrorBox error={{ message: `Unknown Configuration ${segments[1]}` }} />
          }
          return <Editor getRepository={() => this.getRepository()} currentConfiguration={configuration}
            autoSave={this.props.settings.optionalFeatures.autoSave}
            saveOnClose={this.props.settings.optionalFeatures.saveOnClose}
            withTemplateEngine={this.props.settings.optionalFeatures.experimental_withTemplateEngine}
            editorAutocomplete={this.props.settings.optionalFeatures.editorAutocomplete}
            onDownload={(configuration, _) => this.downloadConfiguration(configuration)}
            onSave={(_, configuration) => this.saveConfiguration(configuration)}
            onCopy={(configuration, _) => this.copyConfiguration(configuration)}
            onDelete={(configuration, _) => this.deleteConfiguration(configuration)}
            toggleConfiguration={() => this.props.actions.toggleConfiguration(configuration.id)}
          />
        default:
          return <Welcome />
      }
    } catch (e) {
      return <ErrorBox error={e} />
    }
  }

  render() {
    var activeItem = this.props.currentView.indexOf('configuration/') === -1 ? false : this.props.currentView.split('/').pop()

    var configurations = this.props.configurations.filter((config) => typeof config.deleted_at === 'undefined' && typeof config._deleted === 'undefined')

    return <div className="main-grid">
      <Popup className="popup" btnClass="popup__btn" />
      <div className="navigation">
        <Navigation onNavigate={(target) => this.navigateTo(target)}
          onUpload={(configuration) => this.addConfiguration(configuration)}
          onDelete={(configuration) => this.deleteConfiguration(configuration)}
          items={configurations}
          active={activeItem} />
      </div>
      <div className="current-view">
        {this.getCurrentView()}
      </div>
    </div>
  }
}

const OptionsPageApp = connect(
  // map state to props
  state => {
    return { configurations: state.configurations, currentView: state.currentView, connectionState: state.connectionState, settings: state.settings }
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
      setDemoMonkeyServer: (demoMonkeyServer) => {
        dispatch({ 'type': 'SET_DEMO_MONKEY_SERVER', demoMonkeyServer })
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
      deleteConfigurationByPrefix: (prefix) => {
        dispatch({ 'type': 'DELETE_CONFIGURATION_BY_PREFIX', prefix })
      },
      addConfiguration: (configuration) => {
        return dispatch({ 'type': 'ADD_CONFIGURATION', configuration })
      },
      setBaseTemplate: (baseTemplate) => {
        dispatch({ 'type': 'SET_BASE_TEMPLATE', baseTemplate })
      },
      toggleOptionalFeature: (optionalFeature) => {
        dispatch({ 'type': 'TOGGLE_OPTIONAL_FEATURE', optionalFeature })
      }
    }
  }))(App)

export default OptionsPageApp
