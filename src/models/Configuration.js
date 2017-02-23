import ini from 'ini';
import Pattern from './Pattern';
import MatchRule from './MatchRule';

class Configuration {

    constructor(iniFile, enabled = true) {
        this.iniFile = iniFile;
        this.content = iniFile
            ? ini.parse(iniFile)
            : [];
        this.patterns = false;
        this.enabled = enabled;
    }

    isEnabledForUrl(url) {
        if (!this.enabled) {
            return false;
        }
        var options = this.getOptions();
        return new MatchRule(options.include, options.exclude).test(url)
    }

    apply(node, key = "value") {
        this._getConfiguration().forEach(function(pattern) {
            node[key] = pattern.apply(node[key])
        });
    }

    getOptions() {
        var filterOption = function(content) {
            return function(result, key) {
                // By default ini.parse sets "true" as the value
                if (key.charAt(0) == '@' && content[key] !== true) {

                    var value = content[key];

                    if ("string" === typeof value) {
                        value = [value];
                    }

                    result[key.substring(1)] = value;
                    return result;
                }

                if ("object" === typeof content[key] && null !== content[key]) {
                    //return result.concat();
                    return Object.keys(content[key]).reduce(filterOption(content[key]), result);
                }

                return result;
            }
        };

        return Object.keys(this.content).reduce(filterOption(this.content), {});
    }

    getVariables() {
        var filterVariable = function(content) {
            return function(result, key) {
                // By default ini.parse sets "true" as the value
                if (key.charAt(0) == '$' && content[key] !== true) {
                    var t = content[key].split("//");
                    result.push({
                        name: key.substring(1),
                        placeholder: t[0],
                        description: t[1]
                            ? t[1]
                            : ''
                    });
                    return result;
                }

                if ("object" === typeof content[key] && null !== content[key]) {
                    return result.concat(Object.keys(content[key]).reduce(filterVariable(content[key]), []));
                }

                return result;
            }
        };

        return Object.keys(this.content).reduce(filterVariable(this.content), []);
    }

    _getConfiguration() {

        if (this.patterns == false) {

            // get all variables upfront
            var variables = this.getVariables();

            var filterConfiguration = function(content) {
                return function(result, key) {
                    // skip all variables
                      if (key.charAt(0) == '$' || key.charAt(0) == '@' || key.charAt(0) == '+') {
                        return result;
                    }

                    // skip true
                    if (true === content[key]) {
                        return result;
                    }

                    if ("object" === typeof content[key] && null !== content[key]) {
                        return result.concat(Object.keys(content[key]).reduce(filterConfiguration(content[key]), []));
                    }

                    var value = variables.reduce(function(value, variable) {
                        return value.replace("$" + variable.name, variable.placeholder)
                    }, content[key])

                    //result.push(buildRegex(key, value));
                    result.push(new Pattern(key, value));

                    return result
                }
            }

            this.patterns = Object.keys(this.content).reduce(filterConfiguration(this.content), []);

        }

        return this.patterns;
    }
}

export default Configuration
