import Monkey from './models/Monkey'

(function (scope) {
  'use strict'
  scope.chrome.storage.local.get('configurations', function (storage) {
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

    console.log('DemoMonkey enabled. Tampering the content.')
    var monkey = new Monkey(storage.configurations, scope)
    updateBadge(monkey.start())

    scope.chrome.storage.onChanged.addListener(function (changes, namespace) {
      if (namespace === 'local') {
        console.log('Restart DemoMonkey')
        monkey.stop()
        monkey = new Monkey(changes.configurations.newValue, scope)
        updateBadge(monkey.start())
      }
    })
  })
})(window)
