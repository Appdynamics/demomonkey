import React from 'react'

class Gallery extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoaded: false,
      result: [],
      error: null
    }
  }

  componentDidMount() {
    fetch('http://localhost:17485/configuration/shared')
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            items: result
          })
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            isLoaded: true,
            error
          })
        }
      )
  }

  _renderGallery() {
    const { error, isLoaded, items } = this.state
    if (error) {
      return <div>Error: {error.message}</div>
    }
    if (!isLoaded) {
      return <div>Loading...</div>
    }
    return (
      <ul>
        {items.map(item => (
          <li key={item.name}>
            {item.name}
          </li>
        ))}
      </ul>
    )
  }

  render() {
    return (
      <div className="content">
        <div className="gallery">
          <h1>Gallery</h1>
          {this._renderGallery()}
        </div>
      </div>)
  }
}

export default Gallery
