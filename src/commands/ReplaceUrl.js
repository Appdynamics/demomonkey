import Command from './Command'

class ReplaceUrl extends Command {
  constructor(search, replace, type = '*', includeRules, excludeRules) {
    super()
    this.search = search
    this.replace = replace
    this.type = type
    this.includeRules = includeRules
    this.excludeRules = excludeRules
    this.id = this.search + '-replace-' + this.replace + '-type-' + this.type + '-includes-' + this.includeRules.join('--') + '-excludes-' + this.excludeRules.join('--')
  }

  isApplicableForGroup(group) {
    return group === 'url' || group === '*'
  }

  isAvailable(featureFlags) {
    return featureFlags.webRequestHook === true
  }

  getRequiredFlags() {
    return 'Hook into Web Requests'
  }

  apply(target, key = 'value') {
    target.add({
      id: this.id,
      url: this.search,
      action: 'replace',
      type: this.type,
      options: { replace: this.replace },
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

export default ReplaceUrl
