window['adrum-app-key'] = 'EUM-AAB-AVB';
window['adrum-config'] = {
  adrumExtUrlHttp: 'https://cdn.appdynamics.com',
  beaconUrlHttp: 'https://eum.appd.duckdns.org',
  userEventInfo: {
    PageView: function (context) {
      console.log('PageView')
      return {
        userData: {
          'version': window.chrome.runtime.getManifest().version,
          'extension-id': window.chrome.runtime.id
        }
      }
    },
    VPageView: function (context) {
      console.log('VPageView')
      return {
        userData: {
          'version': window.chrome.runtime.getManifest().version,
          'extension-id': window.chrome.runtime.id
        }
      }
    }
  }
}
