function autocomplete(langTools, repository) {
  langTools.setCompleters([{
    identifierRegexps: [/[a-zA-Z_0-9$!%/@+\-\u00A2-\uFFFF]/],
    getCompletions: function (editor, session, pos, prefix, callback) {
      if (prefix.startsWith('%') && pos.column - prefix.length === 0) {
        const insertMatch = (editor, data) => {
          if (editor.completer.completions.filterText) {
            let ranges = editor.selection.getAllRanges()
            for (let i = 0, range; i < ranges.length; i++) {
              range = ranges[i]
              range.start.column -= editor.completer.completions.filterText.length
              editor.session.remove(range)
            }
          }
          editor.execCommand('insertstring', repository.findByName(data.configName).rawContent)
        }
        callback(null, repository.getNames().sort().map(c => {
          return {
            value: '%' + c,
            meta: 'include',
            configName: c,
            completer: {
              insertMatch
            }
          }
        }))
      }
      if (prefix.startsWith('+') && pos.column - prefix.length === 0) {
        callback(null, repository.getNames().sort().map(c => { return { caption: '+' + c, value: '+' + c, meta: 'include' } }))
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
        const options = [
          '@include[]',
          '@exclude[]',
          '@namespace[]',
          '@blacklist[]',
          '@whitelist[]',
          '@template',
          '@deprecated',
          '@author[]'
        ].sort()

        callback(null, options.map(c => { return { caption: c, value: c + ' = ', meta: 'option' } }))
      } else if (prefix.startsWith('!') && pos.column - prefix.length === 0) {
        // Capture namespaces for the auto completion
        const nsPattern = /^@namespace(?:\[\])?\s*=\s*(.*)$/mg
        let match
        let namespaces = []
        while ((match = nsPattern.exec(editor.getValue()))) {
          namespaces.push(match[1])
        }

        let cmds = [
          '!replace(w, location)',
          '!protect(w)',
          '!hide(w, parent, css, hrer, hash)',
          '!replaceImage(src)',
          '!overwriteHTML(location, css)',
          '!overwritePage(location, title)',
          '!delayUrl(url)',
          '!blockUrl(url)',
          '!redirectUrl(url)',
          '!replaceNeighbor(w, replacement, parent, css, location)',
          '!insertBefore(w, parent, location)',
          '!insertAfter(w, parent, location)'
        ].sort()

        let nsCmds = {
          'appdynamics': [
            '!replaceFlowmapIcon(label)',
            '!hideApplication(label)',
            '!hideBusinessTransaction(label)',
            '!hideDatabase(label)',
            '!hideBrowserApplication(label)',
            '!hideMobileApplication(label)',
            '!hideBusinessJourney(label)',
            '!hideAnalyticsSearch(label)',
            '!hideRemoteService(label)',
            '!replaceFlowmapConnection(label1, label2, force)',
            '!hideFlowmapConnection(label1, label2)',
            '!replaceMobileScreenshot(view)',
            '!replaceNodeCount(nodeName)',
            '!recolorDashboard(oldColor, dashboardId)',
            '!setDashboardBackground(dasboardID)'
          ].sort()
        }

        Object.keys(nsCmds).forEach(key => {
          if (namespaces.includes(key)) {
            cmds = cmds.concat(nsCmds[key])
          } else {
            cmds = cmds.concat(nsCmds[key].map(c => c.replace(/^!/, `!${key}.`)))
          }
        })
        callback(null, cmds.map(c => { return { caption: c, value: c.split('(')[0], meta: 'commands' } }))
      }
    }
  }])
}

export default autocomplete
