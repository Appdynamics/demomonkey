/* eslint no-template-curly-in-string: "off" */
import brace from 'brace'
import 'brace/ext/language_tools'
import colors from 'color-name'
import ReplaceFlowmapIcon from '../../../../commands/appdynamics/ReplaceFlowmapIcon'

import registry from '../../../../commands/CommandRegistry'

var langTools = brace.acequire('ace/ext/language_tools')
var { snippetManager } = (brace.acequire('ace/snippets'))

function signature2snippet(signature) {
  return signature.replace(/\${(\d):[^}]*}/g, (match, d) => { return '${' + d + '}' })
}

function autocomplete(getRepository, variables) {
  // Build auto completion for all commands
  let cmds = [{ caption: '!/regex/', snippet: '!/${1}/${2} = ${3}' }].concat(registry.filter(e => e.signature && !e.deprecated).map(e => {
    return {
      caption: `!${e.name}`,
      snippet: `!${e.name}${signature2snippet(e.signature)}`
    }
  })).sort()

  const nsCmds = registry.filter(e => e.registry).reduce((r, e) => {
    r[e.name] = e.registry.map(e => {
      return {
        caption: `!${e.name}`,
        snippet: `!${e.name}${signature2snippet(e.signature)}`
      }
    }).sort()
    return r
  }, {})

  // Build auto completion for all options
  const options = [
    { caption: '@include', snippet: '@include[] = ${1}' }, /* , docText: 'TBD' */
    { caption: '@exclude', snippet: '@exclude[] = ${1}' },
    { caption: '@namespace', snippet: '@namespace[] = ${1}' },
    { caption: '@blacklist', snippet: '@blacklist[] = ${1}' },
    { caption: '@whitelist', snippet: '@whitelist[] = ${1}' },
    { caption: '@author', snippet: '@author[] = ${1}' },
    { caption: '@textAttributes', snippet: '@textAttributes[] = ${1}' },
    { caption: '@template', snippet: '@template\n' },
    { caption: '@deprecated', snippet: '@deprecated\n' }
  ].sort().map(c => {
    return {
      ...c,
      meta: 'option',
      type: 'snippet'
    }
  })

  // Build autocompletion for insertion
  const insertMatch = (editor, data) => {
    if (editor.completer.completions.filterText) {
      const ranges = editor.selection.getAllRanges()
      for (let i = 0, range; i < ranges.length; i++) {
        range = ranges[i]
        range.start.column -= editor.completer.completions.filterText.length
        editor.session.remove(range)
      }
    }
    const content = getRepository().findByName(data.configName).rawContent
    if (content.includes('@template')) {
      snippetManager.insertSnippet(editor, content.replace('@template', ''))
    } else {
      editor.execCommand('insertstring', content)
    }
  }

  langTools.setCompleters([{
    identifierRegexps: [/[a-zA-Z_0-9$!%/@+\-\u00A2-\uFFFF]/],
    getCompletions: function (editor, session, pos, prefix, callback) {
      // This is a hack. it's not really easily possible to access the popup
      // so we set this timeout to capture it when it is available and resize it then.
      setTimeout(() => {
        if (editor && editor.completer && editor.completer.popup) {
          editor.completer.popup.container.style.width = '500px'
        }
      }, 50)
      if (prefix.startsWith('%') && pos.column - prefix.length === 0) {
        callback(null, getRepository().getNames().sort().map(c => {
          return {
            value: '%' + c,
            meta: 'insert',
            configName: c,
            completer: {
              insertMatch
            }
          }
        }))
      }
      if (prefix.startsWith('+') && pos.column - prefix.length === 0) {
        callback(null, getRepository().getNames().sort().map(c => { return { caption: '+' + c, value: '+' + c, meta: 'import' } }))
      } else if (prefix.startsWith('$') && pos.column - prefix.length > 0) {
        callback(null, variables.map(v => { return { caption: v.name + ' = ' + v.value, value: '${' + v.name + '}', meta: v.owner === 'global' ? 'global variable' : 'variable' } }))
      } else if (prefix.startsWith('@') && pos.column - prefix.length === 0) {
        callback(null, options)
      } else if (prefix.startsWith('!') && pos.column - prefix.length === 0) {
        // Capture namespaces for the auto completion
        const nsPattern = /^@namespace(?:\[\])?\s*=\s*(.*)$/mg
        let match
        const namespaces = []
        while ((match = nsPattern.exec(editor.getValue()))) {
          namespaces.push(match[1])
        }
        Object.keys(nsCmds).forEach(key => {
          if (namespaces.includes(key)) {
            cmds = cmds.concat(nsCmds[key])
          } else {
            cmds = cmds.concat(nsCmds[key].map(c => {
              return { snippet: c.snippet.replace(/^!/, `!${key}.`), caption: c.caption.replace(/^!/, `!${key}.`) }
            }))
          }
        })
        callback(null, cmds.map(c => {
          return {
            ...c,
            type: 'snippet',
            meta: 'commands'
          }
        }))
      } else {
        // Manage cases that look at the full line, e.g. after a first insert
        const fullLine = editor.session.getLine(pos.row)
        const lineToPos = fullLine.substr(0, pos.column - prefix.length)
        // replaceFlowmapIcon provides some values.
        // console.log(fullLine, lineToPos)
        if (fullLine.match(/^!(?:appdynamics.)?replaceFlowmapIcon\(.*\)\s*=\s*/)) {
          callback(null, Object.keys(ReplaceFlowmapIcon.icons).map(value => { return { value, meta: 'icon' } }))
        } else if (lineToPos.match(/^!(?:appdynamics.)?(hide|replace)Application\($/)) {
          callback(null, [
            'AD-DevOps', 'AD-Travel', 'Online-Retail', 'AD-Financial', 'AD-Financial-Next', 'AD-Fraud-Detection', 'AD-Capital-Rookout', 'AD-Retail', 'Movie Tickets Online', 'AD-DevOps-Offers', 'ECommerce',
            'AD-MovieTickets-Core', 'ECommerce-Fulfillment', 'AD-Financial-Cloud', 'SAP-ERP'
          ].sort().map(value => { return { value, meta: 'application' } }))
        } else if (lineToPos.match(/^!(?:appdynamics.)?recolorDashboard\($/) || fullLine.match(/^!(?:appdynamics.)?recolorDashboard\(.*\)\s*=\s*/)) {
          callback(null, Object.keys(colors).concat([
            'ad-purple',
            'ad-cyan',
            'ad-blue',
            'ad-green',
            'ad-turquoise',
            'ad-lightgray',
            'ad-lightgrey',
            'ad-darkgrey',
            'ad-darkgray',
            'ad-pink',
            'ad-red'
          ]).sort().map(value => { return { value, meta: 'color' } }))
        } else if (lineToPos.match(/^!replaceImage\($/)) {
          callback(null, [
            'ad-travel-logo',
            'ad-logo',
            'ad-devops-bg-1',
            'ad-devops-bg-2',
            'ad-devops-bg-3',
            'ad-devops-bg-4',
            'ad-devops-bg-5'
          ].sort().map(value => { return { value, meta: 'image' } }))
        } else if (fullLine.match(/^!(?:appdynamics.)?replaceDrillDownHealth\(.*\)\s*=\s*/)) {
          callback(null, [
            'normal',
            'warning',
            'critical'
          ].map(value => { return { value, meta: 'status' } }))
        } else if (fullLine.match(/^@include\[\]\s*=\s*/)) {
          callback(null, [
            '/^https?://.*\\.appdynamics\\.com(:[0-9]+)?/.*$/',
            '/^https?://.*.thousandeyes.com/.*$/',
            '/^https?://.*.service-now.com/.*$/',
            '/^https?://.*\\.harness\\.io(:[0-9]+)?/.*$/'
          ].map(value => { return { value, meta: 'include' } }))
        }
      }
    }
  }])
}

export default autocomplete
