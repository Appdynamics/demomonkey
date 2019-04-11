import Command from './Command'

class ReplaceUrl extends Command {
  constructor(search, replace, type = '*') {
    super()
    this.search = search
    this.replace = replace
    this.type = type
    this.id = this.search + '-replace-' + this.replace + '-type-' + this.type
  }

  isApplicableForGroup(group) {
    return group === 'url' || group === '*'
  }

  apply(target, key = 'value') {
    target.add({
      id: this.id,
      url: this.search,
      action: 'replace',
      type: this.type,
      options: { replace: this.replace }
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

export default ReplaceUrl
