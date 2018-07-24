import SearchAndReplace from './SearchAndReplace'
import Style from './Style'
import Hide from './Hide'
import Group from './Group'
import ReplaceImage from './ReplaceImage'
import ReplaceLink from './ReplaceLink'
import OverwriteHTML from './OverwriteHTML'
import ReplaceFlowmapIcon from './appdynamics/ReplaceFlowmapIcon'
import ReplaceFlowmapConnection from './appdynamics/ReplaceFlowmapConnection'
import DelayLink from './appdynamics/DelayLink'

import Command from './Command'

class CommandBuilder {
  constructor(namespaces = []) {
    this.namespaces = namespaces
  }

  _buildRegex(search, modifiers, replace) {
    modifiers = typeof modifiers === 'string' ? modifiers : 'g'
    if (modifiers.includes('p')) {
      return new SearchAndReplace(
        new RegExp(search, modifiers.replace('p', '')),
        function (match) {
          if (match.toUpperCase() === match) {
            replace = replace.toUpperCase()
          }
          if (match.toLowerCase() === match) {
            replace = replace.toLowerCase()
          }
          return match.replace(new RegExp(search, modifiers.replace('p', '')), replace)
        })
    }
    return new SearchAndReplace(new RegExp(search, modifiers), replace)
  }

  _buildCustomCommand(namespace, command, parameters, value) {
    var location = typeof window === 'undefined' ? '' : window.location

    if (namespace === 'appdynamics' || this.namespaces.includes('appdynamics')) {
      if (command === 'replaceFlowmapIcon') {
        return new ReplaceFlowmapIcon(parameters[0], value)
      }

      if (command === 'hideApplication') {
        return new Group([
          new Hide(parameters[0], 4, 'ads-application-card', '', 'APPS_ALL_DASHBOARD', location),
          new Hide(parameters[0], 3, 'x-grid-row', '', 'APPS_ALL_DASHBOARD', location),
          // For Appd<4.3
          new Hide(parameters[0], 2, 'ads-home-list-item', '', 'AD_HOME_OVERVIEW', location, function (_, parentNode) {
            return parentNode.getAttribute('ng-click').includes('ViewApplicationDashboard')
          }),
          // For Appd>4.4
          new Hide(parameters[0], 3, 'ads-home-list-action-item', '', 'AD_HOME_OVERVIEW', location, function (node, parentNode) {
            return node.parentElement.hasAttribute('ad-test-id') && node.parentElement.getAttribute('ad-test-id').includes('home-screen-application-card-application-name')
          })
        ])
      }
      if (command === 'hideBrowserApplication') {
        return new Group([
          new Hide(parameters[0], 4, 'x-grid-row', '', 'EUM_WEB_ALL_APPS', location),
          new Hide(parameters[0], 2, 'ads-home-list-item', '', 'AD_HOME_OVERVIEW', location, function (_, parentNode) {
            return parentNode.getAttribute('ng-click').includes('ViewEumWebApplication')
          })
        ])
      }
      if (command === 'hideDB' || command === 'hideDatabase') {
        return new Group([
          new Hide(parameters[0], 9, 'ads-database-card', '', 'DB_MONITORING_SERVER_LIST', location),
          new Hide(parameters[0], 4, 'x-grid-row', '', 'DB_MONITORING_SERVER_LIST', location),
          new Hide(parameters[0], 2, 'ads-home-list-item', '', 'AD_HOME_OVERVIEW', location, function (_, parentNode) {
            return parentNode.getAttribute('ng-click').includes('ViewDbServer')
          })
        ])
      }
      if (command === 'hideBT' || command === 'hideBusinessTransaction') {
        return new Hide(parameters[0], 3, 'x-grid-row', '', 'APP_BT_LIST', location)
      }
      if (command === 'hideDashboard') {
        return new Group([
          new Hide(parameters[0], 2, 'ads-home-list-item', '', 'DASHBOARDS_REPORTS_HOME', location),
          new Hide(parameters[0], 3, 'x-grid-row', '', 'DASHBOARD_LIST', location, function (node, parentNode) {
            // Make sure that replacements with !not work on the dashboard list, so filter for the first cell
            return node.parentElement.parentElement.className.includes('x-grid-cell-first')
          })
        ])
      }
      if (command === 'replaceFlowmapConnection') {
        return new ReplaceFlowmapConnection(parameters[0], parameters[1], value)
      }
      if (command === 'replaceMobileScreenshot') {
        var condition = function (document) {
          var view = document.querySelector('.ads-session-left-panel-container-grid-with-nav .x-grid-row-selected .x-grid-cell-first .x-grid-cell-inner')
          return view !== null && view.innerHTML === parameters[0]
        }
        var thumbnailHtml = '<img src="' + value + '" height="149" style="margin-left: auto;margin-right: auto;display: block;">'
        var screenshotHtml = '<img src="' + value + '" height="380" style="margin-top: 10px;margin-left: auto;margin-right: auto;display: block;">'
        return new Group([
          new OverwriteHTML('EUM_MOBILE_SESSION_DETAILS', '.ads-screenshot-container', screenshotHtml, location, condition),
          new OverwriteHTML('EUM_MOBILE_SESSION_DETAILS', '.ads-screenshot-tooltip-thumbnail-container', thumbnailHtml, location, condition),
          new OverwriteHTML('EUM_MOBILE_SESSION_DETAILS', '.ads-screenshots-thumbnail-container', thumbnailHtml, location, condition)
        ])
      }
      if (command === 'delayLink') {
        return new DelayLink(parameters[0], value, window)
      }
    }

    if (command === 'replace') {
      return new SearchAndReplace(parameters[0], value, parameters[1], parameters[2], location)
    }

    if (command === 'style') {
      return new Style(parameters[0], parameters[1], value)
    }

    if (command === 'hide') {
      return new Hide(parameters[0], parameters[1], parameters[2], parameters[3], parameters[4], location)
    }

    if (command === 'replaceImage') {
      return new ReplaceImage(parameters[0], value)
    }

    if (command === 'replaceLink') {
      return new ReplaceLink(parameters[0], value)
    }

    if (command === 'overwriteHTML' || command === 'overwrite') {
      return new OverwriteHTML(parameters[0], parameters[1], value, location)
    }

    if (command === 'overwritePage') {
      var iframeCode = '<head><title>' + parameters[1] + '</title><style>html {height:100%;}</style></head><body style="margin:0;padding:0;width:100%;height:100%;overflow:hidden;"><iframe src="' + value + '" style="width:100%;height:100%"></body>'
      return new OverwriteHTML(parameters[0], '', iframeCode, location)
    }

    return new Command()
  }

  _extractForCustomCommand(command) {
    if (typeof command !== 'string' || command === '') {
      return {extracted: false}
    }

    var namespace = ''
    var parameters = []

    if (command.indexOf('(') !== -1) {
      if (command.substr(-1) !== ')') {
        return {extracted: false}
      }
      // parameters = command.slice(command.indexOf('(') + 1, -1).split(/\s*,\s*/).filter(elem => elem !== '')
      var index = 0
      var params = command.slice(command.indexOf('(') + 1, -1)
      parameters.push('')
      var open = ''
      params.split('').forEach(letter => {
        if (open !== '\'' && letter === '"') {
          open = open === '"' ? '' : letter
        }
        if (open !== '"' && letter === '\'') {
          open = open === '\'' ? '' : letter
        }
        if (open === '' && letter === ',') {
          index++
          parameters.push('')
          return
        }
        parameters[index] += letter
      })

      parameters = parameters.map(e => e.trim().replace(/"(.*)"|'(.*)'/, '$1$2')) // .filter(e => e !== '')

      command = command.split('(')[0]
    }

    if (command.indexOf('.') !== -1) {
      namespace = command.slice(0, command.lastIndexOf('.'))
      command = command.slice(command.lastIndexOf('.') + 1)
    }

    return {extracted: true, command: command, namespace: namespace, parameters: parameters}
  }

  _buildCommand(key, value) {
    // handle regular expressions
    var regex = key.match(/^\/(.+)\/([gimp]+)?$/)
    if (regex !== null) {
      return this._buildRegex(regex[1], regex[2], value)
    }

    var rawCommand = this._extractForCustomCommand(key)

    if (rawCommand.extracted) {
      return this._buildCustomCommand(rawCommand.namespace, rawCommand.command, rawCommand.parameters, value)
    }
    return new Command()
  }

  build(key, value) {
    if (key.charAt(0) === '!') {
      return this._buildCommand(key.substr(1), value)
    }

    if (key.charAt(0) === '\\') {
      key = key.substr(1)
    }

    return new SearchAndReplace(key, value)
  }
}

export default CommandBuilder
