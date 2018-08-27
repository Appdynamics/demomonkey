import React from 'react'
import PropTypes from 'prop-types'
import Select from 'react-select'

class RepoList extends React.Component {
  static propTypes = {
    repositories: PropTypes.arrayOf(PropTypes.object).isRequired,
    selected: PropTypes.arrayOf(PropTypes.object).isRequired,
    onSelect: PropTypes.func.isRequired
  }

  render() {
    return <Select placeholder="Select repositories..."
      multi
      name="repos"
      value={this.props.selected}
      onChange={(selected) => this.props.onSelect(selected)}
      options={this.props.repositories}
    />
  }
}

export default RepoList
