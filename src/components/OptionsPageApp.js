import React from 'react'
import Navigation from './Navigation'
import { connect } from 'react-redux'
import Popup from 'react-popup'
import Welcome from './Welcome'
import Settings from './Settings'
import Editor from './Editor'
import Configuration from '../models/Configuration'
import Repository from '../models/Repository'

/* The OptionsPageApp will be defined below */
class App extends React.Component {
  static propTypes = {
    actions: React.PropTypes.objectOf(React.PropTypes.func).isRequired,
    configurations: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    currentView: React.PropTypes.string.isRequired,
    settings: React.PropTypes.object.isRequired
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
            this.props.actions.setCurrentView('')
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
      id = this.props.configurations.length - 1
    }
    return this.props.configurations[id]
  }

  setBaseTemplate(baseTemplate) {
    console.log(baseTemplate)
    this.props.actions.setBaseTemplate(baseTemplate)
  }

  getCurrentView() {
    var segments = this.props.currentView.split('/')

    var options = {
      lineNumbers: true,
      mode: 'properties',
      height: '100%',
      showTrailingSpace: true
    }

    switch (segments[0]) {
      case 'settings':
        return <Settings settings={this.props.settings} onSetBaseTemplate={(baseTemplate) => this.setBaseTemplate(baseTemplate)}/>
      case 'configuration':
        var configuration = this.getConfiguration(segments[1])
        return <Editor repository={this.getRepository()} currentConfiguration={configuration} options={options}
                       onDownload={(configuration, _) => this.downloadConfiguration(configuration)}
                       onSave={(_, configuration) => this.saveConfiguration(configuration)}
                       onCopy={(configuration, _) => this.copyConfiguration(configuration)}
                       onDelete={(configuration, _) => this.deleteConfiguration(configuration)}/>
      default:
        return <Welcome />
    }
  }

  render() {
    return <div id="main-grid">
        <Popup className="popup" btnClass="popup__btn" />
          <ul className="navigation">
              <li>
                  <h2>Configurations</h2>
                  <Navigation onNavigate={(target) => this.navigateTo(target)} onUpload={(configuration) => this.addConfiguration(configuration)} items={this.props.configurations} />
              </li>
          </ul>
           <div id="content">
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
      }
    }
  }))(App)

export default OptionsPageApp
