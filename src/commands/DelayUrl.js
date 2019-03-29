import Command from './Command'

class DelayUrl extends Command {
  constructor(search, delay) {
    super()
    this.search = search
    this.delay = delay
    this.id = this.search + '-delay-' + this.delay
  }

  isApplicableForGroup(group) {
    return group === 'url' || group === '*'
  }

  apply(target, key = 'value') {
    target.add({
      id: this.id,
      url: this.search,
      action: 'delay',
      options: { delay: this.delay }
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

export default DelayUrl
