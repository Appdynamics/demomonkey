import tamper from './functions/tamper';
import {getVariablesFromIni, getConfigurationFromIni} from './functions/configuration'

(function(scope) {
    "use strict";

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
        configurations.forEach(function(configuration) {
            if (!configuration.enabled) {
                // TODO: Terminate Interval if running
                return;
            }

            enable(getConfigurationFromIni(configuration.content));

        });
    }

    console.log("DemoMonkey enabled. Tampering the content.")

    chrome.storage.local.get("configurations", function(storage) {
        runAll(storage.configurations);
    });

    chrome.storage.onChanged.addListener(function(changes, namespace) {
        if (namesapce === local) {
            console.log(changes, namespace);
        }
    });

})(window);
