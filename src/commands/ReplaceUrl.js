import Command from './Command'

class ReplaceUrl extends Command {
  constructor(search, replace) {
    super()
    this.search = search
    this.replace = replace
    this.id = this.search + '-replace-' + this.replace
  }

  isApplicableForGroup(group) {
    return group === 'url' || group === '*'
  }

  apply(target, key = 'value') {
    target.add({
      id: this.id,
      url: this.search,
      action: 'replace',
      options: { replace: this.replace }
    })

    return {
      apply: () => {
        console.log('Undo')
        target.remove(this.id)
        return true
      }
    }
  }
}

export default ReplaceUrl
