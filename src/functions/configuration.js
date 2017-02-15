import ini from 'ini';

export function getOptionsFromIni(iniFile) {
  var content = iniFile
      ? ini.parse(iniFile)
      : [];
      var filterOption = function(content) {
          return function(result, key) {
              // By default ini.parse sets "true" as the value
              if (key.charAt(0) == '@' && content[key] !== true) {

                  var value = content[key];

                  if("string" === typeof value) {
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

      return Object.keys(content).reduce(filterOption(content), {});
}

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

    function buildRegex(search, replace) {

        var escapeRegExp = function(str) {
            return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        }

        var regex = search.match(/^\/(.+)\/([gimp]+)?$/)

        if (!regex) {
            return [new RegExp(escapeRegExp(search), "g"), replace];
        }

        var modifiers = "undefined" !== typeof regex[2]
            ? regex[2] + "g"
            : "g";

        if(modifiers.includes("p")) {
          return [new RegExp(regex[1], modifiers.replace("p", "")), function(match) {
              console.log(match);
              if(match.toUpperCase() === match) {
                  replace = replace.toUpperCase();
              }
              if(match.toLowerCase() === match) {
                  replace = replace.toLowerCase();
              }
              return match.replace(new RegExp(regex[1], modifiers.replace("p", "")), replace);
          }];
        }

        return [new RegExp(regex[1], modifiers), replace];
    }

    var content = iniFile
        ? ini.parse(iniFile)
        : [];

    // get all variables upfront
    var variables = getVariablesFromIni(iniFile);

    var filterConfiguration = function(content) {
        return function(result, key) {
            // skip all variables
            if (key.charAt(0) == '$' || key.charAt(0) == '@') {
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

            result.push(buildRegex(key, value));

            return result
        }
    }

    return Object.keys(content).reduce(filterConfiguration(content), []);
}
