import React from 'react'

class Pane extends React.Component {
  static propTypes = {
    children: React.PropTypes.any.isRequired
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
