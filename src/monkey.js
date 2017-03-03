import Monkey from './models/Monkey'

(function (scope) {
  'use strict'
  scope.chrome.storage.local.get('configurations', function (storage) {
    console.log('DemoMonkey enabled. Tampering the content.')
    var monkey = new Monkey(storage.configurations, scope)
    monkey.start()

    scope.chrome.storage.onChanged.addListener(function (changes, namespace) {
      if (namespace === 'local') {
        monkey.restart()
      }
    })
  })
})(window)
