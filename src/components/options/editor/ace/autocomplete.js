/* eslint no-template-curly-in-string: "off" */
import brace from 'brace'
import 'brace/ext/language_tools'

var langTools = brace.acequire('ace/ext/language_tools')
var { snippetManager } = (brace.acequire('ace/snippets'))

function autocomplete(getRepository) {
  console.log('Autocomplete...')
  // Build auto completion for all commands
  let cmds = [
    {caption: '!/regex/', snippet: '!/${1}/${2}/${3:pi} = ${4}'},
    {caption: '!replace', snippet: '!replace(${1}, ${2}) = ${3}'},
    {caption: '!protect', snippet: '!protect(${1})'},
    {caption: '!hide', snippet: '!hide(${1}, ${2}, ${3}, ${4})'},
    {caption: '!replaceImage', snippet: '!replaceImage(${1}) = ${2}'},
    {caption: '!overwriteHTML', snippet: '!overwriteHTML(${1}, ${2}) = ${3}'},
    {caption: '!overwritePage', snippet: '!overwritePage(${1}, ${2}) = ${3}'},
    {caption: '!delayUrl', snippet: '!delayUrl(${1}) = ${2}'},
    {caption: '!blockUrl', snippet: '!blockUrl(${1})'},
    {caption: '!redirectUrl', snippet: '!redirectUrl(${1}) = ${2}'},
    {caption: '!replaceNeighbor', snippet: '!replaceNeighbor(${1}, ${2}, ${3}, ${4}) = ${5}'},
    {caption: '!insertBefore', snippet: '!insertBefore(${1}, ${2}, ${3}) = ${4}'},
    {caption: '!insertAfter', snippet: '!insertAfter(${1}, ${2}, ${3}) = ${4}'}
  ].sort()

  let nsCmds = {
    'appdynamics': [
      {caption: '!replaceFlowmapIcon', snippet: '!replaceFlowmapIcon(${1}) = ${2}'},
      {caption: '!hideApplication', snippet: '!hideApplication(${1})'},
      {caption: '!hideBusinessTransaction', snippet: '!hideBusinessTransaction(${1})'},
      {caption: '!hideDatabase', snippet: '!hideDatabase(${1})'},
      {caption: '!hideBrowserApplication', snippet: '!hideBrowserApplication(${1})'},
      {caption: '!hideMobileApplication', snippet: '!hideMobileApplication(${1})'},
      {caption: '!hideBusinessJourney', snippet: '!hideBusinessJourney(${1})'},
      {caption: '!hideAnalyticsSearch', snippet: '!hideAnalyticsSearch(${1})'},
      {caption: '!hideRemoteService', snippet: '!hideRemoteService(${1})'},
      {caption: '!replaceFlowmapConnection', snippet: '!replaceFlowmapConnection(${1}, ${2}, ${3:false}) = ${4}'},
      {caption: '!hideFlowmapConnection', snippet: '!hideFlowmapConnection(${1}, ${2})'},
      {caption: '!replaceMobileScreenshot', snippet: '!replaceMobileScreenshot(${1}) = ${2}'},
      {caption: '!replaceNodeCount', snippet: '!replaceNodeCount(${1}) = ${2}'},
      {caption: '!recolorDashboard', snippet: '!recolorDashboard(${1}, ${2}) = ${3}'},
      {caption: '!setDashboardBackground', snippet: '!setDashboardBackground(${1}) = ${2}'}
    ].sort()
  }

  // Build auto completion for all options
  const options = [
    {caption: '@include', snippet: '@include[] = ${1}'}, /* , docText: 'TBD' */
    {caption: '@exclude', snippet: '@exclude[] = ${1}'},
    {caption: '@namespace', snippet: '@namespace[] = ${1}'},
    {caption: '@blacklist', snippet: '@blacklist[] = ${1}'},
    {caption: '@whitelist', snippet: '@whitelist[] = ${1}'},
    {caption: '@author', snippet: '@author[] = ${1}'},
    {caption: '@template', snippet: '@template\n'},
    {caption: '@deprecated', snippet: '@deprecated\n'}
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
      let ranges = editor.selection.getAllRanges()
      for (let i = 0, range; i < ranges.length; i++) {
        range = ranges[i]
        range.start.column -= editor.completer.completions.filterText.length
        editor.session.remove(range)
      }
    }
    let content = getRepository().findByName(data.configName).rawContent
    if (content.includes('@template')) {
      snippetManager.insertSnippet(editor, content)
    } else {
      editor.execCommand('insertstring', content)
    }
  }

  langTools.setCompleters([{
    identifierRegexps: [/[a-zA-Z_0-9$!%/@+\-\u00A2-\uFFFF]/],
    getCompletions: function (editor, session, pos, prefix, callback) {
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
        // Capture namespaces for the auto completion
        const varPattern = /^(\$[^=;# ]*)\s*=\s*(.*)$/mg
        let match
        let variables = []
        while ((match = varPattern.exec(editor.getValue()))) {
          variables.push({caption: match[1] + ' = ' + match[2], value: match[1], meta: 'variable'})
        }
        callback(null, variables)
      } else if (prefix.startsWith('@') && pos.column - prefix.length === 0) {
        callback(null, options)
      } else if (prefix.startsWith('!') && pos.column - prefix.length === 0) {
        // Capture namespaces for the auto completion
        const nsPattern = /^@namespace(?:\[\])?\s*=\s*(.*)$/mg
        let match
        let namespaces = []
        while ((match = nsPattern.exec(editor.getValue()))) {
          namespaces.push(match[1])
        }
        Object.keys(nsCmds).forEach(key => {
          if (namespaces.includes(key)) {
            cmds = cmds.concat(nsCmds[key])
          } else {
            cmds = cmds.concat(nsCmds[key].map(c => {
              return {...c, caption: c.caption.replace(/^!/, `!${key}.`)}
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
      }
    }
  }])
}

export default autocomplete
