import ini from 'ini'
import nunjucks from 'nunjucks'

class Ini {
  constructor(content) {
    this.content = content
  }

  parse(templateEngineProperties = {}) {
    var content = this.content
    if (templateEngineProperties.hasOwnProperty('enabled') && templateEngineProperties.enabled) {
      try {
        content = nunjucks.renderString(this.content, templateEngineProperties.variables) // .replace('\\=', '\u207c')
      } catch (e) {
        // If rendering the string fails we just use the plain ini file content
      }
    }
    var r = this.content ? ini.parse(content) : []
    return r
  }
}

export default Ini
