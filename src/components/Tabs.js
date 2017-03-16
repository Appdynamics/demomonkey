import React from 'react'

class Tabs extends React.Component {
  static propTypes = {
    children: React.PropTypes.arrayOf(React.PropTypes.object).isRequired
  }

  constructor(props) {
    super(props)
    this.state = {
      selected: 0
    }
  }

  _renderContent() {
    return (
      <div className="tabs__content">
                {this.props.children[this.state.selected]}
            </div>
    )
  }

  handleClick(index, event) {
    event.preventDefault()
    this.setState({ selected: index })
  }

  _renderTitles() {
    function labels(child, index) {
      if (child.props.link) {
        return <li key={index}><a className="link" href="#" onClick={child.props.link}>{child.props.label}</a></li>
      } else {
        let activeClass = (this.state.selected === index ? 'active' : '')
        return (
          <li key={index} id={child.props.id}>
                        <a href="#" className={activeClass} onClick={this.handleClick.bind(this, index)}>
                            {child.props.label}
                        </a>
                    </li>
        )
      }
    }

    return (
      <ul className="tabs__labels">
                {this.props.children.map(labels.bind(this))}
            </ul>
    )
  }

  render() {
    return (
      <div className="tabs">
                {this._renderTitles()}
                {this._renderContent()}
            </div>
    )
  }
}

export default Tabs
