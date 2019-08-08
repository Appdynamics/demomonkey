class MatchRule {
  constructor(includes = [], excludes = []) {
    this.includes = includes
    this.excludes = excludes
  }

  _testString(pattern, str) {
    if (pattern.startsWith('/') && pattern.endsWith('/')) {
      return (new RegExp(pattern.substr(1, pattern.length - 2))).test(str)
    }
    return str.includes(pattern)
  }

  _reducer(set, str) {
    return set.reduce((carry, pattern) => {
      try {
        return carry || this._testString(pattern, str)
      } catch (e) {
        return carry
      }
    }, false)
  }

  test(str) {
    var included = this.includes.length < 1 || this._reducer(this.includes, str)

    var excluded = this.excludes.length > 0 && this._reducer(this.excludes, str)

    return included && !excluded
  }
}

export default MatchRule
