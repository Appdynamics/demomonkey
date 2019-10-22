class UndoElement {
  constructor(target, key, original, replacement) {
    this.target = target
    this.key = key
    this.original = original
    this.replacement = replacement
  }

  update(target, key, original, replacement) {
    this.target = target
    this.key = key
    this.original = original
    this.replacement = replacement
  }

  apply() {
    if (typeof this.target === 'undefined') {
      return false
    }

    var target = this.target
    if (typeof target === 'string' && target.startsWith('dmid-')) {
      target = document.querySelector(`[data-demo-monkey-id=${target}]`)
    }

    var key = this.key

    if (key.includes('.')) {
      var path = key.split('.')
      key = path.pop()
      // Note that there is no proper error handling, so if the path is broken, strange things can happen.
      path.forEach(k => {
        if (target && target[k]) {
          target = target[k]
        }
      })
    }

    if (target[key] === this.replacement) {
      // Fix for transform attribute of SVGElement which is read-only
      if (key === 'transform' && target instanceof SVGElement) {
        target.setAttribute(key, this.original)
      }
      target[key] = this.original
      return true
    }
    return false
  }
}

export default UndoElement
