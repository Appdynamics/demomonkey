class Variable {
  constructor(name, placeholder, description, owner = '') {
    this.name = name
    this.value = placeholder
    this.description = description
    this.owner = owner
    this.id = this.owner === '' ? this.name : this.owner + '::' + this.name
  }

  bind(value) {
    return new Variable(this.name, typeof value === 'string' ? value : this.value, this.description, this.owner)
  }

  apply(value) {
    if (typeof value === 'string') {
      return value.replace('$' + this.name, this.value).replace('${' + this.name + '}', this.value)
    }
    return value
  }
}

export default Variable
