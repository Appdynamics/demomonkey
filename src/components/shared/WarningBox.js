import React from 'react'
import PropTypes from 'prop-types'

class WarningBox extends React.Component {
  static propTypes = {
    onDismiss: PropTypes.func.isRequired,
    onRequestExtendedPermissions: PropTypes.func.isRequired
  }

  grantPermission(e) {
    e.preventDefault()
    this.props.onRequestExtendedPermissions()
  }

  dismiss(e) {
    e.preventDefault()
    this.props.onDismiss()
  }

  render() {
    return (
      <div className="warning-box fixed">
        <b>Warning:</b> For DemoMonkey to work optimal you have to grant permissions to access all websites. <a href="#" onClick={e => this.grantPermission(e)}>Click here</a> to grant that permission or <a href="#" onClick={(e) => this.dismiss(e)}> dismiss</a> this warning and give access to DemoMonkey on demand. (<a href="https://developer.chrome.com/extensions/permission_warnings" target="_blank" rel="noopener noreferrer">Learn more about site access</a>)
      </div>
    )
  }
}

export default WarningBox
