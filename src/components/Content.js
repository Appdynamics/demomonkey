import React from 'react';
import Tabs from './Tabs';
import Pane from './Pane';
import ToggleButton from 'react-toggle-button';
import CodeMirror from 'react-codemirror';
import Welcome from './Welcome';
import ini from 'ini';

require('codemirror/mode/properties/properties');

class Content extends React.Component {

    constructor(props) {
        super(props);
        this.handleNameChange = this.handleNameChange.bind(this);
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

    handleSave(event) {
        event.preventDefault();
        if (this.state.current.id === 'new') {
            this.props.actions.addConfiguration(this.state.current);
            this.props.actions.setCurrentView("");
        } else {
            this.props.actions.saveConfiguration(this.state.current.id, this.state.current);
        }
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
                    enabled: false,
                    id: undefined
                }
            });
            return;
        }

        var id = props.currentView.split('/')[1];
        if (id !== 'create') {
            this.setState({current: props.configurations[id]})
        } else {
            this.setState({
                current: {
                    name: '',
                    content: '; You can write comments using. Sections are optional, but make things more clear.\n' + '[Variables]\n' + '$prospect=AppDynamics//Set the name of your prospect. This will be used to name the application\n' + '$domain=appdynamics.com//Set the main domain of your prospect. This will be used in the User Experience Section\n' + '\n' + '[Application]\n' + '; Write simple replacements like this:\n' + 'Inventory-Services=Self-Service-Portal\n' + '; Insert variables anywhere\n' + 'ECommerce=$prospect Customer Care\n' + 'api.shipping.com=api.$domain\n' + '; Spaces around the = sign are not required, but make the configuration more readable\n' + 'Order-Processing = Invoice-Processing\n',
                    enabled: false,
                    id: 'new'
                }
            })
        }
    }

    componentWillMount() {
        this._setCurrent(this.props);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.currentView != this.props.currentView) {
            this._setCurrent(nextProps)
        }
    }

    render() {

        var toggleButtonVisible = {};

        var current = this.state.current;

        console.log('ID', current.id);

        var visible = typeof current.id !== 'undefined'
            ? {}
            : {
                display: "none"
            };

        var hidden = typeof current.id !== 'undefined'
            ? {
                display: "none"
            }
            : {};

        var hiddenIfNew = current.id === "new"
            ? {
                display: "none"
            }
            : {};

        var options = {
            lineNumbers: true,
            mode: 'properties',
            height: "100%"
        };

        var filterVariable = function(content) {
            return function(result, key) {
              console.log(content[key]);
                // By default ini.parse sets "true" as the value
                if (key.charAt(0) == '$' && content[key] !== true) {
                    var t = content[key].split("//");
                    result.push({
                      name: key.substring(1),
                      placeholder:t[0],
                      description:t[1] ? t[1] : ''
                    });
                    return result;
                } else if ("object" === typeof content[key]) {
                    return result.concat(Object.keys(content[key]).reduce(filterVariable(content[key]), []));
                }
                return result;
            }
        };


        var content = this.state.current.content ? ini.parse(this.state.current.content) : [];
        var variables = Object.keys(content).reduce(filterVariable(content), []);

        console.log(variables);

        return <div id="content">
            <div id="editor" style={visible}>
                <div id="settings">
                    <b>Title:</b>
                    <input type="text" value={this.state.current.name} onChange={this.handleNameChange}/>
                    <button className="save-button" onClick={(event) => this.handleSave(event)}>Save</button>
                    <button className="copy-button" style={hiddenIfNew} onClick={(event) => this.handleDelete(event)}>Duplicate</button>
                    <button className="delete-button" style={hiddenIfNew} onClick={(event) => this.handleDelete(event)}>Delete</button>
                </div>
                <div id="inner-content">
                    <Tabs selected={0}>
                        <Pane label="Variables">
                            {variables.map(function(variable, index) {
                            console.log("VARIABLE", variable);
                            return <div key={index} className="row">
                                <label htmlFor="variable-1">{variable.name}</label><input type="" placeholder={variable.placeholder}/>
                                <div className="help">{variable.description}</div>
                            </div>;
                          })}
                        </Pane>
                        <Pane label="Configuration">
                            <CodeMirror value={current.content} onChange={(content) => this.handleContentChange(content)} options={options}/>
                        </Pane>
                    </Tabs>
                </div>
            </div>
            <div id="welcome" style={hidden}><Welcome/></div>
        </div>;

    }
}

export default Content
