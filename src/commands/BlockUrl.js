import Command from './Command'

class BlockUrl extends Command {
  constructor(search) {
    super()
    this.search = search
    this.id = this.search + '-block'
  }

  isApplicableForGroup(group) {
    return group === 'url' || group === '*'
  }

  apply(target, key = 'value') {
    /* var original = target[key]
    if (this._match(original, this.search, this.replace)) {
      target[key] = this.replace
      return new UndoElement(target, key, original, this.replace)
    }
    return false */

    target.add({
      id: this.id,
      url: this.search,
      action: 'block',
      options: {}
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

export default BlockUrl
