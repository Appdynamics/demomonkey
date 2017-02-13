import tamper from './functions/tamper';
import {getVariablesFromIni, getConfigurationFromIni} from './functions/configuration'

(function(scope) {
    "use strict";

    var intervals = [];

    function enable(configuration) {
        return setInterval(function() {
        var text, texts = scope.document.evaluate('//body//text()[ normalize-space(.) != ""]', document, null, 6, null);
        for (var i = 0; (text = texts.snapshotItem(i)) !== null; i += 1) {
            tamper(text, configuration, "data");
        }

        tamper(scope.document, configuration, "title");

      }, 100);
    }

    function runAll(configurations) {
        return configurations.reduce(function(result, configuration) {
            if (!configuration.enabled) {
                // TODO: Terminate Interval if running
                return result;
            }

            result.push(enable(getConfigurationFromIni(configuration.content)));

            return result;

        }, []);
    }

    console.log("DemoMonkey enabled. Tampering the content.")

    chrome.storage.local.get("configurations", function(storage) {
        intervals = runAll(storage.configurations);
    });

    chrome.storage.onChanged.addListener(function(changes, namespace) {
        if (namespace === "local") {
          // Currently we don't check the changes, we just reset everything
          console.log(changes);
          intervals.forEach(function(interval) { clearInterval(interval); });
          intervals = runAll(changes.configurations.newValue);
        }
    });

})(window);
