import React from 'react'
import PropTypes from 'prop-types'
import TimeAgo from 'react-timeago'

class Logs extends React.Component {
  static propTypes = {
    entries: PropTypes.arrayOf(PropTypes.object).isRequired
  }

  renderElement(m) {
    if (typeof m === 'object' && m.fromError === true) {
      return <span title={m.stack}><b>{m.name}:</b> {m.message}</span>
    }
    return m
  }

  openTab(event, tabId) {
    event.preventDefault()
    window.chrome.tabs.update(tabId, { active: true, highlighted: true })
  }

  renderTabButton(tabId) {
    if (!tabId) {
      return ''
    }
    return (<a href="#" onClick={(event) => this.openTab(event, tabId)}>Open Tab</a>)
  }

  render() {
    window.entries = this.props.entries
    return (
      <div className="content">
        <div className="logs">
          <h1>Logs</h1>
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Source</th>
                <th>Level</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              { this.props.entries.slice().reverse().map(({ timestamp, source, level, message, tabId, repeated }, index) => {
                return <tr key={index} className={`row-${level}`}>
                  <td><TimeAgo date={timestamp} minPeriod="60" /></td>
                  <td>{source} {this.renderTabButton(tabId)}</td>
                  <td>{level}</td>
                  <td>
                    {message.map((m, k) => {
                      return <span key={k}>{this.renderElement(m)} </span>
                    })}<i>{ repeated > 0 ? ` (message repeated ${repeated} times)` : ''}</i>
                  </td>
                </tr>
              }) }
            </tbody>
          </table>
        </div>
      </div>)
  }
}

export default Logs
