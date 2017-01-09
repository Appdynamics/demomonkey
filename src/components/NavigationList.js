import React from 'react';


class NavigationList extends React.Component {
    showItemEditor(key) {
        this.props.actions.setCurrentView(this.props.type+"/"+key)
    }

    showNewEditor() {
      this.props.actions.setCurrentView(this.props.type+"/create")
    }

    render() {
        return (
            <ul>
              <li><a onClick={() => this.showNewEditor()} className="create-new-button">(Create New)</a></li>
              {Object.keys(this.props.items).map((key, index) => <li onClick={() => this.showItemEditor(key)} key={index}>{this.props.items[key].name}</li>)}
            </ul>
        )
    }
}

export default NavigationList
