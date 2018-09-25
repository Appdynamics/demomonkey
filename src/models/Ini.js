import ini from 'ini'
import nunjucks from 'nunjucks'

class Ini {
  constructor(content, repository = {}) {
    this.content = content
    this.templateEnvironment = new nunjucks.Environment({
      async: false,
      getSource: (name, cb) => {
        return {
          src: repository.findByName(name).rawContent
        }
      }
    })
  }

  _renderWithNunjucks(content, templateEngineProperties) {
    try {
      content = this.templateEnvironment.renderString(content, templateEngineProperties.variables)
    } catch (e) {
      console.log(e)
    }
    return content
  }

  parse(templateEngineProperties = {}) {
    var content = this.content

    if (templateEngineProperties.hasOwnProperty('enabled') && templateEngineProperties.enabled) {
      content = this._renderWithNunjucks(content, templateEngineProperties)
    }

    var r = content ? ini.parse(content) : []

    return r
  }
}

export default Ini
