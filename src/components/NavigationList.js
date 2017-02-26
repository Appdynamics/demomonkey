import React from 'react';
import GoogleLogin from 'react-google-login';

class NavigationList extends React.Component {
    showItemEditor(event, key) {
        event.preventDefault();
        this.props.actions.setCurrentView(this.props.type+"/"+key)
    }

    showNewEditor(event) {
      event.preventDefault();
      this.props.actions.setCurrentView(this.props.type+"/create")
    }

    showUploadDialog(event) {
      event.preventDefault();
      var upload = document.getElementById("upload");

      upload.addEventListener('change', (event) => {
        var files = event.target.files;
        var reader = new FileReader();
        for(var i = 0; i < files.length; i++) {
          var file = files.item(i);
          console.log(file);
          reader.onloadend = () => {
            var configuration = {
              name: file.name.replace(/.mnky$/, ''),
              content: reader.result,
              test: '',
              enabled: false,
              id: 'new'
            };
            this.props.actions.addConfiguration(configuration);
            this.props.actions.setCurrentView("");
          }
          reader.readAsText(file)
        }
        uploadForm.reset();
      });
      upload.click();
    }

    render() {
        return (
          <div>
            <ul id="navigation-actions">
              <li className="navigation-action"><a href={"#"+this.props.type+"/create"} onClick={(event) => this.showNewEditor(event)} >Create</a></li>
              <li className="navigation-action"><form id="uploadForm"><input multiple id="upload" type="file"/></form><a href={"#"+this.props.type+"/upload"} onClick={(event) => this.showUploadDialog(event)} >Upload</a></li>              
            </ul>
            <ul id="navigation-items">
              {Object.keys(this.props.items).map((key, index) => <li className="navigation-item" key={index}><a href={"#"+this.props.type+"/"+key} onClick={(event) => this.showItemEditor(event, key)} >{this.props.items[key].name}</a></li>)}
            </ul>
          </div>
        )
    }
}

export default NavigationList
