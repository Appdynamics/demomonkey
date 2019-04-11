import Command from './Command'

class BlockUrl extends Command {
  constructor(search, type = '*') {
    super()
    this.search = search
    this.type = type
    this.id = this.search + '-block' + '-type-' + this.type
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
      options: {}
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

export default BlockUrl
