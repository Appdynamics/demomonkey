import Command from './Command'

class ReplaceAjaxResponse extends Command {
  constructor(urlPattern, patch) {
    super()
    this.urlPattern = urlPattern
    this.patch = patch
  }

  isApplicableForGroup(group) {
    return group === 'ajax' || group === '*'
  }

  isAvailable(featureFlags) {
    return featureFlags.hookIntoAjax === true
  }

  getRequiredFlags() {
    return 'Hook into Ajax'
  }

  apply(target, key) {
    target.add('patchAjaxResponse', { urlPattern: this.urlPattern, patch: this.patch })
    return false
  }
}

export default ReplaceAjaxResponse
