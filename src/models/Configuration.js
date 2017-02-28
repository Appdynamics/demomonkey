import ini from 'ini';
import Pattern from './Pattern';
import Variable from './Variable';
import MatchRule from './MatchRule';

class Configuration {

    constructor(iniFile, repository, enabled = true, values = {}) {
        this.repository = repository;
        this.content = iniFile
            ? ini.parse(iniFile)
            : [];
        this.patterns = false;
        this.enabled = enabled;
        this.values = values;
    }

    updateValues(values) {
      this.values = Object.assign(this.values, values);
      this.patterns = false;
      return this;
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

    getImports() {
        var filterImport = function(content) {
            return function(result, key) {
                if (key.charAt(0) == '+') {
                    result.push(key.substring(1));
                }

                if ("object" === typeof content[key] && null !== content[key]) {
                    return result.concat(Object.keys(content[key]).reduce(filterImport(content[key]), []));
                }

                return result;
            }
        };
        return Object.keys(this.content).reduce(filterImport(this.content), []);
    }

    getVariables() {

        var repository = this.repository;

        var filterVariable = function(content) {
            return function(result, key) {
                // By default ini.parse sets "true" as the value
                if (key.charAt(0) == '$' && content[key] !== true) {
                    var t = content[key].split("//");
                    result.push(new Variable(key.substring(1), t[0], t[1]
                        ? t[1]
                        : ''));
                    return result;
                }

                if (typeof repository == 'object' && key.charAt(0) == '+') {
                    return result.concat(repository.findByName(key.substring(1)).getVariables());
                }

                if ("object" === typeof content[key] && null !== content[key]) {
                    return result.concat(Object.keys(content[key]).reduce(filterVariable(content[key]), []));
                }

                return result;
            }
        };

        var variables = Object.keys(this.content).reduce(filterVariable(this.content), []);

        return variables.map((variable) => {
            return variable.bind(this.values[variable.name])
        });

    }

    _getConfiguration() {

        if (this.patterns == false) {

            // get all variables upfront
            var variables = this.getVariables();
            var values = this.values;
            var repository = this.repository;

            var filterConfiguration = function(content) {
                return function(result, key) {
                    // skip all variables
                    if (key.charAt(0) == '$' || key.charAt(0) == '@') {
                        return result;
                    }

                    if (key.charAt(0) == '+') {
                        var x= result.concat(repository.findByName(key.substring(1)).updateValues(values)._getConfiguration());
                        return x;
                    }

                    // skip true
                    if (true === content[key]) {
                        return result;
                    }

                    if ("object" === typeof content[key] && null !== content[key]) {
                        return result.concat(Object.keys(content[key]).reduce(filterConfiguration(content[key]), []));
                    }
                    var value = variables.reduce((value, variable) => {
                        return variable.apply(value);
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
