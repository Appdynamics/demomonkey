import React from 'react'
import PropTypes from 'prop-types'

class Page extends React.Component {
  static propTypes = {
    children: PropTypes.any,
    className: PropTypes.string,
    syncDarkMode: PropTypes.bool.isRequired,
    preferDarkMode: PropTypes.bool.isRequired
  }

  render() {
    if (this.props.syncDarkMode) {
      document.documentElement.classList.remove('dark-mode')
      document.documentElement.classList.remove('light-mode')
    } else if (this.props.preferDarkMode) {
      document.documentElement.classList.add('dark-mode')
      document.documentElement.classList.remove('light-mode')
    } else {
      document.documentElement.classList.remove('dark-mode')
      document.documentElement.classList.add('light-mode')
    }
    return (
      <div className={this.props.className}>
        {this.props.children}
      </div>
    )
  }
}

export default Page
