import { createStore } from 'redux'
import { wrapStore } from 'react-chrome-redux'
import reducers from './reducers'
import uuidV4 from 'uuid/v4'
import Configuration from './models/Configuration'
import ConfigurationSync from './models/ConfigurationSync'
import match from './helpers/match.js'

(function (scope) {
  'use strict'

  var selectedTabId = -1
  var counts = []
  var enabledHotkeyGroup = -1

  scope.logMessage = function (message) {
    console.log(message)
    scope.chrome.runtime.sendMessage({
      receiver: 'dashboard',
      logMessage: message
    })
  }

  function updateBadge() {
    var count = counts[selectedTabId]
    scope.chrome.browserAction.setBadgeText({
      text: count > 0 ? count + '' : 'off',
      tabId: selectedTabId
    })
    scope.chrome.browserAction.setBadgeBackgroundColor({
      color: count > 0 ? '#952613' : '#5c832f',
      tabId: selectedTabId
    })
  }

  var hookedIntoWebRequests = false

  var hookedUrls = {}

  var hooks = {
    block: () => { return { cancel: true } },
    delay: (options) => {
      var counter = 0
      for (var start = Date.now(); Date.now() - start < options.delay * 1000;) {
        counter++
        if (counter % 10000 === 0) {
          console.log('Delay', counter)
        }
      }
      console.log('Done', counter)
      return {}
    },
    replace: (options) => {
      return { redirectUrl: options.replace }
    }
  }

  function webRequestHook(details) {
    return Object.keys(hookedUrls).reduce((acc, id) => {
      const { url, action, options } = hookedUrls[id]
      if (match(details.url, url)) {
        return Object.assign(acc, hooks[action](options))
      }
      return acc
    }, {})
  }

  function hookIntoWebRequests(feature, running) {
    console.log(feature, running, hookedIntoWebRequests)
    if (!hookedIntoWebRequests && feature && running) {
      console.log('Hooking into web requests')
      scope.chrome.webRequest.onBeforeRequest.addListener(
        webRequestHook,
        {urls: ['<all_urls>']},
        ['blocking']
      )
      hookedIntoWebRequests = true
    } else if (hookedIntoWebRequests && (!feature || !running)) {
      console.log('De-Hooking into web requests')
      scope.chrome.webRequest.onBeforeRequest.removeListener(webRequestHook)
      hookedIntoWebRequests = false
    }
  }

  scope.chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.receiver && request.receiver === 'background') {
      if (typeof request.count === 'number') {
        counts[sender.tab.id] = request.count
        updateBadge()
      }
      if (request.task && request.task === 'addUrl' && typeof request.url === 'object') {
        console.log(request.url)
        hookedUrls[request.url.id] = request.url
        console.log(hookedUrls)
      }
      if (request.task && request.task === 'removeUrl' && typeof request.id === 'string') {
        delete hookedUrls[request.id]
      }
    }
  })

  scope.chrome.tabs.onUpdated.addListener(function (tabId, props, tab) {
    if (props.status === 'loading') {
      scope.chrome.tabs.sendMessage(tabId, {
        receiver: 'monkey',
        task: 'restart'
      })
    }
    if (props.status === 'complete' && tabId === selectedTabId) {
      updateBadge()
    }
  })

  scope.chrome.tabs.onSelectionChanged.addListener(function (tabId, props) {
    selectedTabId = tabId
    updateBadge()
  })

  scope.chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs.length > 0) {
      selectedTabId = tabs[0].id
      updateBadge()
    }
  })

  const defaultsForOptionalFeatures = {
    undo: true,
    autoReplace: true,
    autoSave: true,
    saveOnClose: true,
    adrumTracking: true,
    editorAutocomplete: true,
    inDevTools: true,
    webRequestHook: false,
    remoteSync: false,
    // This is only a soft toggle, since the user can turn it on and off directly in the popup
    onlyShowAvailableConfigurations: true,
    experimental_withTemplateEngine: false
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
      remoteConnections: []
    },
    monkeyID: uuidV4()
  }

  scope.chrome.storage.local.get(persistentStates, function (state) {
    // currentView is not persistent but should be defined to avoid
    // issues rendering the UI.
    state.currentView = 'welcome'

    run(state)
  })

  function run(state, revisions = {}) {
    console.log('Background Script started')
    var store = createStore(reducers, state)
    wrapStore(store, { portName: 'DEMO_MONKEY_STORE' })

    // Persist monkey ID. Shouldn't change after first start.
    scope.chrome.storage.local.set({monkeyID: store.getState().monkeyID})

    hookIntoWebRequests(store.getState().settings.optionalFeatures.webRequestHook, store.getState().configurations.filter(c => c.enabled).length > 0)

    /*
    var sync = new ConfigurationSync(
      scope.chrome.storage,
      {
        saveConfiguration: (id, configuration) => {
          store.dispatch({ 'type': 'SAVE_CONFIGURATION', id, configuration, sync: true })
        },
        addConfiguration: (configuration) => {
          store.dispatch({ 'type': 'ADD_CONFIGURATION', configuration, sync: true })
        }
      },
      'http://localhost:17485'
    )
    sync.start()
    */

    store.subscribe(function () {
      console.log('Saving changes...')

      var configurations = store.getState().configurations

      var settings = store.getState().settings

      // Sync data back into chrome.storage
      scope.chrome.storage.local.set({
        configurations,
        settings,
        monkeyID: store.getState().monkeyID
      })

      console.log(settings.optionalFeatures.webRequestHook)
      console.log(configurations.filter(c => c.enabled).length)

      hookIntoWebRequests(settings.optionalFeatures.webRequestHook, configurations.filter(c => c.enabled).length > 0)
    })

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
  }
})(window)
