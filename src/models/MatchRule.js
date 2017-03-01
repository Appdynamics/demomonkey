class MatchRule {

  constructor(includes = [], excludes = []) {
    this.includes = includes;
    this.excludes = excludes;
  }

  test(str) {

        var included = this.includes.length < 1 || this.includes.reduce(function(carry, pattern) {
            return carry || (new RegExp(pattern.substr(1, pattern.length - 2))).test(str);
        }, false);

        var excluded = this.excludes.length > 0 && (this.excludes.reduce(function(carry, pattern) {
            return carry || (new RegExp(pattern.substr(1, pattern.length - 2))).test(str);
        }, false));

        return included && !excluded;
  }

}

export default MatchRule
