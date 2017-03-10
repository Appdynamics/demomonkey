import SearchAndReplace from './SearchAndReplace'
import ReplaceFlowmapIcon from './appdynamics/ReplaceFlowmapIcon'
import HideApplication from './appdynamics/HideApplication'

import Command from './Command'

class CommandBuilder {
  constructor(namespaces) {
    this.namespaces = namespaces
  }

  _buildRegex(search, modifiers, replace) {
    modifiers = typeof modifiers !== 'undefined' ? modifiers + 'g' : modifiers
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
        return new HideApplication(parameters[0], value)
      }
    }

    return new Command()
  }

  _buildCommand(key, value) {
    // handle regular expressions
    var regex = key.match(/^\/(.+)\/([gimp]+)?$/)
    if (regex !== null) {
      return this._buildRegex(regex[1], regex[2], value)
    }
    var cmd = key.match(/(?:([a-zA-Z0-9_-]+)\.)?([a-zA-Z0-9_-]+)\(([^)]+)\)/)
    if (cmd !== null) {
      return this._buildCustomCommand(cmd[1], cmd[2], cmd[3].split(/\s*,\s*/), value)
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
