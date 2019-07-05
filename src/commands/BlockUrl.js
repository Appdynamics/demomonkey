import Command from './Command'

class BlockUrl extends Command {
  constructor(search, type = '*', includeRules, excludeRules) {
    super()
    this.search = search
    this.type = type
    this.includeRules = includeRules
    this.excludeRules = excludeRules
    this.id = this.search + '-block' + '-type-' + this.type + '-includes-' + this.includeRules.join('--') + '-excludes-' + this.excludeRules.join('--')
  }

  isApplicableForGroup(group) {
    return group === 'url' || group === '*'
  }

  apply(target, key = 'value') {
    target.add({
      id: this.id,
      url: this.search,
      type: this.type,
      action: 'block',
      options: {},
      includeRules: this.includeRules,
      excludeRules: this.excludeRules
    })

    return {
      target: target,
      apply: () => {
        target.remove(this.id)
        return true
      }
    }
  }
}

export default BlockUrl
