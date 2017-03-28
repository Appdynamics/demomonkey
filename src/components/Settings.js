import React from 'react'

class Settings extends React.Component {
  render() {
    return (
      <div className="content">
        <h1>Settings</h1>
        <div>
          New configuration template:
          <textarea>

          </textarea>
        </div>
        <div>
          <input type="checkbox"> Autosave on <b>Newline</b>
        </div>
      </div>
    )
  }
}

export default Settings
