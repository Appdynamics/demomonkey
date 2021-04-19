import Command from './Command'

class ReplaceAjaxResponse extends Command {
  constructor(urlPattern, search = false, replace) {
    super()
    this.urlPattern = urlPattern
    this.search = search
    this.replace = replace
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
    target.add('replaceAjaxResponse', { urlPattern: this.urlPattern, search: this.search, replace: this.replace })
    return false
  }
}

export default ReplaceAjaxResponse
