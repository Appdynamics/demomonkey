import SearchAndReplace from './SearchAndReplace'
import Protect from './Protect'
import Style from './Style'
import Hide from './Hide'
import Group from './Group'
import ReplaceImage from './ReplaceImage'
import RecolorImage from './RecolorImage'
import ReplaceLink from './ReplaceLink'
import ReplaceNeighbor from './ReplaceNeighbor'
import InsertHTML from './InsertHTML'
import OverwriteHTML from './OverwriteHTML'
import ReplaceFlowmapIcon from './appdynamics/ReplaceFlowmapIcon'
import ReplaceFlowmapConnection from './appdynamics/ReplaceFlowmapConnection'
import RecolorDashboard from './appdynamics/RecolorDashboard'
import SetDashboardBackground from './appdynamics/SetDashboardBackground'
import DelayLink from './appdynamics/DelayLink'
import ReplaceGeoStatus from './appdynamics/ReplaceGeoStatus'
import RemoveFlowmapNode from './appdynamics/RemoveFlowmapNode'
import AddFlowmapNode from './appdynamics/AddFlowmapNode'
import BlockUrl from './BlockUrl'
import DelayUrl from './DelayUrl'
import ReplaceUrl from './ReplaceUrl'
import Limit from './Limit'
import Eval from './Eval'
import Command from './Command'
import UndoElement from './UndoElement'

class CommandBuilder {
  constructor(namespaces = [], includeRules, excludeRules, withEvalCommand = false) {
    this.namespaces = namespaces
    this.includeRules = includeRules
    this.excludeRules = excludeRules
    this.withEvalCommand = withEvalCommand
  }

  _buildRegex(search, modifiers, replace) {
    // If the provided regular expression is invalid, an exception is thrown
    // We capture that exception and return an dummy command
    try {
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
    } catch (e) {
      return new Command()
    }
  }

  _buildCustomCommand(namespace, command, parameters, value) {
    var location = typeof window === 'undefined' ? '' : window.location

    if (namespace === 'appdynamics' || this.namespaces.includes('appdynamics')) {
      if (command === 'replaceFlowmapIcon') {
        return new ReplaceFlowmapIcon(parameters[0], value)
      }

      if (command === 'replaceApplication') {
        return value === '' || value === true
          ? this._buildCustomCommand(namespace, 'hideApplication', parameters, value)
          : new SearchAndReplace(parameters[0], value)
      }
      if (command === 'hideApplication') {
        return new Group([
          new Hide(parameters[0], 4, 'ads-application-card', '', 'APPS_ALL_DASHBOARD', location),
          new Hide(parameters[0], 3, 'x-grid-row', '', 'APPS_ALL_DASHBOARD', location),
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
      if (command === 'hideMobileApplication') {
        return new Group([
          new Hide(parameters[0], 4, 'ads-mobile-app-card', '', 'EUM_MOBILE_ALL_APPS', location),
          new Hide(parameters[0], 4, 'x-grid-row', '', 'EUM_MOBILE_ALL_APPS', location),
          new Hide(parameters[0], 5, 'x-grid-row', '', 'EUM_MOBILE_ALL_APPS', location),
          new Hide(parameters[0], 2, 'ads-home-list-item', '', 'AD_HOME_OVERVIEW', location, function (_, parentNode) {
            return parentNode.getAttribute('ng-click').includes('ViewEumMobileApplication')
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
          }),
          new Hide(parameters[0], 2, 'ads-home-list-item', '', 'AD_HOME_OVERVIEW', location, function (_, parentNode) {
            return parentNode.getAttribute('ng-click').includes('ViewCustomDashboard')
          })
        ])
      }
      if (command === 'hideBusinessJourney') {
        return new Hide(parameters[0], 9, 'ads-analytics-business-outcomes-card-size', '', 'ANALYTICS_BUSINESS_OUTCOMES', location)
      }
      if (command === 'hideAnalyticsSearch') {
        return new Hide(parameters[0], 7, 'ui-grid-row', '', 'ANALYTICS_SEARCH_LIST', location)
      }
      if (command === 'hideRemoteService') {
        return new Hide(parameters[0], 3, 'x-grid-row', '', 'APP_BACKEND_LIST', location)
      }
      if (command === 'replaceFlowmapConnection') {
        return new ReplaceFlowmapConnection(parameters[0], parameters[1], value, parameters[2])
      }
      if (command === 'hideFlowmapConnection') {
        return new ReplaceFlowmapConnection(parameters[0], parameters[1], 'Hide')
      }
      if (command === 'hideBrowserPage') {
        return new Hide(parameters[0], 4, 'x-grid-row', '', 'EUM_PAGES_LIST', location)
      }
      if (command === 'replaceMobileScreenshot') {
        const thumbnailHtml = '<img src="' + value + '" height="152" width="84">'
        const screenshotHtml = '<img src="' + value + '" height="400" width="224">'
        return new Group([
          new OverwriteHTML('EUM_MOBILE_SESSION_DETAILS', 'ad-screenshot-tile-stitcher[ad-container-width="500"] > div', screenshotHtml, location),
          new OverwriteHTML('EUM_MOBILE_SESSION_DETAILS', 'ad-screenshot-tile-stitcher[ad-container-width="202"] > div', thumbnailHtml, location)
        ])
      }
      if (command === 'delayLink') {
        return new DelayLink(parameters[0], value, window)
      }
      if (command === 'recolorDashboard' || command === 'recolourDashboard') {
        return new RecolorDashboard(parameters[0], value, parameters[1], location)
      }
      if (command === 'setDashboardBackground') {
        return new SetDashboardBackground(parameters[0], parameters[1], value, location)
      }
      if (command === 'replaceNodeCount') {
        if (typeof value === 'string' && ['λ', 'lambda'].includes(value.toLowerCase())) {
          return new Group([
            new ReplaceNeighbor(parameters[0], '', 2, 'text.adsNodeCountText', '', '', location),
            new ReplaceNeighbor(parameters[0], '', 2, 'text.adsNodeCountTextLarge', '', '', location),
            new ReplaceNeighbor(parameters[0], '', 2, 'text.adsNodeCountTextSmall', '', '', location),
            new ReplaceNeighbor(parameters[0], 'images/tierTypes/AWSLambda.svg', 2, 'g.adsNodeCountContainer image', '', '', location, (search, replace, node) => {
              // <image transform="translate(-15, -15 )" width="30" height="30" xlink:href=""></image>
              const bg = node.parentElement.querySelector('.adsNodeCountBackground')
              if (bg && bg.style && bg.style.fill !== 'rgb(255, 255, 255)') {
                replace = 'images/tierTypes/AWSLambda_white.svg'
              }
              if (node.href.baseVal !== replace) {
                const original = node.href.baseVal
                const originalWidth = node.width.baseVal.value
                const originalHeight = node.height.baseVal.value
                const originalTransform = node.transform
                node.href.baseVal = replace
                node.width.baseVal.value = 30
                node.height.baseVal.value = 30
                node.setAttribute('transform', 'translate(-15,-15)')
                return [
                  new UndoElement(node, 'href.baseVal', original, replace),
                  new UndoElement(node, 'width.baseVal.value', originalWidth, 30),
                  new UndoElement(node, 'height.baseVal.value', originalHeight, 30),
                  new UndoElement(node, 'transform', originalTransform, 'translate(-15,-15)')
                ]
              }
              return false
            })
          ])
        }
        if (typeof value === 'string' && value.includes(',')) {
          const [tierCount, nodeCount] = value.split(',')
          return new Group([
            new ReplaceNeighbor(parameters[0], tierCount, 2, 'g.adsApplicationNode text.adsNodeCountText:nth-of-type(1)', '', '', location),
            new ReplaceNeighbor(parameters[0], parseInt(tierCount) === 1 ? 'TIER' : 'TIERS', 2, 'g.adsApplicationNode text.adsNodeCountTextSmall:nth-of-type(2)', '', '', location),
            new ReplaceNeighbor(parameters[0], nodeCount, 2, 'g.adsApplicationNode text.adsNodeCountText:nth-of-type(3)', '', '', location),
            new ReplaceNeighbor(parameters[0], parseInt(nodeCount) === 1 ? 'NODE' : 'NODES', 2, 'g.adsApplicationNode text.adsNodeCountTextSmall:nth-of-type(4)', '', '', location)
          ])
        }
        return new Group([
          new ReplaceNeighbor(parameters[0], value, 2, 'g.adsTierNode text.adsNodeCountText', '', '', location),
          new ReplaceNeighbor(parameters[0], parseInt(value) === 1 ? 'Node' : 'Nodes', 2, 'g.adsTierNode text.adsNodeCountTextSmall', '', '', location),
          new ReplaceNeighbor(parameters[0], value, 2, 'g.adsApplicationNode text.adsNodeCountText:nth-of-type(3)', '', '', location),
          new ReplaceNeighbor(parameters[0], parseInt(value) === 1 ? 'NODE' : 'NODES', 2, 'g.adsApplicationNode text.adsNodeCountTextSmall:nth-of-type(4)', '', '', location)
        ])
      }
      if (command === 'replaceInnerNodeHealth') {
        if (value && ['normal', 'warning', 'critical'].includes(value.toLowerCase())) {
          value = {'normal': 'rgb(0, 209, 128)', 'warning': 'rgb(255, 211, 1)', 'critical': 'rgb(255, 32, 46)'}[value.toLowerCase()]
        }
        return new ReplaceNeighbor(parameters[0], value, 2, '.adsNodeCountBackground', '', 'fill', location)
      }
      if (command === 'replaceOuterNodeHealth') {
        if (value && ['normal', 'warning', 'critical'].includes(value.toLowerCase())) {
          value = {'normal': 'rgb(0, 209, 128)', 'warning': 'rgb(255, 211, 1)', 'critical': 'rgb(255, 32, 46)'}[value.toLowerCase()]
        }
        if (parameters[1] && ['normal', 'warning', 'critical'].includes(parameters[1].toLowerCase())) {
          parameters[1] = {'normal': '.adsNormalNodeColor', 'warning': '.adsWarningNodeColor', 'critical': '.adsCriticalNodeColor'}[parameters[1].toLowerCase()]
        } else {
          parameters[1] = '.adsNormalNodeColor'
        }
        return new ReplaceNeighbor(parameters[0], value, 2, parameters[1], '', 'fill', location)
      }

      if (command === 'replaceBusinessTransactionHealth' || command === 'replaceBTHealth') {
        // !appdynamics.replaceNeighbor(Homepage, 3, img.adsSvgIconSmall, ,src) = images/health/critical.svg
        if (value && ['normal', 'warning', 'critical'].includes(value.toLowerCase())) {
          value = {'normal': 'images/health/normal.svg', 'warning': 'images/health/warning.svg', 'critical': 'images/health/critical.svg'}[value.toLowerCase()]
        }
        return new ReplaceNeighbor(parameters[0], value, 3, 'img.adsSvgIconSmall', '', 'src', location)
      }
      if (command === 'replaceFlowmapNode') {
        value = typeof value === 'string' ? this._extractParameters(value) : []
        let commands = [
          new ReplaceFlowmapIcon(parameters[0], value[1]),
          this._buildCustomCommand(namespace, 'replaceNodeCount', [parameters[0]], value[2]),
          this._buildCustomCommand(namespace, 'replaceInnerNodeHealth', [parameters[0]], value[3]),
          this._buildCustomCommand(namespace, 'replaceOuterNodeHealth', [parameters[0]], value[4])
        ].reduce((result, cmd, index) => {
          if (typeof value[index + 1] === 'string' && value[index + 1] !== '') {
            result.push(cmd)
          }
          return result
        }, [])
        return new Group(commands.concat(new SearchAndReplace(parameters[0], value[0])))
      }
      if (command === 'replaceBusinessTransactionOriginalName' || command === 'replabeBTOriginalName') {
        return new SearchAndReplace(parameters[0], value, 'APP_BT_LIST', 'tr td:nth-child(3) .x-grid-cell-inner', '', location)
      }
      if (command === 'replaceBT' || command === 'replaceBusinessTransaction') {
        if (typeof value !== 'string' || value === '') {
          return this._buildCustomCommand(namespace, 'hideBusinessTransaction', parameters, value)
        }
        value = this._extractParameters(value)
        let commands = [new SearchAndReplace(parameters[0], value[0])]
        if (typeof value[1] === 'string' && value[1] !== '') {
          commands.unshift(this._buildCustomCommand(namespace, 'replaceBusinessTransactionOriginalName', [parameters[0]], value[1]))
        }
        if (typeof value[1] === 'string' && value[2] !== '') {
          commands.unshift(this._buildCustomCommand(namespace, 'replaceBusinessTransactionHealth', [parameters[0]], value[2]))
        }
        return new Group(commands)
      }
      if (command === 'replaceIOTNumericWidget') {
        return new ReplaceNeighbor(parameters[0], value, 10, '.number-label', 'EUM_IOT_DEVICE_DASHBOARD', '', location)
      }
      if (command === 'replaceDrillDownHealth' || command === 'replaceDrilldownHealth') {
        const icon = (typeof value === 'string' && ['normal', 'warning', 'critical', 'unknown'].includes(value.toLowerCase())) ? 'images/health/' + value + '.svg' : 'images/health/unknown.svg'
        return new ReplaceNeighbor(parameters[0], icon, 2, '.ads-drill-down image', 'APP_SNAPSHOT_VIEW', 'href.baseVal', location)
      }
      if (command === 'replaceGeoStatus') {
        return new ReplaceGeoStatus(parameters[0], value)
      }
      if (command === 'removeFlowmapNode') {
        return new RemoveFlowmapNode(parameters[0])
      }
      if (command === 'addFlowmapNode') {
        return new AddFlowmapNode(parameters[0], parameters[1])
      }
    }

    if (command === 'replace') {
      return new SearchAndReplace(parameters[0], value, parameters[1], parameters[2], parameters[3], location)
    }

    if (command === 'replaceAttribute') {
      return new SearchAndReplace(parameters[0], value, parameters[2], parameters[3], parameters[1], location)
    }

    if (command === 'protect') {
      return new Protect(parameters[0], parameters[1], parameters[2], location)
    }

    if (command === 'replaceNeighbor') {
      return new ReplaceNeighbor(parameters[0], value, parameters[1], parameters[2], parameters[3], parameters[4], location)
    }

    if (command === 'insertBefore') {
      return new InsertHTML('afterbegin', parameters[0], value, parameters[1], parameters[2], location)
    }

    if (command === 'insertAfter') {
      return new InsertHTML('beforeend', parameters[0], value, parameters[1], parameters[2], location)
    }

    if (command === 'style') {
      return new Style(parameters[0], parameters[1], parameters[2], value)
    }

    if (command === 'hide') {
      return new Hide(parameters[0], parameters[1], parameters[2], parameters[3], parameters[4], location)
    }

    if (command === 'replaceImage') {
      return new ReplaceImage(parameters[0], value, parameters[1])
    }

    if (command === 'recolorImage' || command === 'recolourImage') {
      return new RecolorImage(parameters[0], value)
    }

    if (command === 'replaceLink') {
      return new ReplaceLink(parameters[0], value)
    }

    if (command === 'blockUrl') {
      return new BlockUrl(parameters[0], parameters[1], this.includeRules, this.excludeRules)
    }

    if (command === 'delayUrl') {
      return new DelayUrl(parameters[0], value, parameters[1], this.includeRules, this.excludeRules)
    }

    if (command === 'replaceUrl' || command === 'redirectUrl') {
      return new ReplaceUrl(parameters[0], value, parameters[1], this.includeRules, this.excludeRules)
    }

    if (command === 'overwriteHTML' || command === 'overwrite') {
      return new OverwriteHTML(parameters[0], parameters[1], value, location)
    }

    if (command === 'overwritePage') {
      var iframeCode = '<head><title>' + parameters[1] + '</title><style>html {height:100%;}</style></head><body style="margin:0;padding:0;width:100%;height:100%;overflow:hidden;"><iframe src="' + value + '" style="width:100%;height:100%"></body>'
      return new OverwriteHTML(parameters[0], '', iframeCode, location)
    }

    if (command === 'limit') {
      return new Limit(this.build(parameters[0], value), parameters[1], parameters[2])
    }

    if (this.withEvalCommand && command === 'eval') {
      return new Eval(parameters.shift(), parameters, value)
    }
    // Add new commands above this line.

    return new Command()
  }

  _extractParameters(params) {
    let parameters = []
    // parameters = command.slice(command.indexOf('(') + 1, -1).split(/\s*,\s*/).filter(elem => elem !== '')
    let index = 0
    parameters.push('')
    let open = ''
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
    return parameters.map(e => e.trim().replace(/"(.*)"|'(.*)'/, '$1$2')) // .filter(e => e !== '')
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
      parameters = this._extractParameters(command.slice(command.indexOf('(') + 1, -1))

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

  _innerBuild(key, value) {
    // Reverse of the replacement of \= defined in Ini.js
    if (typeof value === 'string') {
      value = value.replace('\u2260', '=')
    }
    if (typeof key === 'string') {
      key = key.replace('\u2260', '=')
    }

    if (key.charAt(0) === '!') {
      return this._buildCommand(key.substr(1), value)
    }

    if (key.charAt(0) === '\\') {
      key = key.substr(1)
    }

    return new SearchAndReplace(key, value)
  }

  build(key, value) {
    let cmd = this._innerBuild(key, value)

    cmd.setSource(key, value)

    return cmd
  }
}

export default CommandBuilder
