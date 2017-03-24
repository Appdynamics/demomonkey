import { createStore } from 'redux'
import { wrapStore } from 'react-chrome-redux'
import reducers from './reducers'
import uuidV4 from 'uuid/v4'

(function (scope) {
  'use strict'

  var selectedTabId = -1
  var counts = []

  function updateBadge() {
    var count = counts[selectedTabId]
    console.log('Updating badge for tab', selectedTabId, count)
    scope.chrome.browserAction.setBadgeText({
      text: count > 0 ? count + '' : 'off',
      tabId: selectedTabId
    })
    scope.chrome.browserAction.setBadgeBackgroundColor({
      color: count > 0 ? '#952613' : '#5c832f',
      tabId: selectedTabId
    })
  }

  scope.chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log(request, request.receiver, request.count)
    if (request.receiver && request.receiver === 'background' && typeof request.count === 'number') {
      counts[sender.tab.id] = request.count
      updateBadge()
    }
  })

  scope.chrome.tabs.onUpdated.addListener(function (tabId, props) {
    if (props.status === 'complete' && tabId === selectedTabId) {
      updateBadge()
    }
  })

  scope.chrome.tabs.onSelectionChanged.addListener(function (tabId, props) {
    selectedTabId = tabId
    updateBadge()
  })

  scope.chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    selectedTabId = tabs[0].id
    updateBadge()
  })

  const persistentStates = {
    configurations: [{
      name: 'Example',
      content: require('../examples/one.mnky'),
      test: 'Inventory-Services\nCart\nCART\nSan Francisco',
      enabled: false,
      values: {},
      id: uuidV4()
    }, {
      name: 'Cities',
      content: require('../examples/cities.mnky'),
      test: 'San Francisco\nSeattle\nLondon',
      enabled: false,
      values: {},
      id: uuidV4()
    }]
  }

  scope.chrome.storage.local.get(persistentStates, function (state) {
    var store = createStore(reducers, state)
    wrapStore(store, { portName: 'DEMO_MONKEY_STORE' })
    //  updateBadge(store, scope)

    console.log('Background Script started')
    store.subscribe(function () {
      console.log('Synchronize changes')
      scope.chrome.storage.local.set({ configurations: store.getState().configurations })
    })
    scope.chrome.contextMenus.create({
      'title': 'Create Replacement',
      'contexts': ['selection'],
      'onclick': function (info, tab) {
        var replacement = window.prompt('Replacement for "' + info.selectionText + '": ')
        var configs = (store.getState().configurations.filter(config => config.enabled))
        var config = configs.length > 0 ? configs[0] : store.getState().configurations[0]
        config.content += '\n' + info.selectionText + ' = ' + replacement
        store.dispatch({ 'type': 'SAVE_CONFIGURATION', 'id': config.id, config })
      }
    })
  })
})(window)
