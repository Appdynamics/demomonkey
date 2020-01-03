/* global chrome */
import React from 'react'
import Navigation from './navigation/Navigation'
import { connect } from 'react-redux'
import Popup from 'react-popup'
import Welcome from './Welcome'
import Settings from './Settings'
import Logs from './Logs'
import Editor from './editor/Editor'
import Configuration from '../../models/Configuration'
import PropTypes from 'prop-types'
import Repository from '../../models/Repository'
import { Base64 } from 'js-base64'
import ErrorBox from '../shared/ErrorBox'
import WarningBox from '../shared/WarningBox'
import Page from '../shared/Page'
import JSZip from 'jszip'
import { logger } from '../../helpers/logger'

/* The OptionsPageApp will be defined below */
class App extends React.Component {
  static propTypes = {
    actions: PropTypes.objectOf(PropTypes.func).isRequired,
    configurations: PropTypes.arrayOf(PropTypes.object).isRequired,
    currentView: PropTypes.string.isRequired,
    connectionState: PropTypes.string.isRequired,
    settings: PropTypes.object.isRequired,
    log: PropTypes.arrayOf(PropTypes.object).isRequired,
    permissions: PropTypes.object.isRequired
  }

  static getDerivedStateFromError(e) {
    return { withError: e }
  }

  constructor(props) {
    super(props)
    this.state = {
      isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      withError: false,
      permissions: this.props.permissions
    }
  }

  _getDarkMode() {
    if (this.props.settings.optionalFeatures.syncDarkMode) {
      return this.state.isDarkMode
    }
    return this.props.settings.optionalFeatures.preferDarkMode
  }

  componentDidMount() {
    this.mql = window.matchMedia('(prefers-color-scheme: dark)')
    this.darkModeUpdated = (e) => {
      this.setState({ isDarkMode: e.matches })
    }
    this.mql.addListener(this.darkModeUpdated)

    this.permissionsUpdated = () => {
      chrome.permissions.getAll((permissions) => {
        logger('info', 'Permissions updated:', permissions).write()
        this.setState({ permissions })
      })
    }

    if (chrome.permissions.onAdded) {
      chrome.permissions.onAdded.addListener(this.permissionsUpdated)
      chrome.permissions.onRemoved.addListener(this.permissionsUpdated)
    }
  }

  componentWillUnmount() {
    this.mql.removeListener(this.darkModeUpdated)
    if (chrome.permissions.onAdded) {
      chrome.permissions.onAdded.removeListener(this.permissionsUpdated)
      chrome.permissions.onRemoved.removeListener(this.permissionsUpdated)
    }
    delete this.mql
  }

  navigateTo(target) {
    this.props.actions.setCurrentView(target)
  }

  downloadAll() {
    event.preventDefault()
    var zip = new JSZip()

    this.props.configurations.forEach((configuration) => {
      zip.file(configuration.name + '.mnky', configuration.content)
    })

    zip.generateAsync({ type: 'base64' })
      .then(function (content) {
        window.chrome.downloads.download({
          url: 'data:application/zip;base64,' + content,
          filename: 'demomonkey-' + (new Date()).toISOString().split('T')[0] + '.zip' // Optional
        })
      })
  }

  saveConfiguration(configuration) {
    if (configuration.id === 'new') {
      this.addConfiguration(configuration)
    } else {
      if (typeof configuration.values !== 'undefined') {
        const variables = (new Configuration(configuration.content, this.getRepository(), false, configuration.values)).getVariables().map(v => v.id)

        Object.keys(configuration.values).forEach(name => {
          if (!variables.includes(name)) {
            delete configuration.values[name]
          }
        })
      }

      this.props.actions.saveConfiguration(configuration.id, configuration)
    }
  }

  uploadConfiguration(upload) {
    if (Array.isArray(upload)) {
      this.props.actions.batchAddConfiguration(upload)
    } else {
      this.addConfiguration(upload)
    }
  }

  addConfiguration(configuration) {
    this.props.actions.addConfiguration(configuration).then(() => {
      const latest = this.props.configurations[this.props.configurations.length - 1]
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
            logger('info', `Deleting ${configuration.name} (${configuration.nodeType})`).write()
            if (configuration.nodeType === 'directory') {
              this.props.actions.deleteConfigurationByPrefix(configuration.id.split('/').reverse().join('/'))
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
    this._repo = new Repository(this.getConfigurations().reduce(function (repo, rawConfig) {
      repo[rawConfig.name] = new Configuration(rawConfig.content)
      return repo
    }, {}))
  }

  getConfigurations() {
    return this.props.configurations.filter((config) => typeof config.deleted_at === 'undefined' && typeof config._deleted === 'undefined')
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
    if (this.state.withError) {
      return <ErrorBox error={this.state.withError} />
    }

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
            onSetDemoMonkeyServer={(value) => this.setDemoMonkeyServer(value)}
            onDownloadAll={(event) => this.downloadAll(event)}
            onRequestExtendedPermissions={(revoke) => this.requestExtendedPermissions(revoke)}
            hasExtendedPermissions={this.hasExtendedPermissions()}
            isDarkMode={this._getDarkMode()}/>
        case 'configuration':
          var configuration = this.getConfiguration(segments[1])
          // If an unknown ID is selected, we throw an error.
          if (typeof configuration === 'undefined') {
            return <ErrorBox error={{ message: `Unknown Configuration ${segments[1]}` }} />
          }
          return <Editor getRepository={() => this.getRepository()} currentConfiguration={configuration}
            autoSave={this.props.settings.optionalFeatures.autoSave}
            saveOnClose={this.props.settings.optionalFeatures.saveOnClose}
            editorAutocomplete={this.props.settings.optionalFeatures.editorAutocomplete}
            keyboardHandler={this.props.settings.optionalFeatures.keyboardHandlerVim ? 'vim' : null}
            onDownload={(configuration, _) => this.downloadConfiguration(configuration)}
            onSave={(_, configuration) => this.saveConfiguration(configuration)}
            onCopy={(configuration, _) => this.copyConfiguration(configuration)}
            onDelete={(configuration, _) => this.deleteConfiguration(configuration)}
            toggleConfiguration={() => this.props.actions.toggleConfiguration(configuration.id)}
            featureFlags={{
              withEvalCommand: this.props.settings.optionalFeatures.withEvalCommand,
              hookIntoAjax: this.props.settings.optionalFeatures.hookIntoAjax,
              webRequestHook: this.props.settings.optionalFeatures.webRequestHook
            }}
            isDarkMode={this._getDarkMode()}
          />
        case 'logs':
          return <Logs entries={this.props.log} />
        default:
          return <Welcome />
      }
    } catch (e) {
      return <ErrorBox error={e} />
    }
  }

  hasExtendedPermissions() {
    const permissions = this.state.permissions
    if (Array.isArray(permissions.origins) && permissions.origins.length > 0) {
      return permissions.origins.includes('http://*/*') && permissions.origins.includes('https://*/*')
    }
    return false
  }

  requestExtendedPermissions(revoke = false) {
    console.log(revoke)
    if (revoke) {
      chrome.permissions.remove({
        origins: ['http://*/*', 'https://*/*']
      }, function (removed) {
        if (removed) {
          logger('info', 'Additional permissions removed')
        } else {
          logger('warn', 'Additional permissions not removed')
        }
      })
    } else {
      chrome.permissions.request({
        origins: ['http://*/*', 'https://*/*']
      }, function (granted) {
        if (granted) {
          logger('info', 'Additional permissions granted')
        } else {
          logger('warn', 'Additional permissions not granted')
        }
      })
    }
  }

  render() {
    var activeItem = this.props.currentView.indexOf('configuration/') === -1 ? false : this.props.currentView.split('/').pop()

    var configurations = this.getConfigurations()

    var withWarning = (!this.hasExtendedPermissions() && !this.props.settings.optionalFeatures.noWarningForMissingPermissions) ? ' with-warning' : ''

    return <Page className={`main-grid${withWarning}`} preferDarkMode={this.props.settings.optionalFeatures.preferDarkMode} syncDarkMode={this.props.settings.optionalFeatures.syncDarkMode}>
      <Popup className="popup" btnClass="popup__btn" />
      { withWarning !== ''
        ? <WarningBox onDismiss={() => this.toggleOptionalFeature('noWarningForMissingPermissions')}
          onRequestExtendedPermissions={() => this.requestExtendedPermissions()}
        />
        : '' }
      <div className="navigation">
        <Navigation onNavigate={(target) => this.navigateTo(target)}
          onUpload={(upload) => this.uploadConfiguration(upload)}
          onDelete={(configuration) => this.deleteConfiguration(configuration)}
          items={configurations}
          onDownloadAll={(event) => this.downloadAll(event)}
          active={activeItem} />
      </div>
      <div className="current-view">
        {this.getCurrentView()}
      </div>
    </Page>
  }
}

const OptionsPageApp = connect(
  // map state to props
  state => {
    return { configurations: state.configurations, currentView: state.currentView, connectionState: state.connectionState, settings: state.settings, log: state.log }
  },
  // map dispatch to props
  dispatch => ({
    actions: {
      setCurrentView: (key) => {
        dispatch({ type: 'SET_CURRENT_VIEW', view: key })
      },
      setMonkeyInterval: (monkeyInterval) => {
        dispatch({ type: 'SET_MONKEY_INTERVAL', monkeyInterval })
      },
      setDemoMonkeyServer: (demoMonkeyServer) => {
        dispatch({ type: 'SET_DEMO_MONKEY_SERVER', demoMonkeyServer })
      },
      toggleConfiguration: (id) => {
        dispatch({ type: 'TOGGLE_CONFIGURATION', id: id })
      },
      saveConfiguration: (id, configuration) => {
        dispatch({ type: 'SAVE_CONFIGURATION', id, configuration })
      },
      deleteConfiguration: (id) => {
        dispatch({ type: 'DELETE_CONFIGURATION', id })
      },
      deleteConfigurationByPrefix: (prefix) => {
        dispatch({ type: 'DELETE_CONFIGURATION_BY_PREFIX', prefix })
      },
      batchAddConfiguration: (configurations) => {
        return dispatch({ type: 'BATCH_ADD_CONFIGURATION', configurations })
      },
      addConfiguration: (configuration) => {
        return dispatch({ type: 'ADD_CONFIGURATION', configuration })
      },
      setBaseTemplate: (baseTemplate) => {
        dispatch({ type: 'SET_BASE_TEMPLATE', baseTemplate })
      },
      toggleOptionalFeature: (optionalFeature) => {
        dispatch({ type: 'TOGGLE_OPTIONAL_FEATURE', optionalFeature })
      }
    }
  }))(App)

export default OptionsPageApp
