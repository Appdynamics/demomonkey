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
    target.add(function (url, response, context, match) {
      const link = document.createElement('a')
      link.href = url
      if (match(url, context.urlPattern) || match(link.href, context.urlPattern)) {
        if (context.search === false) {
          return context.replace
        }

        return response.replace(context.search, context.replace)
      }
      return response
    }, { urlPattern: this.urlPattern, search: this.search, replace: this.replace })

    return false
  }
}

export default ReplaceAjaxResponse
