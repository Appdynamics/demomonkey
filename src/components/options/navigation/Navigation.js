import React from 'react'
import PropTypes from 'prop-types'
import NavigationHeader from './NavigationHeader'
import navigationTheme from './NavigationTheme'
import ItemHeader from './ItemHeader'
import merge from 'deepmerge'
import ErrorBox from '../../shared/ErrorBox'

// import NavigationItem from './NavigationItem'
import { Treebeard, decorators } from 'react-treebeard'

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
    active: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
    onUpload: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onDownloadAll: PropTypes.func.isRequired
  }

  // This implementation is not very performant
  // Probably in the long run, the underyling datamodel needs to be changed
  static buildTree(items, state) {
    var tree = []
    var cursor = {}
    items.forEach((orig, index) => {
      var item = Object.assign({}, orig)
      if (item.name.toLowerCase().indexOf(state.search) === -1) {
        return
      }
      var currentIsActive = state.active === item.id
      if (currentIsActive) {
        item.active = true
        cursor = item
      }
      item.nodeType = 'item'
      var path = ('./' + item.name).split('/')
      item.name = path.pop()
      var sub = path.reverse().reduce((acc, dir, index) => {
        var id = '/' + path.slice(index, -1).join('/')
        var result = {
          name: dir,
          nodeType: 'directory',
          id: id,
          children: [acc]
        }
        // This is required, since the merge might prefer a false from a previous element
        if (currentIsActive || state.toggled[id]) {
          result.toggled = true
        }
        return result
      }, item)
      tree = merge(tree, sub.children, { arrayMerge: arrayMerge })
    })
    return { tree, cursor }
  }

  constructor(props) {
    super(props)
    var { tree, cursor } = Navigation.buildTree(this.props.items, { active: props.active, search: '', toggled: {} })
    this.state = {
      data: tree,
      cursor: cursor,
      active: props.active,
      toggled: {},
      search: ''
    }
    this.onToggle = this.onToggle.bind(this)
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    var { tree, cursor } = Navigation.buildTree(nextProps.items, { ...prevState, active: nextProps.active })
    return { data: tree, cursor: cursor }
  }

  handleClick(id) {
    this.props.onNavigate('configuration/' + id)
  }

  handleSearchUpdate(event) {
    this.setState({ search: event.target.value.toLowerCase() }, function () {
      var { tree, cursor } = Navigation.buildTree(this.props.items, this.state)
      this.setState({ data: tree, cursor: cursor })
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
      this.setState({ toggled: s })
    } else {
      this.handleClick(node.id)
    }
    this.setState({ cursor: node, active: node.id })
  }

  onDelete(event, node) {
    event.preventDefault()
    this.props.onDelete(node)
  }

  _safeRenderTree() {
    try {
      return <Treebeard style={navigationTheme} decorators={decorators} data={this.state.data} onToggle={this.onToggle} />
    } catch (e) {
      return <ErrorBox error={e} />
    }
  }

  render() {
    decorators.Header = (props) => {
      return <ItemHeader style={props.style} node={props.node} onDelete={(event, node) => this.onDelete(event, node)} />
    }

    return (
      <div>
        <div className="navigation-header">
          <NavigationHeader onUpload={this.props.onUpload} onDownloadAll={this.props.onDownloadAll} onNavigate={this.props.onNavigate} />
          <input type="text" onChange={(event) => this.handleSearchUpdate(event)} value={this.state.search} placeholder="Search..." className="searchBox" />
        </div>
        <div className="tree items">
          {this._safeRenderTree()}
        </div>
      </div>
    )
  }
}

export default Navigation
