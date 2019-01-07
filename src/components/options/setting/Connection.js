import React from 'react'
import PropTypes from 'prop-types'

class Connection extends React.Component {
  static propTypes = {
    connection: PropTypes.object.isRequired,
    saveConnection: PropTypes.func.isRequired,
    deleteConnection: PropTypes.func
  }

  constructor(props) {
    super(props)
    this.state = {
      label: props.connection.label,
      url: props.connection.url,
      origLabel: props.connection.label,
      origUrl: props.connection.url
    }
  }

  _handleUpdate(property, newValue) {
    this.setState({
      [property]: newValue
    })
  }

  _hasUnsavedChanges() {
    return this.state.label !== this.state.origLabel || this.state.url !== this.state.origUrl
  }

  _save() {
    this.props.saveConnection(this.state.url, this.state.label).then((saved) => {
      if (saved) {
        this.setState({
          origLabel: this.state.label,
          origUrl: this.state.url
        })
      }
    })
  }

  render() {
    return <tr style={{backgroundColor: this._hasUnsavedChanges() ? '#eeeeff' : null}}>
      <td>
        <input onChange={(e) => this._handleUpdate('url', e.target.value)} value={this.state.url} style={{width: '300px'}} />
      </td>
      <td>
        <input onChange={(e) => this._handleUpdate('label', e.target.value)} value={this.state.label} style={{width: '100px'}} />
      </td>
      <td>
        <button onClick={(e) => this._save()} style={{backgroundColor: this._hasUnsavedChanges() ? '#ccccff' : null}}>Save</button>
        { this.props.deleteConnection ? <button onClick={(e) => this.props.deleteConnection()}>Delete</button> : '' }
      </td>
    </tr>
  }
}

export default Connection
