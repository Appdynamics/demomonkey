import { createStore } from 'redux'
import { wrapStore } from 'react-chrome-redux'
import reducers from './reducers'
import uuidV4 from 'uuid/v4'
import PouchDB from 'pouchdb'
// import Settings from './models/Settings'
import Configuration from './models/Configuration'

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

  scope.chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.receiver && request.receiver === 'background' && typeof request.count === 'number') {
      counts[sender.tab.id] = request.count
      updateBadge()
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
    selectedTabId = tabs[0].id
    updateBadge()
  })

  const defaultsForOptionalFeatures = {
    undo: true,
    autoReplace: true,
    autoSave: true,
    saveOnClose: true,
    adrumTracking: true,
    editorAutocomplete: true,
    inDevTools: true,
    // This is only a soft toggle, since the user can turn it on and off directly in the popup
    onlyShowAvailableConfigurations: true,
    experimental_withTemplateEngine: false
  }

  /* disable pouchdb
  const configurationsDatabase = new PouchDB('configurations')

  var reloadFromDB = function () {
    console.log('Store not yet initialized')
  }
  */

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

    // While migrating from storage.local to PouchDB we have to check
    // if the DB has been setup and if not, we move the data from old
    // to new storage.
    /* disable pouchdb
    configurationsDatabase.info().then(result => {
      if (result.doc_count === 0) {
        configurationsDatabase.bulkDocs(state.configurations.map(c => {
          // Couch/PouchDB expects the id with an _ prefix
          c._id = c.id
          // Make sure that updated_at is always set!
          if (typeof c.updated_at === 'undefined') {
            c.updated_at = Date.now()
          }
          return c
        })).then(function (result) {
          // Run with state from PouchDB
          console.log('Initial PouchDB setup finished.')
          loadStateFromDB(state)
        }).catch(function (error) {
          // Ooops... run with state from chrome.storage
          console.log(error)
          run(state)
        })
      } else {
        // Run with state from PouchDB
        loadStateFromDB(state)
      }
    })
    */
    run(state)
  })

  /* disable pouchdb
  function loadStateFromDB(state) {
    configurationsDatabase.allDocs({
      include_docs: true,
      attachments: true
    }).then(function (result) {
      // console.log(result)
      state.configurations = result.rows.map(d => {
        var result = Object.assign({}, d.doc)
        // The revisions and _id shall not be assumed outside the PouchDB
        // so we safely remove them and store them independendly below.
        delete result._id
        delete result._rev
        return result
      })
      // Store revisions independendly for doing proper updates below.
      var revisions = {}
      result.rows.forEach(d => {
        // There are cases where updated_at is not set properly (e.g. very old configurations), force set a proper value
        var updatedAt = typeof d.doc.updated_at === 'undefined' ? Date.now() : d.doc.updated_at
        revisions[d.doc.id] = {_rev: d.doc._rev, _id: d.doc._id, updated_at: updatedAt}
      })
      console.log('Running with configurations from PouchDB.')
      run(state, revisions)
    }).catch(function (error) {
      // Ooops... run with state from chrome.storage
      console.log(error)
      run(state)
    })
  }
  */

  function run(state, revisions = {}) {
    console.log('Background Script started')
    var store = createStore(reducers, state)
    wrapStore(store, { portName: 'DEMO_MONKEY_STORE' })

    // Persist monkey ID. Shouldn't change after first start.
    scope.chrome.storage.local.set({monkeyID: store.getState().monkeyID})

    /* disable pouchdb
    // ongoing remote synchronizations
    var syncs = []
    function doSync(_connections) {
      // Terminate ongoing synchronizations, that have been removed

      var connections = [].concat(_connections)

      syncs = syncs.map(pair => {
        var [connection, sync] = pair
        var idx = connections.findIndex(c => c.key === connection.key)
        if (idx !== -1) {
          // Handle update
          var newConnection = connections[idx]
          connections.splice(idx, 1)
          if (newConnection.url !== connection.url || newConnection.label !== connection.label) {
            sync.cancel()
            console.log('Update', newConnection)
            return [newConnection, false]
          }
          // Handle no change
          console.log('No change', pair)
          return pair
        }
        // Handle delete
        scope.logMessage(`Terminating synchronization with ${connection.url}`)
        sync.cancel()
        console.log('Delete', pair)
        return false
      })

      syncs = syncs.concat(connections.map(c => [c, false]))

      syncs = syncs.filter(s => s !== false).map(pair => {
        var [connection, sync] = pair
        if (sync === false) {
          scope.logMessage(`Starting synchronization with ${connection.url}`)
          // var filter =  ? () => {} : () => {}
          var syncOpts = {live: true, retry: true}
          if (typeof connection.label === 'string' && connection.label.length > 0) {
            syncOpts.filter = (doc) => { return doc.name.startsWith(connection.label + '/') }
          }
          return [connection, PouchDB.sync('configurations', connection.url, syncOpts).on('change', info => {
            console.log('DB Sync', info)
            if (info.direction === 'pull') {
              scope.logMessage(`Pull updates from ${connection.url}`)
              reloadFromDB({docs: info.change.docs.map(doc => { return {id: doc._id, rev: doc._rev} })})
            } else {
              scope.logMessage(`Push updates to ${connection.url}`)
            }
          }).on('error', error => {
            console.log('error', error)
          }).on('paused', (error) => {
            console.log('paused', error)
          }).on('active', (info) => {
            console.log('active', info)
          }).on('denied', error => {
            console.log('denied', error)
          }).on('complete', info => {
            console.log('complete', info)
          })]
        }
        return pair
      })
    }

    reloadFromDB = function (changeSet) {
      console.log(changeSet)
      configurationsDatabase.bulkGet(changeSet).then(result => {
        console.log(result)
        result.results.forEach(r => {
          console.log(r)
          if (r.docs[0].ok) {
            var doc = r.docs[0].ok
            console.log(doc)
            // Update the revision, to avoid conflicts
            var exists = revisions.hasOwnProperty(doc.id)
            revisions[doc.id] = {_rev: doc._rev, _id: doc._id, updated_at: doc.updated_at}
            var configuration = Object.assign({}, doc)
            delete configuration._id
            delete configuration._rev
            console.log(exists, configuration)
            if (exists) {
              store.dispatch({ 'type': 'SAVE_CONFIGURATION', id: doc.id, configuration, sync: true })
            } else {
              store.dispatch({ 'type': 'ADD_CONFIGURATION', configuration })
            }
          }
        })
      }).catch(error => {
        console.log(error)
      })
    }

    doSync(store.getState().settings.remoteConnections)
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

      /* disable pouchdb
      // Sync data back into PouchDB
      configurationsDatabase.bulkDocs(configurations.filter(c => {
        return !revisions[c.id] || c.updated_at > revisions[c.id].updated_at
      }).map(c => {
        if (revisions[c.id]) {
          c._id = revisions[c.id]._id
          c._rev = revisions[c.id]._rev
        } else {
          c._id = c.id
        }
        return c
      })).then(resultSet => {
        resultSet.forEach(result => {
          if (result.ok) {
            // Setting the updated_at to Date.now() is "dirty" since this value is different
            // to the updated_at in the state. Fast changes to a document may break this?!
            revisions[result.id] = {_rev: result.rev, _id: result.id, updated_at: Date.now()}
          }
        })
      }).catch(error => {
        console.log(error)
      })

      doSync(settings.remoteConnections)
      */
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
