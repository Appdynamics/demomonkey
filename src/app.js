import React from 'react';
import ReactDOM from 'react-dom';
import {createStore} from 'redux'
import {Provider} from 'react-redux'
import reducers from './reducers'
import OptionsPageApp from './components/OptionsPageApp'
import PopupPageApp from './components/PopupPageApp'

const persistentStates = {
    configurations: [
        {
            "id": 0,
            "name": "Customer Care Solution",
            "enabled": true
        }, {
            "id": 1,
            "name": "Online Banking",
            "enabled": false
        }
    ]
};

//chrome.storage.local.remove("configurations");

chrome.storage.local.get(persistentStates, function(state) {

    const store = createStore(reducers, state);

    store.subscribe(function() {
        chrome.storage.local.set({configurations: store.getState().configurations});
        if (window.location.hash !== "#" + store.getState().currentView) {
            console.log("Setting hash by subscribe: #" + store.getState().currentView)
            history.pushState(null, null, "#" + store.getState().currentView);
        }
    });
    var root = document.getElementById('app')
    console.log("Loading application:", root.getAttribute('data-app'));
    if (root.getAttribute('data-app') == "OptionsPageApp") {

      if(window.location.hash.substring(1) != '') {
          console.log("Updating current view", window.location.hash.substring(1));
          store.dispatch({'type': 'SET_CURRENT_VIEW', view: window.location.hash.substring(1)})
      }

        chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
          if(request.receiver && request.receiver === "options" && request.anchor) {
            store.dispatch({'type': 'SET_CURRENT_VIEW', view: request.anchor})
          }
        });

        ReactDOM.render(
            <Provider store={store}>
            <OptionsPageApp/>
        </Provider>, root);
    } else {
        window.setTimeout(
        // The timeout is important to remediate a chrome bug:
        // https://bugs.chromium.org/p/chromium/issues/detail?id=307912
        function() {
            ReactDOM.render(
                <Provider store={store}>
                <PopupPageApp/>
            </Provider>, root);
        }, 150);
    }
});
