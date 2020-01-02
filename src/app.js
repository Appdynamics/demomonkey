/* global chrome */
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { Store } from 'webext-redux'
import OptionsPageApp from './components/options/OptionsPageApp'
import PopupPageApp from './components/popup/PopupPageApp'
import Manifest from './models/Manifest'
import { logger, connectLogger } from './helpers/logger'

function renderOptionsPageApp(root, store) {
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

  if (window.location.hash.substring(1) !== '') {
    logger('debug', 'Updating current view', window.location.hash.substring(1)).write()
    store.dispatch({
      type: 'SET_CURRENT_VIEW',
      view: window.location.hash.substring(1)
    })
  }

  window.addEventListener('hashchange', function () {
    store.dispatch({
      type: 'SET_CURRENT_VIEW',
      view: window.location.hash.substring(1)
    })
  })

  ReactDOM.render(
    <Provider store={store}><OptionsPageApp/></Provider>, root)
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

function updateCurrentPage() {
  if (window.location.hash !== '#' + store.getState().currentView) {
    logger('debug', 'Setting hash by subscribe: #' + store.getState().currentView).write()
    var cv = typeof store.getState().currentView === 'undefined' ? '' : store.getState().currentView
    window.history.pushState(null, null, '#' + cv)
  }
}

const store = new Store({
  portName: 'DEMO_MONKEY_STORE' // communication port name
})

store.ready().then(() => {
  document.getElementById('backup-message').remove()
  const root = document.getElementById('app')
  // Synchronize current view on subscription update
  store.subscribe(updateCurrentPage)

  window.store = store

  const app = root.getAttribute('data-app')

  connectLogger(store, { source: app })

  if (window.store.state.settings.optionalFeatures.adrumTracking === false) {
    window['adrum-disable'] = true
  }

  updateCurrentPage()

  const manifest = new Manifest(chrome)

  logger('debug', `DemoMonkey ${manifest.version()}`).write()

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
