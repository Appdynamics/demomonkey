class Command {
  constructor(appliedToNodeValue = true) {
    this.appliedToNodeValue = appliedToNodeValue
  }

  isAppliedToNodeValue() {
    return this.appliedToNodeValue
  }

  apply(target) {
    return target
  }

  _walk(node, count) {
    if (count === 0) {
      return node
    }

    if (node.parentElement !== null) {
      return this._walk(node.parentElement, count - 1)
    }

    return false
  }
}

export default Command
