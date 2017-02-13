import React from 'react'
import Tabs from './Tabs'
import Pane from './Pane'
import Manifest from './Manifest'
import {connect} from 'react-redux'
import ToggleButton from 'react-toggle-button'

class ToggleConfiguration extends React.Component {
    toggle(id) {
      this.props.actions.toggleConfiguration(id)
    }

    openEditor(event, id) {
      event.preventDefault();
      chrome.runtime.openOptionsPage(function() {
        chrome.runtime.sendMessage({
          receiver: "options",
          anchor: "configuration/"+id
        });
      });
    }

    render() {
        return <div style={{
            display: "flex"
        }}>
            <ToggleButton value={ this.props.configuration.enabled } onToggle={() => {this.toggle(this.props.configuration.id)}}/>
            <div style={{
                margin: "8px"
            }}><a href="#" onClick={(event) => this.openEditor(event, this.props.index)}>{this.props.configuration.name}</a></div>
        </div>
    }
}

const manifest = new Manifest();

const App = ({configurations, currentView, actions}) => (
    <div>
        <Tabs>
            <Pane label="Apply">
                {configurations.map( (configuration, index) => (
                  <ToggleConfiguration key={configuration.id} index={index} actions={actions} configuration={configuration}/>
                ))}
            </Pane>
            <Pane label="Help">
                <div>
                    <b>Author: </b>
                    {manifest.author()}
                </div>
                <div>
                    <b>Homepage: </b>
                    {manifest.homepage()}
                </div>
                <div>
                    <b>Version: </b>
                    {manifest.version()}
                </div>
            </Pane>
            <Pane link={(e) => {
                e.preventDefault();
                chrome.runtime.openOptionsPage()
            }} label="Dashboard"/>
        </Tabs>
    </div>
)

const PopupPageApp = connect(
// map state to props
state => {
    return {configurations: state.configurations}
},
// map dispatch to props
dispatch => ({
    actions: {
      toggleConfiguration: (id) => {
          dispatch({'type': 'TOGGLE_CONFIGURATION', id: id})
        }
    }
}))(App);

export default PopupPageApp
