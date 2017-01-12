import React from 'react';


class NavigationList extends React.Component {
    showItemEditor(event, key) {
        event.preventDefault();
        this.props.actions.setCurrentView(this.props.type+"/"+key)
    }

    showNewEditor(event) {
      event.preventDefault();
      this.props.actions.setCurrentView(this.props.type+"/create")
    }

    render() {
        return (
            <ul>
              <li className="navigation-item create-new-button"><a href={"#"+this.props.type+"/create"} onClick={(event) => this.showNewEditor(event)} >Create New</a></li>
              {Object.keys(this.props.items).map((key, index) => <li className="navigation-item" key={index}><a href={"#"+this.props.type+"/"+key} onClick={(event) => this.showItemEditor(event, key)} >{this.props.items[key].name}</a></li>)}
            </ul>
        )
    }
}

export default NavigationList
