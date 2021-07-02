import React from 'react'
import marked from 'marked'
import hljs from 'highlight.js'

class Help extends React.Component {
  render() {
    /*
    const readme = require('../../../USAGE.md')
    const converter = new showdown.Converter({
      prefixHeaderId: 'welcome ',
      ghCompatibleHeaderId: true,
      simplifiedAutoLink: true
    })

    const html = converter.makeHtml(readme)
    */

    const usage = require('../../../USAGE.md')
    const html = marked(usage, {
      gfm: true,
      headerIds: true,
      highlight: (code, lang) => {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext'
        console.log(lang, language);
        return hljs.highlight(code, { language }).value
      }
    })

    return (
      <div className="content">
        <div className="welcome" dangerouslySetInnerHTML={{ __html: html }}></div>
      </div>
    )
  }
}

export default Help
