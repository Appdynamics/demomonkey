window['adrum-app-key'] = 'AD-AAB-AAE-VCF';
window['adrum-config'] = {
  spa: {
    "spa2": true
  },
  adrumExtUrlHttp: 'https://cdn.appdynamics.com',
  beaconUrlHttp: 'https://col.eum-appdynamics.com',
  userEventInfo: {
    PageView: function(context) {
      return {
        userData: {
          'version': window.chrome.runtime.getManifest().version,
          'extension-id': window.chrome.runtime.id,
          'monkey-id': window.store.state.monkeyID
        },
        userDataLong: {
          'configurations': window.store.state.configurations.length
        },
        userDataBoolean: window.store.state.settings.optionalFeatures
      }
    },
    VPageView: function(context) {
      return {
        userData: {
          'version': window.chrome.runtime.getManifest().version,
          'extension-id': window.chrome.runtime.id,
          'monkey-id': window.store.state.monkeyID
        },
        userDataLong: {
          'configurations': window.store.state.configurations.length
        },
        userDataBoolean: window.store.state.settings.optionalFeatures
      }
    }
  }
}
