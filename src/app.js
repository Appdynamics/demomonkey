/* global chrome */
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { Store } from 'react-chrome-redux'
import OptionsPageApp from './components/options/OptionsPageApp'
import PopupPageApp from './components/popup/PopupPageApp'

function renderOptionsPageApp(root, store) {
  if (window.location.hash.substring(1) !== '') {
    console.log('Updating current view', window.location.hash.substring(1))
    store.dispatch({
      'type': 'SET_CURRENT_VIEW',
      view: window.location.hash.substring(1)
    })
  }

  window.addEventListener('hashchange', function () {
    store.dispatch({
      'type': 'SET_CURRENT_VIEW',
      view: window.location.hash.substring(1)
    })
  })

  ReactDOM.render(
    <Provider store={store}><OptionsPageApp/></Provider>, root)
}

function renderPopupPageApp(root, store) {
  chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
    window.setTimeout(
      // The timeout is important to remediate a chrome bug: https://bugs.chromium.org/p/chromium/issues/detail?id=307912
      function () {
        ReactDOM.render(
          <Provider store={store}><PopupPageApp currentUrl={tabs[0].url}/></Provider>, root)
      }, 150)
  })
}

function updateCurrentPage() {
  if (window.location.hash !== '#' + store.getState().currentView) {
    console.log('Setting hash by subscribe: #' + store.getState().currentView)
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

  if (window.store.state.settings.optionalFeatures.adrumTracking === false) {
    window['adrum-disable'] = true
  }

  updateCurrentPage()

  switch (root.getAttribute('data-app')) {
    case 'OptionsPageApp':
      renderOptionsPageApp(root, store)
      break
    case 'DevToolsPageApp':
      if (window.store.state.settings.optionalFeatures.inDevTools === true) {
        chrome.devtools.panels.create('DemoMonkey',
          'MyPanelIcon.png',
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
