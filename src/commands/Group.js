import Command from './Command'

class Group extends Command {
  constructor(helpers) {
    super()
    this.helpers = helpers
  }

  isApplicableForGroup(group) {
    return this.helpers.reduce((acc, cmd) => {
      return acc && cmd.isApplicableForGroup(group)
    }, true)
  }

  apply(node, key) {
    return this.helpers.reduce((acc, cmd) => {
      const r = cmd.apply(node, key)
      if (r === false) {
        return acc
      }
      return acc.concat(r)
    }, [])
  }
}

export default Group
