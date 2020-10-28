import { createStore } from 'redux'
import { wrapStore } from 'webext-redux'
import reducers from './reducers'
import { v4 as uuidV4 } from 'uuid'
import Configuration from './models/Configuration'
import MatchRule from './models/MatchRule'
import Badge from './models/Badge'
import match from './helpers/match.js'
import { logger, connectLogger } from './helpers/logger'

(function (scope) {
  'use strict'

  var enabledHotkeyGroup = -1

  const badge = new Badge(scope.chrome.browserAction)

  var liveModeInterval = -1
  var liveModeStartTime = -1

  function doLiveMode(liveMode) {
    if (liveMode && liveModeInterval < 0) {
      logger('info', 'Live Mode started').write()
      liveModeStartTime = Date.now()
      badge.updateTimer('0')
      liveModeInterval = setInterval(() => {
        const minutes = Math.floor((Date.now() - liveModeStartTime) / 60000)
        console.log(minutes)
        badge.updateTimer(minutes)
      }, 6000)
    } else if (!liveMode && liveModeInterval > 0) {
      const time = (Date.now() - liveModeStartTime)
      const hours = ('' + Math.floor(time / (3600000))).padStart(2, '0')
      const minutes = ('' + Math.floor((time % 3600000) / 60000)).padStart(2, '0')
      const seconds = ('' + Math.floor((time % 60000) / 1000)).padStart(2, '0')
      logger('info', `Live mode ended after ${hours}:${minutes}:${seconds}`).write()
      clearInterval(liveModeInterval)
      badge.clearTimer()
      liveModeInterval = -1
    }
  }

  var hookedIntoWebRequests = false

  var hookedUrls = {}

  var hooks = {
    block: () => { return { cancel: true } },
    delay: (options) => {
      var counter = 0
      for (var start = Date.now(); Date.now() - start < options.delay * 1000;) {
        counter++
        if (counter % 10000000 === 0) {
          console.log('Delay', counter)
        }
      }
      console.log('Done', counter)
      return {}
    },
    replace: (options) => {
      logger('info', `Redirecting to ${options.replace}`).write()
      return { redirectUrl: options.replace }
    }
  }

  function webRequestHook(details) {
    return Object.keys(hookedUrls).reduce((acc, id) => {
      const { url, type, action, options, includeRules, excludeRules } = hookedUrls[id]
      // "main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", or "other"
      if (new MatchRule(includeRules, excludeRules).test(details.url) && match(details.url, url) && (type === '*' || type.split(',').map(e => e.trim()).includes(details.type))) {
        logger('info', `Applying hook ${action} on ${details.url} [${details.type}] (matching ${url})`).write()
        return Object.assign(acc, hooks[action](options))
      }
      return acc
    }, {})
  }

  function hookIntoWebRequests(feature, running) {
    if (!hookedIntoWebRequests && feature && running) {
      console.log('Hooking into web requests')
      scope.chrome.permissions.request({
        permissions: ['webRequestBlocking', 'webRequest']
      }, function (granted) {
        if (granted) {
          scope.chrome.webRequest.onBeforeRequest.addListener(
            webRequestHook,
            { urls: ['<all_urls>'] },
            ['blocking']
          )
          hookedIntoWebRequests = true
          console.log('-- hooked')
        } else {
          logger('warn', 'Could not grant webRequest permissions')
        }
      })
    } else if (hookedIntoWebRequests && (!feature || !running)) {
      console.log('Remove hook into web requests')
      scope.chrome.permissions.remove({
        permissions: ['webRequestBlocking', 'webRequest']
      }, function (removed) {
        if (removed) {
          scope.chrome.webRequest.onBeforeRequest.removeListener(webRequestHook)
          hookedIntoWebRequests = false
          console.log('-- removed')
        } else {
          logger('warn', 'Could not remove webRequest permissions')
        }
      })
    }
  }

  // New tab created, initialize badge for given tab
  scope.chrome.tabs.onCreated.addListener(function (tab) {
    // Initialize new tab
    console.log(tab)
    badge.updateDemoCounter(0, tab.id)
  })

  /*
   * The following replaces the decelerative content scripts, which require
   * high host permissions.
   */
  scope.chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
    console.log(tabId, changeInfo)
    if (changeInfo.status === 'loading') {
      console.log('Injecting Monkey.JS', tabId)
      scope.chrome.tabs.executeScript(tabId, {
        file: 'js/monkey.js',
        allFrames: true,
        runAt: 'document_start'
      }, () => console.log('Injected'))
    }
  })

  scope.chrome.tabs.onRemoved.addListener(function (tabId) {
    badge.removeTab(tabId)
  })

  scope.chrome.tabs.onActivated.addListener(function (tab) {
    scope.chrome.tabs.sendMessage(tab.tabId, { active: tab.tabId })
  })

  scope.chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.receiver && request.receiver === 'background') {
      if (typeof request.count === 'number' && typeof sender.tab === 'object' && typeof sender.tab.id === 'number') {
        badge.updateDemoCounter(request.count, sender.tab.id)
      }
      if (request.task && request.task === 'addUrl' && typeof request.url === 'object') {
        hookedUrls[request.url.id] = request.url
      }
      if (request.task && request.task === 'removeUrl' && typeof request.id === 'string') {
        delete hookedUrls[request.id]
      }
      if (request.task && request.task === 'clearUrls') {
        hookedUrls = {}
      }
    }
  })

  const defaultsForOptionalFeatures = {
    undo: true,
    autoReplace: true,
    autoSave: true,
    saveOnClose: true,
    editorAutocomplete: true,
    inDevTools: true,
    webRequestHook: false,
    debugBox: false,
    withEvalCommand: false,
    // This is only a soft toggle, since the user can turn it on and off directly in the popup
    onlyShowAvailableConfigurations: true,
    keyboardHandlerVim: false,
    hookIntoAjax: false,
    syncDarkMode: true,
    preferDarkMode: false,
    noWarningForMissingPermissions: false,
    registerProtocolHandler: false,
    writeLogs: true
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
      globalVariables: [
        {
          key: 'adPurple',
          value: '7e69d2'
        }
      ],
      debugMode: false,
      monkeyInterval: 100
    },
    monkeyID: uuidV4()
  }

  scope.chrome.storage.local.get(persistentStates, function (state) {
    // currentView is not persistent but should be defined to avoid
    // issues rendering the UI.
    // state.currentView = 'welcome'

    state.connectionState = 'unknown'

    state.settings.liveMode = false

    // We start with an empty log. Maybe in a later release persistance could be an idea..
    state.log = []

    run(state)
  })

  function updateStorage(store) {
    console.log('Updating Storage.')
    const configurations = store.getState().configurations
    const settings = store.getState().settings

    // Sync data back into chrome.storage
    scope.chrome.storage.local.set({
      configurations,
      settings,
      monkeyID: store.getState().monkeyID
    })
    hookIntoWebRequests(settings.optionalFeatures.webRequestHook, configurations.filter(c => c.enabled).length > 0)
  }

  function run(state, revisions = {}) {
    console.log('Background Script started')
    var store = createStore(reducers, state)
    wrapStore(store, { portName: 'DEMO_MONKEY_STORE' })

    // Make the store accessible from dev console.
    scope.store = store

    const settings = store.getState().settings

    if (settings.optionalFeatures.writeLogs) {
      connectLogger(store, { source: 'monkey.js' })
    }

    // Persist monkey ID. Shouldn't change after first start.
    scope.chrome.storage.local.set({ monkeyID: store.getState().monkeyID })

    hookIntoWebRequests(settings.optionalFeatures.webRequestHook, store.getState().configurations.filter(c => c.enabled).length > 0)

    store.subscribe(function () {
      const lastAction = store.getState().lastAction
      const settings = store.getState().settings
      console.log(lastAction.type)
      switch (lastAction.type) {
        case 'APPEND_LOG_ENTRIES':
          return
        case 'TOGGLE_LIVE_MODE':
          doLiveMode(settings.liveMode)
          break
        default:
          updateStorage(store)
      }
    })

    function toggleHotkeyGroup(group) {
      var toggle = enabledHotkeyGroup !== group

      enabledHotkeyGroup = toggle ? group : -1

      store.getState().configurations.forEach(function (c) {
        var config = (new Configuration(c.content, null, false, c.values))
        if (config.isTemplate() || !config.isRestricted()) {
          return
        }

        if (Array.isArray(c.hotkeys) && c.hotkeys.includes(group)) {
          store.dispatch({ type: 'TOGGLE_CONFIGURATION', id: c.id, enabled: toggle })
        } else if (c.enabled) {
          store.dispatch({ type: 'TOGGLE_CONFIGURATION', id: c.id })
        }
      })
    }

    scope.chrome.commands.onCommand.addListener(function (command) {
      console.log('Command:', command)
      if (command.startsWith('toggle-hotkey-group')) {
        var group = parseInt(command.split('-').pop())
        toggleHotkeyGroup(group)
      }
      if (command === 'live-mode') {
        store.dispatch({ type: 'TOGGLE_LIVE_MODE' })
      }
      if (command === 'debug-mode') {
        store.dispatch({ type: 'TOGGLE_DEBUG_MODE' })
      }
    })

    scope.chrome.contextMenus.create({
      title: 'Toggle Live Mode',
      contexts: ['browser_action'],
      onclick: function () {
        store.dispatch({ type: 'TOGGLE_LIVE_MODE' })
      }
    })

    scope.chrome.contextMenus.create({
      title: 'Toggle Debug Mode',
      contexts: ['browser_action'],
      onclick: function () {
        store.dispatch({ type: 'TOGGLE_DEBUG_MODE' })
      }
    })
  }
})(window)
