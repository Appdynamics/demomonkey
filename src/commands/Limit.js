import Command from './Command'

class Limit extends Command {
  constructor(other, count = 1, skip = 0) {
    super()
    this.count = count
    this.other = other
    this.skip = skip
  }

  isApplicableForGroup(group) {
    return this.other.isApplicableForGroup(group)
  }

  apply(target, key) {
    if (this.skip > 0) {
      this.skip--
      return false
    }
    if (this.count > 0) {
      const r = this.other.apply(target, key)
      this.count = r === false ? this.count : this.count - 1
      return r
    }
    return false
  }
}

export default Limit
