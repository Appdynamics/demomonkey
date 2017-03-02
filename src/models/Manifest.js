/* global chrome */

class Manifest {
  authorMail() {
    return chrome.runtime.getManifest().author.split('<')[1]
  }

  authorName() {
    return chrome.runtime.getManifest().author.split('<')[0]
  }

  author() {
    return <a href={'mailto:' + this.authorMail()}>{this.authorName()}</a>
  }

  url() {
    return chrome.runtime.getManifest().homepage_url
  }

  homepage() {
    return <a href={this.url()} target="_blank">{this.url()}</a>
  }

  version() {
    return chrome.runtime.getManifest().version
  }
}

export default Manifest
