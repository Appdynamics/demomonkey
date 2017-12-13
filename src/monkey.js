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
    console.log('DemoMonkey enabled. Tampering the content.')
    var settings = new Settings(store.getState().settings)
    console.log('Interval: ', settings.monkeyInterval)
    scope.$DEMO_MONKEY = new Monkey(store.getState().configurations, scope, settings.isFeatureEnabled('undo'), settings.monkeyInterval)
    updateBadge(scope.$DEMO_MONKEY.start())

    store.subscribe(function () {
      var settings = new Settings(store.getState().settings)
      console.log('Undo: ', settings.isFeatureEnabled('undo'))
      console.log('AutoReplace: ', settings.isFeatureEnabled('autoReplace'))
      if (settings.isFeatureEnabled('autoReplace')) {
        console.log('Restart DemoMonkey')
        scope.$DEMO_MONKEY.stop()
        scope.$DEMO_MONKEY = new Monkey(store.getState().configurations, scope, settings.isFeatureEnabled('undo'))
        updateBadge(scope.$DEMO_MONKEY.start())
      }
    })
  })
})(window)
