import Command from './Command'

class Group extends Command {
  constructor(locationFilter = '', cssFilter = '', thenCmd, location) {
    super()
    this.locationFilter = locationFilter
    this.cssFilter = cssFilter
    this.thenCmd = thenCmd
    this.location = location
  }

  isApplicableForGroup(group) {
    return this.thenCmd.isApplicableForGroup(group)
  }

  /* Copy From OverwriteHTML, move to Command in a later stage */
  _checkLocation() {
    return typeof this.location === 'object' &&
      this.location.toString().includes(this.locationFilter)
  }

  /* This code is also an improvement for SearchAndReplace, might need to update */
  _checkCss(target) {
    if (this.cssFilter === '' || typeof target !== 'object' || typeof target.nodeType !== 'number') {
      return true
    }

    // For text nodes we check css on the parent node
    if (target.nodeType === 3) {
      return this._checkCss(target.parentNode)
    } else if (typeof target.matches === 'function') {
      return target.matches(this.cssFilter)
    }
    return false
  }

  apply(target, key) {
    if (!this._checkLocation() || !this._checkCss(target)) {
      return false
    }

    return this.thenCmd.apply(target, key)
  }
}

export default Group
