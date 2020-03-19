import React from 'react'
import PropTypes from 'prop-types'

class AccessControl extends React.Component {
  static propTypes = {
    for: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object
    ]).isRequired
  }

  renderHelpText() {
    return <React.Fragment>Configure access control rules to give other user groups access to your configurations.</React.Fragment>
  }

  renderTable() {
    return (
      <table style={{ marginTop: '8px' }}>
        <thead>
          <tr>
            <th>
            Group
            </th>
            <th>
            View
            </th>
            <th>
            Edit
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <input type="text" placeholder="Add a Group" />
              <button>Add</button>
            </td>
            <td>

            </td>
            <td>

            </td>
          </tr>
        </tbody>
      </table>
    )
  }

  renderForDirectory() {
    return (
      <div className="content">
        <div className="accessControl">
          <h1>Access Control for {this.props.for}</h1>
          <div>{ this.renderHelpText() } You are setting access control rules for a directory. Those rules are applied for all configurations that start with <b>{this.props.for}</b></div>
          { this.renderTable() }
        </div>
      </div>)
  }

  renderForConfiguration() {
    return (
      <div>
        <div>{ this.renderHelpText() }</div>
        { this.renderTable() }
      </div>
    )
  }

  render() {
    const isForDirectory = typeof this.props.for === 'string'

    if (isForDirectory) {
      return this.renderForDirectory()
    }
    return this.renderForConfiguration()
  }
}

export default AccessControl
