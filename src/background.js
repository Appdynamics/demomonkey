import { createStore } from 'redux'
import { wrapStore } from 'react-chrome-redux'
import reducers from './reducers'
import uuidV4 from 'uuid/v4'
import Settings from './models/Settings'
import Configuration from './models/Configuration'
import GitHubConnector from './connectors/GitHub/Connector'

(function (scope) {
  'use strict'

  var selectedTabId = -1
  var counts = []
  var enabledHotkeyGroup = -1

  var syncRemoteStorage = function () {}

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
    if (request.receiver && request.receiver === 'background' && typeof request.count === 'number') {
      counts[sender.tab.id] = request.count
      updateBadge()
    }
    if (request.receiver && request.receiver === 'background' && typeof request.task === 'string' && request.task === 'syncRemoteStorage') {
      syncRemoteStorage(true)
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

  const defaultsForOptionalFeatures = {
    undo: true,
    autoReplace: true,
    autoSave: true,
    syncGist: false,
    saveOnClose: true,
    adrumTracking: true,
    editorAutocomplete: true,
    inDevTools: true,
    // This is only a soft toggle, since the user can turn it on and off directly in the popup
    onlyShowAvailableConfigurations: true
  }

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
    }],
    settings: {
      baseTemplate: require('../examples/baseTemplate.mnky'),
      optionalFeatures: defaultsForOptionalFeatures,
      monkeyInterval: 100,
      connectors: {}
    },
    monkeyID: uuidV4()
  }

  scope.chrome.storage.local.get(persistentStates, function (state) {
    var store = createStore(reducers, state)
    wrapStore(store, { portName: 'DEMO_MONKEY_STORE' })

    // Persist monkey ID. Shouldn't change after first start.
    scope.chrome.storage.local.set({monkeyID: store.getState().monkeyID})

    console.log('Background Script started')
    store.subscribe(function () {
      console.log('Synchronize changes')
      scope.chrome.storage.local.set({
        configurations: store.getState().configurations,
        settings: store.getState().settings,
        monkeyID: store.getState().monkeyID
      })
      syncRemoteStorage(false)
    })

    syncRemoteStorage = function (download) {
      console.log('Syncing remote storage ...')
      var newSettings = new Settings(store.getState().settings)
      if (newSettings.isConnectedWith('github')) {
        var ghc = new GitHubConnector(newSettings.getConnectorCredentials('github'), store.getState().configurations)
        var currentConfigurations = store.getState().configurations
        ghc.sync(currentConfigurations, download).then((results) => {
          if (results.length < 2) {
            return
          }
          var downloads = results[1][0]
          Object.keys(downloads).forEach(name => {
            var existing = currentConfigurations.find(element => {
              return element.name === name && element.connector === 'github'
            })
            if (typeof existing === 'undefined') {
              console.log('Saving ', name, downloads[name])
              store.dispatch({ 'type': 'ADD_CONFIGURATION', configuration: downloads[name] })
            } else {
              existing = Object.assign(existing, downloads[name])
              console.log('Updating', name, existing)
              store.dispatch({ 'type': 'SAVE_CONFIGURATION', id: existing.id, configuration: existing })
            }
          })
        })
      }
    }

    syncRemoteStorage(true)
    // Sync the remote storage every 5 minutes
    setInterval(() => syncRemoteStorage(true), 300000)

    function toggleHotkeyGroup(group) {
      var toggle = enabledHotkeyGroup !== group

      enabledHotkeyGroup = toggle ? group : -1

      console.log('GROUP', group, toggle)

      store.getState().configurations.forEach(function (c) {
        var config = (new Configuration(c.content, null, false, c.values))
        if (config.isTemplate() || !config.isRestricted()) {
          return
        }

        if (Array.isArray(c.hotkeys) && c.hotkeys.includes(group)) {
          store.dispatch({ 'type': 'TOGGLE_CONFIGURATION', id: c.id, enabled: toggle })
        } else if (c.enabled) {
          store.dispatch({ 'type': 'TOGGLE_CONFIGURATION', id: c.id })
        }
      })
    }

    scope.chrome.commands.onCommand.addListener(function (command) {
      console.log('Command:', command)
      if (command.startsWith('toggle-hotkey-group')) {
        var group = parseInt(command.split('-').pop())
        toggleHotkeyGroup(group)
      }
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
