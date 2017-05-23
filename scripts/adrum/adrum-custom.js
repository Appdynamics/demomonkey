window['adrum-config'] = {
  userEventInfo: {
    PageView: function (context) {
      console.log('PageView')
      return {
        userData: {
          version: window.chrome.runtime.getManifest().version,
          'extension-id': window.chrome.runtime.id
        }
      }
    },
    VPageView: function (context) {
      console.log('VPageView')
      return {
        userData: {
          version: window.chrome.runtime.getManifest().version,
          'extension-id': window.chrome.runtime.id
        }
      }
    }
  }
}
