class Variable {
  constructor(name, placeholder, description) {
    this.name = name
    this.value = placeholder
    this.description = description
  }

  bind(value) {
    return new Variable(this.name, typeof value === 'string' ? value : this.value, this.description)
  }

  apply(value) {
    if (typeof value.replace === 'function') {
      return value.replace('$' + this.name, this.value).replace('${' + this.name + '}', this.value)
    }
    return value
  }
}

export default Variable
