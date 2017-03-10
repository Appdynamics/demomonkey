import Command from './Command'

class SearchAndReplace extends Command {
  constructor(search, replace) {
    super()
    this.search = search
    this.replace = replace
  }

  apply(target) {
    return target.replace(this.search, this.replace)
  }

  toString() {
    return this.search.toString() + '/' + this.replace.toString()
  }
}

export default SearchAndReplace
