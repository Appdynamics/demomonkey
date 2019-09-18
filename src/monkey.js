import Monkey from './models/Monkey'
import ModeManager from './models/ModeManager'
import Settings from './models/Settings'
import Manifest from './models/Manifest'
import {Store} from 'react-chrome-redux';

(function (scope) {
  'use strict'

  const store = new Store({
    portName: 'DEMO_MONKEY_STORE' // communication port name
  })

  function isTopFrame() {
    try {
      return window.self === window.top
    } catch (e) {
      return false
    }
  }

  function updateBadge(count) {
    if (isTopFrame()) {
      scope.chrome.runtime.sendMessage({
        receiver: 'background',
        count: count
      })
    }
  }

  store.ready().then(() => {
    var settings = new Settings(store.getState().settings)
    console.log('DemoMonkey enabled. Tampering the content.')
    console.log('Interval: ', settings.monkeyInterval)

    // We don't use the redux store, since below we restart demo monkey
    // every time the store is updated, which would lead to a loop.
    var urlManager = {
      add: (url) => {
        scope.chrome.runtime.sendMessage({
          receiver: 'background',
          task: 'addUrl',
          url
        })
      },
      remove: (id) => {
        scope.chrome.runtime.sendMessage({
          receiver: 'background',
          task: 'removeUrl',
          id
        })
      },
      clear: () => {
        scope.chrome.runtime.sendMessage({
          receiver: 'background',
          task: 'clearUrls'
        })
      }
    }

    // frames don't need an independent url manager
    if (!isTopFrame()) {
      urlManager = {
        add: (url) => {},
        remove: (id) => {},
        clear: () => {}
      }
    }

    var $DEMO_MONKEY = new Monkey(store.getState().configurations, scope, settings.isFeatureEnabled('undo'), settings.monkeyInterval, settings.isFeatureEnabled('experimantal_withTemplateEngine'), urlManager, settings.isFeatureEnabled('withEvalCommand'))
    updateBadge($DEMO_MONKEY.start())

    var modeManager = new ModeManager(scope, $DEMO_MONKEY, new Manifest(scope.chrome), settings.isDebugEnabled(), settings.isFeatureEnabled('debugBox'), settings.isLiveModeEnabled())

    function restart() {
      console.log('Restart DemoMonkey')
      // Update settings
      var settings = new Settings(store.getState().settings)
      var newMonkey = new Monkey(store.getState().configurations, scope, settings.isFeatureEnabled('undo'), settings.monkeyInterval, settings.isFeatureEnabled('experimantal_withTemplateEngine'), urlManager, settings.isFeatureEnabled('withEvalCommand'))
      $DEMO_MONKEY.stop()
      updateBadge(newMonkey.start())
      $DEMO_MONKEY = newMonkey
      modeManager.reload($DEMO_MONKEY, settings.isDebugEnabled(), settings.isFeatureEnabled('debugBox'), settings.isLiveModeEnabled())
    }

    store.subscribe(function () {
      const lastAction = store.getState().lastAction
      // updating the current view does not require any updates
      if (lastAction.type === 'SET_CURRENT_VIEW') {
        return
      }
      if (settings.isFeatureEnabled('autoReplace')) {
        restart()
      }
    })

    scope.document.addEventListener('DOMContentLoaded', function (e) {
      modeManager.start()
    })

    scope.document.addEventListener('demomonkey-inline-editing', function (e) {
      let { search, replacement, command } = JSON.parse(e.detail)
      console.log('received', search, replacement)
      console.log(store.getState().currentView)
      let configs = (store.getState().configurations.filter(config => config.enabled))
      let configuration = configs.length > 0 ? configs[0] : store.getState().configurations[0]
      if (command) {
        search = `!${command}(${search})`
      }
      configuration.content += '\n' + search + ' = ' + replacement
      console.log(configuration)
      store.dispatch({ 'type': 'SAVE_CONFIGURATION', 'id': configuration.id, configuration })
    })
  })
})(window)
