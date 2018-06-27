import React from 'react'
import PropTypes from 'prop-types'

class Pane extends React.Component {
  static propTypes = {
    children: PropTypes.any
  }

  render() {
    return (
      <div className="tabs__pane">
        {this.props.children}
      </div>
    )
  }
}

export default Pane
