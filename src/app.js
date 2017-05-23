import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { Store } from 'react-chrome-redux'
import OptionsPageApp from './components/OptionsPageApp'
import PopupPageApp from './components/PopupPageApp'

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
  window.setTimeout(
    // The timeout is important to remediate a chrome bug: https://bugs.chromium.org/p/chromium/issues/detail?id=307912
    function () {
      ReactDOM.render(
        <Provider store={store}><PopupPageApp/></Provider>, root)
    }, 150)
}

function updateCurrentPage() {
  if (window.location.hash !== '#' + store.getState().currentView) {
    console.log('Setting hash by subscribe: #' + store.getState().currentView)
    window.history.pushState(null, null, '#' + store.getState().currentView)
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

  updateCurrentPage()

  if (root.getAttribute('data-app') === 'OptionsPageApp') {
    renderOptionsPageApp(root, store)
  } else {
    renderPopupPageApp(root, store)
  }
})
