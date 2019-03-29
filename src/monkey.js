import Monkey from './models/Monkey'
import Settings from './models/Settings'
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
      }
    }

    var $DEMO_MONKEY = new Monkey(store.getState().configurations, scope, settings.isFeatureEnabled('undo'), settings.monkeyInterval, settings.isFeatureEnabled('experimantal_withTemplateEngine'), urlManager)
    updateBadge($DEMO_MONKEY.start())

    function restart() {
      console.log('Restart DemoMonkey')
      // Update settings
      var settings = new Settings(store.getState().settings)
      var newMonkey = new Monkey(store.getState().configurations, scope, settings.isFeatureEnabled('undo'), settings.monkeyInterval, settings.isFeatureEnabled('experimantal_withTemplateEngine'), urlManager)
      $DEMO_MONKEY.stop()
      updateBadge(newMonkey.start())
      $DEMO_MONKEY = newMonkey
    }

    store.subscribe(function () {
      if (settings.isFeatureEnabled('autoReplace')) {
        restart()
      }
    })

    scope.chrome.runtime.onMessage.addListener(function (request) {
      if (request.receiver === 'monkey' && request.task === 'restart') {
        // Currently this leads to a flickering user experience, so it is disabled
        // restart()
      }
    })
  })
})(window)
