import ini from 'ini';

export function getVariablesFromIni(iniFile) {

    var content = iniFile
        ? ini.parse(iniFile)
        : [];

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

    return Object.keys(content).reduce(filterVariable(content), []);
}

export function getConfigurationFromIni(iniFile) {

    function buildRegex(word) {

        var escapeRegExp = function(str) {
            return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        }

        var regex = word.match(/^\/(.+)\/([gim]+)?$/)
        var searchPattern = "";
        if (!regex) {
            searchPattern = new RegExp(escapeRegExp(word), "g");
        } else {
            var modifiers = "undefined" !== typeof regex[2]
                ? regex[2] + "g"
                : "g";
            searchPattern = new RegExp(regex[1], modifiers);
        }
        return searchPattern;
    }

    var content = iniFile
        ? ini.parse(iniFile)
        : [];

    // get all variables upfront
    var variables = getVariablesFromIni(iniFile);

    var filterConfiguration = function(content) {
        return function(result, key) {
            // skip all variables
            if (key.charAt(0) == '$') {
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

            result.push([buildRegex(key), value]);

            return result
        }
    }

    return Object.keys(content).reduce(filterConfiguration(content), []);
}
