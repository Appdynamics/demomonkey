import React from 'react';
import Tabs from './Tabs';
import Pane from './Pane';
import ToggleButton from 'react-toggle-button';
import CodeMirror from 'react-codemirror';
import Variable from './Variable';
import Repository from '../models/Repository';
import Welcome from './Welcome';
import ini from 'ini';
import tamper from '../functions/tamper';
import Configuration from '../models/Configuration'

require('codemirror/mode/properties/properties');
require('codemirror/addon/edit/trailingspace');

class Content extends React.Component {

    constructor(props) {
        super(props);
        this.handleNameChange = this.handleNameChange.bind(this);
        this.handleTestChange = this.handleTestChange.bind(this);
        this.updateVariable = this.updateVariable.bind(this);
    }

    handleNameChange(event) {
        this.setState({
            current: {
                ...this.state.current,
                name: event.target.value
            }
        });
    }

    handleContentChange(content) {
        this.setState({
            current: {
                ...this.state.current,
                content: content
            }
        });
    }

    updateVariable(name, value) {
        var values = this.state.current.values ? this.state.current.values : {};

        values[name] = value;

        this.setState({
            current: {
                ...this.state.current,
                values: values
            }
        });
    }

    handleTestChange(event) {
        this.setState({
            current: {
                ...this.state.current,
                test: event.target.value
            }
        });
    }

    handleSave(event) {
        event.preventDefault();

        if (this.state.current.id === 'new') {
            this.props.actions.addConfiguration(this.state.current);
            this.props.actions.setCurrentView("configuration/latest");
        } else {
            this.props.actions.saveConfiguration(this.state.current.id, this.state.current);
        }
    }

    handleCopy(event) {
        event.preventDefault();
        var copy = Object.assign({}, this.state.current);
        copy.name = "Copy of " + copy.name;
        copy.id = "new";
        this.props.actions.addConfiguration(copy);
        this.props.actions.setCurrentView("configuration/latest");
    }

    handleDownload(event) {
        event.preventDefault();
        chrome.downloads.download({
            url: "data:text/octet-stream;base64," + btoa(this.state.current.content),
            filename: this.state.current.name + ".mnky" // Optional
        });
    }

    handleDelete(event) {
        event.preventDefault();
        this.props.actions.setCurrentView("");
        this.props.actions.deleteConfiguration(this.state.current.id)
    }

    toggleEnabled() {
        this.props.actions.toggleConfiguration(this.state.current.id)
    }

    _setCurrent(props) {
        if (props.currentView === '') {
            this.setState({
                current: {
                    name: '',
                    content: '',
                    values: {},
                    test: '',
                    enabled: false,
                    id: undefined
                }
            });
            return;
        }

        var id = props.currentView.split('/')[1];

        if (id === 'latest') {
            var latestId = props.configurations.length - 1;
            this.setState({current: props.configurations[latestId]});
            this.props.actions.setCurrentView("configuration/" + latestId);
            return;
        }

        if (id !== 'create') {
            this.setState({current: props.configurations[id]});
            return;
        }

        this.setState({
            current: {
                name: '',
                content: require('../../examples/one.mnky'),
                values: {},
                test: 'Inventory-Services\nCart\nCART',
                enabled: false,
                id: 'new'
            }
        });
    }

    componentWillMount() {
        this._setCurrent(this.props);
    }

    getRepository() {
      var configurations = this.props.configurations.reduce(function(repo, rawConfig) {
          repo[rawConfig.name] = new Configuration(rawConfig.content);
          return repo;
      }, {})

      return new Repository(configurations);
    }

    componentDidMount() {
        setInterval(() => {
          var node = document.getElementById("testarea");
          var configuration = new Configuration(this.state.current.content, this.getRepository(), true, this.state.current.values);

          if (node) {
              configuration.apply(node);
          }
        }, 150);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.currentView != this.props.currentView) {
            this._setCurrent(nextProps)
        }
    }

    render() {

        var toggleButtonVisible = {};

        var current = this.state.current;

        var visible = {};
        var hidden = {
            display: "none"
        };

        if (typeof current.id === 'undefined') {
            visible = hidden;
            hidden = {};
        }

        var hiddenIfNew = current.id === "new"
            ? {
                display: "none"
            }
            : {};

        var options = {
            lineNumbers: true,
            mode: 'properties',
            height: "100%",
            showTrailingSpace: true
        };

        var variables = (new Configuration(this.state.current.content, this.getRepository(), false, this.state.current.values)).getVariables()

        return <div id="content">
            <div id="editor" style={visible}>
                <div id="settings">
                    <b>Title:</b>
                    <input type="text" value={this.state.current.name} onChange={this.handleNameChange}/>
                    <button className="save-button" onClick={(event) => this.handleSave(event)}>Save</button>
                    <button className="copy-button" style={hiddenIfNew} onClick={(event) => this.handleCopy(event)}>Duplicate</button>
                    <button className="download-button" style={hiddenIfNew} onClick={(event) => this.handleDownload(event)}>Download</button>
                    <button className="delete-button" style={hiddenIfNew} onClick={(event) => this.handleDelete(event)}>Delete</button>
                </div>
                <div id="inner-content">
                    <Tabs selected={0}>
                        <Pane label="Variables">
                            {variables.length > 0
                                ? ""
                                : <div className="no-variables">No variables defined</div>}
                            {variables.map((variable, index) => {
                                return <Variable key={variable.name} onValueUpdate={(name, value) => this.updateVariable(name, value)} variable={variable}/>
                            })}
                        </Pane>
                        <Pane label="Configuration">
                            <CodeMirror value={current.content} onChange={(content) => this.handleContentChange(content)} options={options}/>
                        </Pane>
                        <Pane label="Testing">
                            <textarea value={current.test} style={{
                                width: "100%",
                                height: "50%"
                            }} onChange={this.handleTestChange}/>
                            <textarea value={current.test} id="testarea" readOnly="readOnly" style={{
                                width: "100%",
                                height: "50%"
                            }}/>
                        </Pane>
                    </Tabs>
                </div>
            </div>
            <div id="welcome" style={hidden}><Welcome/></div>
        </div>;

    }
}

export default Content
