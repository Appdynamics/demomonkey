class Pattern {

    constructor(search, replace) {
        this.pattern = this._build(search,replace)
    }

    apply(target) {
      return target.replace(this.pattern[0], this.pattern[1]);
    }

    toString() {
      return this.pattern[0].toString()+'/'+this.pattern[1].toString();
    }

    _build(search, replace) {

        var regex = search.match(/^\/(.+)\/([gimp]+)?$/)

        if (!regex) {
            return [
                // .replace(...) escapes the regular expression
                new RegExp(search.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), "g"),
                replace
            ];
        }

        var modifiers = "undefined" !== typeof regex[2]
            ? regex[2] + "g"
            : "g";

        if (modifiers.includes("p")) {
            return [
                new RegExp(regex[1], modifiers.replace("p", "")),
                function(match) {
                    if (match.toUpperCase() === match) {
                        replace = replace.toUpperCase();
                    }
                    if (match.toLowerCase() === match) {
                        replace = replace.toLowerCase();
                    }
                    return match.replace(new RegExp(regex[1], modifiers.replace("p", "")), replace);
                }
            ];
        }

        return [
            new RegExp(regex[1], modifiers),
            replace
        ];
    }

}

export default Pattern
