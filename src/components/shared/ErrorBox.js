import React from 'react'
import PropTypes from 'prop-types'

class ErrorBox extends React.Component {
  static propTypes = {
    error: PropTypes.object
  }

  render() {
    const e = this.props.error
    console.log(e)
    return (
      <div className="error-box">
        <div className="error-title">Oops! Something went wrong: </div>
        <div className="error-message">Message: { e.message }</div>
        <div className="error-details"><pre>{ e.stack }</pre></div>
        <div className="error-report">
          <a href={`https://github.com/Appdynamics/demomonkey/issues/new?title=${e.message}&body=${e.stack}`} target="blank" rel="noopener noreferer">Report Issue.</a>
        </div>
      </div>
    )
  }
}

export default ErrorBox
