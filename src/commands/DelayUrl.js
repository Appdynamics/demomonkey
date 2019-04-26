import Command from './Command'

class DelayUrl extends Command {
  constructor(search, delay, type = '*', includeRules, excludeRules) {
    super()
    this.search = search
    this.delay = delay
    this.type = type
    this.includeRules = includeRules
    this.excludeRules = excludeRules
    this.id = this.search + '-delay-' + this.delay + '-type-' + this.type + '-includes-' + this.includeRules.join('--') + '-excludes-' + this.excludeRules.join('--')
  }

  isApplicableForGroup(group) {
    return group === 'url' || group === '*'
  }

  apply(target, key = 'value') {
    target.add({
      id: this.id,
      url: this.search,
      action: 'delay',
      type: this.type,
      options: { delay: this.delay },
      includeRules: this.includeRules,
      excludeRules: this.excludeRules
    })

    return {
      target: target,
      apply: () => {
        console.log('Undo')
        target.remove(this.id)
        return true
      }
    }
  }
}

export default DelayUrl
