import SearchAndReplace from './SearchAndReplace'
import Style from './Style'
import Hide from './Hide'
import ReplaceImage from './ReplaceImage'
import OverwriteHTML from './OverwriteHTML'
import ReplaceFlowmapIcon from './appdynamics/ReplaceFlowmapIcon'
import HideApplication from './appdynamics/HideApplication'
import HideDatabase from './appdynamics/HideDatabase'
import HideBrowserApplication from './appdynamics/HideBrowserApplication'
// import HideBusinessTransaction from './appdynamics/HideBusinessTransaction'
import ReplaceFlowmapConnection from './appdynamics/ReplaceFlowmapConnection'

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
    if (namespace === 'appdynamics' || this.namespaces.includes('appdynamics')) {
      if (command === 'replaceFlowmapIcon') {
        return new ReplaceFlowmapIcon(parameters[0], value)
      }
      if (command === 'hideApplication') {
        return new HideApplication(parameters[0], typeof window === 'undefined' ? '' : window.location)
      }
      if (command === 'hideBrowserApplication') {
        return new HideBrowserApplication(parameters[0], value, typeof window === 'undefined' ? '' : window.location)
      }
      if (command === 'hideDB' || command === 'hideDatabase') {
        return new HideDatabase(parameters[0], typeof window === 'undefined' ? '' : window.location)
      }
      if (command === 'hideBT' || command === 'hideBusinessTransaction') {
        // return new HideBusinessTransaction(parameters[0], value, typeof window === 'undefined' ? '' : window.location)
        return new Hide(parameters[0], 3, 'x-grid-row', '', 'APP_BT_LIST', typeof window === 'undefined' ? '' : window.location)
      }
      if (command === 'replaceFlowmapConnection') {
        return new ReplaceFlowmapConnection(parameters[0], parameters[1], value)
      }
    }

    if (command === 'style') {
      return new Style(parameters[0], parameters[1], value)
    }

    if (command === 'hide') {
      return new Hide(parameters[0], parameters[1], parameters[2], parameters[3], parameters[4], typeof window === 'undefined' ? null : window.location)
    }

    if (command === 'replaceImage') {
      return new ReplaceImage(parameters[0], value)
    }

    if (command === 'overwriteHTML' || command === 'overwrite') {
      return new OverwriteHTML(parameters[0], parameters[1], value, typeof window === 'undefined' ? '' : window.location)
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
