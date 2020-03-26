/* global chrome */
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { Store } from 'webext-redux'
import OptionsPageApp from './components/options/OptionsPageApp'
import PopupPageApp from './components/popup/PopupPageApp'
import Manifest from './models/Manifest'
import ProtocolHandler from './models/ProtocolHandler'
import { logger, connectLogger } from './helpers/logger'

function updateCurrentView(v) {
  if (window.location.hash !== '#' + v) {
    var cv = typeof v === 'undefined' ? '' : v
    window.history.pushState(null, null, '#' + cv)
    window.dispatchEvent(new Event('viewchange'))
  }
}

function renderOptionsPageApp(root, store) {
  chrome.permissions.getAll(function (permissions) {
    ReactDOM.render(
      <Provider store={store}>
        <OptionsPageApp
          initialView={window.location.hash.substring(1)}
          onCurrentViewChange={(v) => updateCurrentView(v)}
          permissions={permissions}
        />
      </Provider>, root)
  })

  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.receiver && request.receiver === 'dashboard' && typeof request.logMessage !== 'undefined') {
      console.log('Message received', request.logMessage)
      var msg = typeof request.logMessage === 'string' ? request.logMessage : JSON.stringify(request.logMessage)
      var mbox = document.getElementById('message-box')
      mbox.className = 'fade-to-visible'
      mbox.innerHTML = '(' + new Date().toLocaleTimeString() + ') ' + msg
      var timeoutid = setTimeout(function () {
        console.log(timeoutid, mbox.dataset.timeoutid)
        if (parseInt(mbox.dataset.timeoutid) === timeoutid) {
          mbox.className = 'fade-to-hidden'
        }
      }, 3000)
      mbox.dataset.timeoutid = timeoutid
    }
  })
}

function renderPopupPageApp(root, store) {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
    const currentUrl = tabs.length > 0 ? tabs[0].url : ''
    ReactDOM.render(
      <Provider store={store}><PopupPageApp currentUrl={currentUrl}/></Provider>, root)
    // The following is required to fix https://bugs.chromium.org/p/chromium/issues/detail?id=428044
    window.setTimeout(() => {
      document.body.style.minHeight = (document.body.clientHeight + 1) + 'px'
    }, 200)
  })
}

const store = new Store({
  portName: 'DEMO_MONKEY_STORE' // communication port name
})

store.ready().then(() => {
  document.getElementById('backup-message').remove()
  const root = document.getElementById('app')

  window.store = store

  const app = root.getAttribute('data-app')

  if (store.getState().settings.optionalFeatures.writeLogs) {
    connectLogger(store, { source: 'monkey.js' })
  }

  if (window.store.state.settings.optionalFeatures.adrumTracking === false) {
    window['adrum-disable'] = true
  }

  // updateCurrentPage()

  const manifest = new Manifest(chrome)

  logger('debug', `DemoMonkey ${manifest.version()}`).write()

  const protocolHandler = new ProtocolHandler('web+mnky:', store.state.settings.demoMonkeyServer)
  protocolHandler.handle(window.location.search).catch(error => {
    logger('error', error).write()
    window.history.replaceState({}, document.title, window.location.pathname + window.location.hash)
  }).then((configuration) => {
    if (configuration) {
      const configurations = store.getState().configurations
      store.dispatch({ type: 'ADD_CONFIGURATION', configuration }).then(() => {
        const latest = configurations[configurations.length - 1]
        store.dispatch({ type: 'SET_CURRENT_VIEW', view: `configuration/${latest.id}` })
      })
      window.history.replaceState({}, document.title, window.location.pathname + window.location.hash)
    }
  }).finally(() => {
    switch (app) {
      case 'OptionsPageApp':
        renderOptionsPageApp(root, store)
        break
      case 'DevToolsPageApp':
        if (window.store.state.settings.optionalFeatures.inDevTools === true) {
          chrome.devtools.panels.create(`DemoMonkey ${manifest.version()}`,
            'icons/monkey_16.png',
            'options.html',
            function (panel) {
              // code invoked on panel creation
            })
        }
        break
      default:
        renderPopupPageApp(root, store)
    }
  })
})
