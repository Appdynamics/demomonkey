class UndoElement {
  constructor(target, key, original, replacement) {
    this.target = target
    this.key = key
    this.original = original
    this.replacement = replacement
  }

  apply() {
    if (this.target[this.key] === this.replacement) {
      this.target[this.key] = this.original
      return true
    }
    return false
  }
}

export default UndoElement
