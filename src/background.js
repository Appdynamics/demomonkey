import {createStore} from 'redux'
import reducers from './reducers'


(function(scope) {
    "use strict";

    console.log("running");

    chrome.downloads.onCreated.addListener(function(item) {
        console.log(item);
        chrome.downloads.cancel(item.id);
    });


    chrome.storage.local.get("configurations", function(state) {

        const store = createStore(reducers, state);
        console.log("Background Script started");

        store.subscribe(function() {
            chrome.storage.local.set({configurations: store.getState().configurations});
        });

        var id = chrome.contextMenus.create({
            "title": "Create Replacement",
            "contexts": ["selection"],
            "onclick": function(info, tab) {
                var replacement = prompt("Replacement for \"" + info.selectionText + "\": ");
                var configs = (store.getState().configurations.filter(config => config.enabled));
                if (configs.length > 0) {
                    var config = configs[0];
                    config.content += "\n" + info.selectionText + " = " + replacement;
                    store.dispatch({'type': 'SAVE_CONFIGURATION', 'id': config.id, config});
                }
            }

        });

    });

})(window);
