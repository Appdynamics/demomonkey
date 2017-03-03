import React from 'react'
import Json2Ini from '../models/Json2Ini'

class ConfigurationUpload extends React.Component {
  static propTypes = {
    id: React.PropTypes.string.isRequired,
    type: React.PropTypes.string.isRequired,
    actions: React.PropTypes.objectOf(React.PropTypes.func).isRequired
  }

  getIni(result, extension) {
    switch (extension) {
      case 'json':
        return Json2Ini.parse(result)
      default:
        return result
    }
  }

  showUploadDialog(event) {
    event.preventDefault()
    var upload = document.getElementById(this.props.id)
    var uploadForm = document.getElementById(this.props.id + 'Form')

    upload.addEventListener('change', (event) => {
      var files = event.target.files
      var reader = new window.FileReader()
      for (var i = 0; i < files.length; i++) {
        var file = files.item(i)
        reader.onloadend = () => {
          var extension = file.name.split('.').pop()
          if (extension === 'mnky' || extension === 'ini' || extension === 'json') {
            var configuration = {
              name: file.name.replace(new RegExp('\\.' + extension + '$'), ''),
              content: this.getIni(reader.result, extension),
              test: '',
              enabled: false,
              id: 'new'
            }
            this.props.actions.addConfiguration(configuration)
            this.props.actions.setCurrentView('')
          } else {
            window.alert('Unknown extension: ' + extension + '! Please specify a .mnky or .json file!')
          }
        }
        reader.readAsText(file)
      }
      uploadForm.reset()
    })
    upload.click()
  }

  render() {
    return <div>
            <form id={this.props.id + 'Form'}>
                <input multiple id={this.props.id} type="file"/>
            </form>
            <a href={'#' + this.props.type + '/upload'} onClick={(event) => this.showUploadDialog(event)}>
                Upload
            </a>
        </div>
  }
}

export default ConfigurationUpload
