import React from 'react'
import VariableModle from '../models/Variable'

class Variable extends React.Component {
  static propTypes = {
    onValueUpdate: React.PropTypes.func.isRequired,
    variable: React.PropTypes.instanceOf(VariableModle)
  }

  updateVariable(event) {
    event.preventDefault()
    this.props.onValueUpdate(event.target.name, event.target.value)
  }

  render() {
    return <div className="variable-box">
            <label htmlFor="variable-1">{this.props.variable.name}</label>
            <input name={this.props.variable.name} type="text" onChange={(event) => this.updateVariable(event)} placeholder={this.props.variable.placeholder} defaultValue={this.props.variable.value}/>
            <div className="help">{this.props.variable.description}</div>
        </div>
  }
}

export default Variable
