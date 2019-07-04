import Command from './Command'

// !eval(group)
class Eval extends Command {
  constructor(group = '*') {
    super()
    this.group = group
  }

  isApplicableForGroup(group) {
    return group === this.group
  }

  apply(target, key = 'value') {
    return false
  }
}

export default Eval
