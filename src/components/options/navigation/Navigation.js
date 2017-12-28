import React from 'react'
import PropTypes from 'prop-types'
import NavigationHeader from './NavigationHeader'
import navigationTheme from './NavigationTheme'
import ItemHeader from './ItemHeader'
import merge from 'deepmerge'

// import NavigationItem from './NavigationItem'
import { Treebeard, decorators } from 'react-treebeard'

decorators.Header = ItemHeader

function arrayMerge(dst, src, opt) {
  var i = dst.findIndex((e) => e.name === src[0].name && e.nodeType === src[0].nodeType && e.nodeType === 'directory')
  if (i !== -1) {
    dst[i] = merge(dst[i], src[0], { arrayMerge: arrayMerge })
  } else {
    dst = dst.concat(src)
  }
  return dst.sort((a, b) => {
    return (a.name.toLowerCase() < b.name.toLowerCase()) ? -1 : 1
  })
}

class Navigation extends React.Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.object).isRequired,
    onNavigate: PropTypes.func.isRequired,
    onUpload: PropTypes.func.isRequired
  }

  // This implementation is not very performant
  // Probably in the long run, the underyling datamodel needs to be changed
  buildTree(items, state) {
    var tree = []

    console.log(state)

    items.forEach((orig, index) => {
      var item = Object.assign({}, orig)
      if (item.name.toLowerCase().indexOf(state.search) === -1) {
        return
      }
      item.active = state.active === item.id
      item.nodeType = 'item'
      var path = ('./' + item.name).split('/')
      item.name = path.pop()
      var sub = path.reverse().reduce((acc, dir, index) => {
        var id = '/' + path.slice(index, -1).join('/')
        return {name: dir, nodeType: 'directory', id: id, toggled: state.toggled[id], children: [acc]}
      }, item)
      tree = merge(tree, sub.children, { arrayMerge: arrayMerge })
    })
    return tree
  }

  constructor(props) {
    super(props)
    this.state = {
      data: this.buildTree(this.props.items, {active: false, search: '', toggled: {}}),
      active: false,
      toggled: {},
      search: ''
    }
    this.onToggle = this.onToggle.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ data: this.buildTree(nextProps.items, this.state) })
  }

  handleClick(id) {
    this.props.onNavigate('configuration/' + id)
  }

  handleSearchUpdate(event) {
    this.setState({ search: event.target.value.toLowerCase() }, function () {
      this.setState({ data: this.buildTree(this.props.items, this.state) })
    })
  }

  onToggle(node, toggled) {
    const cursor = this.state.cursor
    if (cursor) {
      cursor.active = false
    }
    node.active = true
    if (node.children) {
      node.toggled = toggled
      var s = this.state.toggled
      s[node.id] = toggled
      this.setState({toggled: s})
    } else {
      this.handleClick(node.id)
    }
    this.setState({ cursor: node, active: node.id })
  }

  render() {
    /* <ul className='items'>
      <li></li>
      {Object.keys(this.props.items).map((key, index) => {
        var config = this.props.items[key]
        return <NavigationItem key={index} item={config} onClick={(id) => this.handleClick(id)} search={this.state.search} />
      })}
    </ul> */

    return (
      <div>
        <NavigationHeader onUpload={this.props.onUpload} onNavigate={this.props.onNavigate} />
        <input type="text" onChange={(event) => this.handleSearchUpdate(event)} value={this.state.search} placeholder="Search..." className="searchBox" />
        <div className="tree items">
          <Treebeard style={navigationTheme} decorators={decorators} data={this.state.data} onToggle={this.onToggle} />
        </div>
      </div>
    )
  }
}

export default Navigation
