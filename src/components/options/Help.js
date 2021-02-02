import React from 'react'
import showdown from 'showdown'

class Help extends React.Component {
  render() {
    const readme = require('../../../USAGE.md')
    const converter = new showdown.Converter({
      prefixHeaderId: 'welcome ',
      ghCompatibleHeaderId: true,
      simplifiedAutoLink: true
    })

    const html = converter.makeHtml(readme)

    return (
      <div className="content">
        <div className="welcome" dangerouslySetInnerHTML={{ __html: html }}></div>
      </div>
    )
  }
}

export default Help
